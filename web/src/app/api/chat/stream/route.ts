import { streamText, type ModelMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  buildSystemPrompt,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOKENS,
} from "@/lib/anthropic";
import {
  getActiveBrandMemory,
  buildBrandMemoryPrompt,
} from "@/lib/brand-memory";
import { saveMessage } from "@/lib/services/conversation-service";
import { runDDPNextPipeline } from "@/lib/ddp-next";
import type { DDPNextInput } from "@/lib/ddp-next";
import { prisma } from "@/lib/db";
import { ChatStreamInputSchema, parseBody } from "@/lib/api-validators";
import { checkRateLimit, AI_RATE_LIMIT, rateLimitResponse } from "@/lib/rate-limiter";
import { apiErrorResponse } from "@/lib/api-error";
import { createLogger } from "@/lib/logger";

const log = createLogger("Stream API");

// Next.js Route Segment Config — allow long-running streaming responses
export const maxDuration = 300; // 5 minutes

type TextContent = { type: "text"; text: string };
type ImageContent = {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    data: string;
  };
};
type ContentBlock = TextContent | ImageContent;

interface IncomingMessage {
  role: string;
  content: string | ContentBlock[];
}

// Extract text from message content (for DB storage)
function extractText(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((b): b is TextContent => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// ── SSE (Server-Sent Events) ヘルパー ──
// フロントエンドの useChat は data: JSON\n\n 形式を期待する

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
} as const;

class SSEWriter {
  private encoder = new TextEncoder();
  private controller: ReadableStreamDefaultController;
  private closed = false;
  /** ストリーム中に送った全テキストを蓄積 */
  public accumulated = "";

  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  get isClosed() {
    return this.closed;
  }

  /** テキストチャンクを content_delta イベントとして送信 */
  sendText(text: string) {
    if (this.closed) return;
    this.accumulated += text;
    this._write(`data: ${JSON.stringify({ type: "content_delta", text })}\n\n`);
  }

  /** エラーイベント送信 */
  sendError(message: string, retryable = false) {
    if (this.closed) return;
    this._write(`data: ${JSON.stringify({ type: "error", message, retryable })}\n\n`);
  }

  /** 完了イベント送信 */
  sendDone(extra?: { model?: string; usage?: unknown; incomplete?: boolean }) {
    if (this.closed) return;
    this._write(
      `data: ${JSON.stringify({ type: "done", content: this.accumulated, ...extra })}\n\n`,
    );
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    try { this.controller.close(); } catch { /* already closed */ }
  }

  private _write(chunk: string) {
    if (this.closed) return;
    try {
      this.controller.enqueue(this.encoder.encode(chunk));
    } catch {
      this.closed = true;
    }
  }
}

export async function POST(request: Request) {
  // Rate limiting (IP-based)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`chat:${ip}`, AI_RATE_LIMIT);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const rawBody = await request.json();
    const parsed = parseBody(ChatStreamInputSchema, rawBody);
    if (!parsed.success) return parsed.response;
    const { messages, conversationId, pageType, urlAnalysis } = parsed.data;

    // Save user message to DB if conversationId provided
    const lastUserMsg = messages[messages.length - 1] as IncomingMessage;
    if (conversationId && lastUserMsg?.role === "user") {
      try {
        await saveMessage(
          conversationId,
          "user",
          extractText(lastUserMsg.content),
        );
      } catch (e) {
        log.error("[Stream API] Failed to save user message:", e);
      }
    }

    // === Design Engine ===
    const latestUserText = extractText(lastUserMsg.content);
    const conversationTexts = (messages as IncomingMessage[])
      .filter((m) => m.role === "user")
      .map((m) => ({
        role: m.role,
        content: extractText(m.content),
      }));

    // ── Enhance モード: 既存ページに紐づく会話か判定 ──
    let linkedPage: { id: string; title: string; html: string; css: string; pageType: string } | null = null;
    if (conversationId) {
      try {
        const page = await prisma.page.findFirst({
          where: { conversationId },
          select: { id: true, title: true, html: true, css: true, pageType: true },
        });
        if (page && page.html) {
          linkedPage = page;
          log.info("[Stream API] Enhance mode: linked page found", {
            pageId: page.id,
            title: page.title,
            pageType: page.pageType,
            htmlLength: page.html.length,
          });
        }
      } catch (e) {
        log.error("[Stream API] Failed to lookup linked page:", e);
      }
    }

    // ── ページ生成リクエストかどうか判定 ──
    // Enhance モードの場合は常にページ生成として扱う
    const isPageGenerationRequest = linkedPage
      ? true
      : detectPageGenerationRequest(latestUserText, pageType);

    // ── DDP Next パイプライン（唯一のデザインエンジン） ──
    // DDP Next: 人が評価した部品をAIが組み立てるキュレーション型エンジン
    // AI使用は Phase 4（コピーライティング）のみ — 高速・低コスト・高品質
    if (isPageGenerationRequest) {
      log.info("[Stream API] Using DDP pipeline for page generation");

      const isSiteBuildRequest = detectSiteBuildRequest(latestUserText);

      // Brand Memory + Emotional DNA 取得
      let brandMemoryData;
      let emotionalDnaData;
      try {
        const bm = await getActiveBrandMemory();
        if (bm) {
          brandMemoryData = {
            brandName: bm.brandName || undefined,
            industry: bm.industry || undefined,
            tones: bm.tones || undefined,
            primaryColor: bm.primaryColor,
            secondaryColor: bm.secondaryColor,
            accentColor: bm.accentColor,
            primaryFont: bm.primaryFont,
            bodyFont: bm.bodyFont,
            voiceTone: bm.voiceTone,
            copyKeywords: bm.copyKeywords,
            avoidKeywords: bm.avoidKeywords,
          };
          // Emotional DNA（感情の地層）を抽出
          if (bm.emotionalDna) {
            emotionalDnaData = bm.emotionalDna;
          }
        }
      } catch { /* non-fatal */ }

      // DDPNextInput 構築
      const detectedPageType = isSiteBuildRequest ? "landing" : (linkedPage?.pageType || pageType || "landing");
      const detectedIndustry = brandMemoryData?.industry || detectIndustry(latestUserText) || "general";
      const userInstructions = linkedPage
        ? `【既存ページ改善モード】\nページ「${linkedPage.title}」を改善してください。\n既存のコンテンツを活かしつつ、デザインとUXを向上させてください。\n\nユーザーの指示: ${latestUserText}`
        : latestUserText;

      const store = await prisma.store.findFirst({ orderBy: { updatedAt: "desc" } }).catch(() => null);
      const ddpNextInput: DDPNextInput = {
        pageType: detectedPageType as any,
        industry: detectedIndustry as any,
        brandName: brandMemoryData?.brandName || undefined,
        tones: (brandMemoryData?.tones || ["modern"]) as any[],
        userInstructions,
        urlAnalysis: urlAnalysis as any,
        brandMemory: brandMemoryData ? {
          brandName: brandMemoryData.brandName,
          industry: detectedIndustry,
          tones: brandMemoryData.tones || ["modern"],
          colors: {
            primary: brandMemoryData.primaryColor,
            secondary: brandMemoryData.secondaryColor,
            accent: brandMemoryData.accentColor,
          },
          fonts: [brandMemoryData.primaryFont, brandMemoryData.bodyFont].filter(Boolean),
        } : undefined,
        emotionalDna: emotionalDnaData || undefined,
        storeId: store?.id,
      };

      // ── SSE ストリームを先に開き、DDP Next 進捗をリアルタイムで送信 ──
      const stream = new ReadableStream({
        async start(controller) {
          const sse = new SSEWriter(controller);
          const modelId = DEFAULT_MODEL || "claude-sonnet-4-20250514";

          try {
            // 開始メッセージ
            if (isSiteBuildRequest) {
              sse.sendText("承知しました！サイト全体を構築していきますね。\n\n");
              sse.sendText("まずはトップページから作成していきます。\n\n");
            }

            // ── DDP Next（キュレーション型エンジン）でページ生成 ──
            sse.sendText("🎨 テンプレートからデザインを選定中...\n\n");
            const nextResult = await runDDPNextPipeline(ddpNextInput, (event) => {
              if (sse.isClosed) return;
              if (event.phase === "compose") {
                sse.sendText("🧩 最適なセクションを組み合わせ中...\n");
              } else if (event.phase === "personalize") {
                sse.sendText("✍️ コンテンツをパーソナライズ中...\n");
              } else if (event.phase === "done") {
                sse.sendText("✅ デザイン完成\n\n");
              }
            });

            if (!nextResult?.fullDocument) {
              throw new Error("ページの生成に失敗しました");
            }

            sse.sendText(`---PAGE_START---\n`);
            sse.sendText(nextResult.fullDocument);
            sse.sendText(`\n---PAGE_END---\n`);

            if (isSiteBuildRequest) {
              sse.sendText(`\nトップページが完成しました！プレビューでご確認ください。\n\n`);
              sse.sendText(`続けて他のページも作成できます。例えば：\n`);
              sse.sendText(`・「コレクションページを作成してください」\n`);
              sse.sendText(`・「商品詳細ページを作成してください」\n`);
              sse.sendText(`・「ブランドストーリーページを作成してください」\n\n`);
              sse.sendText(`どのページを次に作成しましょうか？`);
            }

            sse.sendDone({ model: modelId });
            sse.close();

            // DB保存
            if (conversationId) {
              try {
                await saveMessage(conversationId, "assistant", sse.accumulated, { model: modelId });
                if (linkedPage) {
                  await prisma.page.update({
                    where: { id: linkedPage.id },
                    data: { html: nextResult.html, css: nextResult.css, status: "draft", version: { increment: 1 } },
                  });
                } else {
                  await prisma.page.create({
                    data: {
                      title: `Aicata生成ページ (${nextResult.templateId})`,
                      slug: "",
                      html: nextResult.html,
                      css: nextResult.css,
                      status: "draft",
                      source: "aicata",
                      version: 1,
                      conversationId,
                      pageType: detectedPageType || "landing",
                    },
                  });
                }
              } catch (e) {
                log.error("[Stream API] Failed to save page:", e);
              }
            }
          } catch (err) {
            log.error("[Stream API] DDP Next failed:", err);
            sse.sendError(
              "ページ生成に失敗しました。しばらく時間をおいて再度お試しください。",
              true,
            );
            sse.close();

            if (conversationId && sse.accumulated) {
              try {
                await saveMessage(conversationId, "assistant", sse.accumulated, { model: modelId });
              } catch (e) {
                log.error("[Stream API] Failed to save error message:", e);
              }
            }
          }
        },
        cancel() { /* aborted by client */ },
      });

      return new Response(stream, { headers: SSE_HEADERS });
    }

    // ── 非ページ生成リクエスト: チャット応答（Vercel AI SDK ストリーミング） ──

    let systemPrompt: string;
    let designContext;
    let isGen3 = false;

    // ── Enhance モード: 既存HTMLを含む特別なプロンプト ──
    if (linkedPage) {
      log.info("[Stream API] Building enhance system prompt for page:", linkedPage.id);
      systemPrompt = buildEnhanceSystemPrompt(linkedPage);
      designContext = null;
      isGen3 = false;
    } else {
      try {
        const result = buildSystemPrompt(
          latestUserText,
          conversationTexts,
          urlAnalysis,
          pageType,
        );
        systemPrompt = result.prompt;
        designContext = result.context;
        isGen3 = result.gen3;
        log.info(`[Design Engine ${isGen3 ? "Gen-3" : "Gen-2"}]`, {
          industry: designContext.industry,
          pageType: designContext.pageType,
          tones: designContext.tones,
          ...(pageType ? { explicitPageType: pageType } : {}),
          ...(urlAnalysis ? { urlAnalysisIncluded: true } : {}),
          ...(result.gen3 ? { templateId: result.selectedTemplate?.id } : {}),
          promptLength: systemPrompt.length,
        });
      } catch (e) {
        log.error("[Design Engine] Prompt composition failed:", e);
        systemPrompt =
          "あなたはAicata — ShopifyストアのAIページビルダーです。ユーザーの要望に応じてHTML+CSSでページを生成してください。生成コードは ---PAGE_START--- と ---PAGE_END--- で囲んでください。HTMLを先に、最後に<style>タグでCSSをまとめてください。";
        designContext = null;
      }
    }

    // ── Brand Memory 注入 ──
    try {
      const brandMemory = await getActiveBrandMemory();
      if (brandMemory) {
        const brandPrompt = buildBrandMemoryPrompt(brandMemory);
        if (brandPrompt) {
          systemPrompt = `${systemPrompt}\n\n${brandPrompt}`;
          log.debug("[Brand Memory] Injected into prompt:", {
            brandName: brandMemory.brandName,
            industry: brandMemory.industry,
            hasColors: !!brandMemory.primaryColor,
            hasFonts: !!brandMemory.primaryFont,
            pageCount: brandMemory.pageCount,
          });
        }
      }
    } catch (e) {
      log.warn("[Brand Memory] Failed to inject:", e);
    }

    // Build AI SDK messages — convert multi-modal content
    const aiMessages = (messages as IncomingMessage[]).map(
      (msg): ModelMessage => {
        if (typeof msg.content === "string") {
          return {
            role: msg.role as "user" | "assistant",
            content: msg.content,
          } as ModelMessage;
        }
        // Handle multi-modal content (images + text)
        return {
          role: msg.role as "user",
          content: msg.content.map((block) => {
            if (block.type === "text") {
              return { type: "text" as const, text: block.text };
            }
            // Convert base64 image to AI SDK format
            return {
              type: "image" as const,
              image: block.source.data,
              mimeType: block.source.media_type,
            };
          }),
        } as ModelMessage;
      },
    );

    // Resolve the model identifier for @ai-sdk/anthropic
    const modelId = DEFAULT_MODEL || "claude-sonnet-4-20250514";

    // Enhance モードでは既存HTML全体を再出力するため、トークン上限を引き上げ
    const maxTokens = linkedPage
      ? Math.max(DEFAULT_MAX_TOKENS, 32768)
      : DEFAULT_MAX_TOKENS;

    log.info("[Stream API] Calling Claude via Vercel AI SDK...", {
      model: modelId,
      maxOutputTokens: maxTokens,
      messageCount: aiMessages.length,
      systemPromptLength: systemPrompt.length,
      enhanceMode: !!linkedPage,
    });

    // === Vercel AI SDK streamText → SSE ストリーム変換 ===
    const aiResult = streamText({
      model: anthropic(modelId),
      system: systemPrompt,
      messages: aiMessages,
      maxOutputTokens: maxTokens,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const sse = new SSEWriter(controller);

        try {
          // textStream を SSE content_delta イベントに変換
          for await (const chunk of aiResult.textStream) {
            if (sse.isClosed) break;
            sse.sendText(chunk);
          }

          // usage情報を取得
          const usage = await aiResult.usage;
          const hasPageMarker = sse.accumulated.includes("---PAGE_START---");
          const isIncomplete = hasPageMarker && !sse.accumulated.includes("---PAGE_END---");

          sse.sendDone({
            model: modelId,
            usage,
            incomplete: isIncomplete,
          });
        } catch (err) {
          log.error("[Stream API] Stream error:", err);
          sse.sendError(
            err instanceof Error ? err.message : "ストリーミングエラー",
            true,
          );
        } finally {
          sse.close();
        }

        // ── Post-stream: DB保存 & 後処理 ──
        const fullText = sse.accumulated;
        log.info("[Stream API] Stream completed:", { contentLength: fullText.length });

        // Save assistant message to DB
        if (conversationId && fullText) {
          try {
            await saveMessage(conversationId, "assistant", fullText, {
              model: modelId,
            });
          } catch (e) {
            log.error("[Stream API] Failed to save assistant message:", e);
          }
        }

        // ── Enhance モード: 生成されたHTMLをページに自動保存 ──
        if (linkedPage && fullText.includes("---PAGE_START---")) {
          try {
            const startMarker = "---PAGE_START---";
            const endMarker = "---PAGE_END---";
            const startIdx = fullText.indexOf(startMarker) + startMarker.length;
            const endIdx = fullText.indexOf(endMarker);
            if (endIdx > startIdx) {
              const generatedBlock = fullText.slice(startIdx, endIdx).trim();
              // HTML と CSS を分離（W-2修正: /gi で全 style タグを matchAll）
              const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
              const styleMatches = [...generatedBlock.matchAll(styleRegex)];
              const css = styleMatches.map((m) => m[1].trim()).join("\n");
              // W-1修正: html フィールドには style 除去後のHTMLを保存し重複を防ぐ
              const htmlOnly = generatedBlock.replace(styleRegex, "").trim();

              await prisma.page.update({
                where: { id: linkedPage.id },
                data: {
                  html: htmlOnly,
                  css: css || linkedPage.css,
                  updatedAt: new Date(),
                },
              });
              log.info("[Stream API] Enhanced page HTML auto-saved", {
                pageId: linkedPage.id,
                htmlLength: htmlOnly.length,
                cssLength: css.length,
              });
            }
          } catch (e) {
            log.error("[Stream API] Failed to auto-save enhanced page:", e);
          }
        }

        // ── Enhance モード 続き生成: PAGE_START なしで HTML/CSS の続きが来た場合 ──
        // 前の生成が中断され、ユーザーが「続きを生成」した場合
        if (linkedPage && !fullText.includes("---PAGE_START---") && fullText.includes("---PAGE_END---")) {
          try {
            // 前のメッセージから中断されたHTMLを取得
            const prevMessages = await prisma.message.findMany({
              where: { conversationId: conversationId! },
              orderBy: { createdAt: "desc" },
              take: 5,
            });
            const prevAssistant = prevMessages.find(
              (m: { role: string; content: string }) => m.role === "assistant" && m.content.includes("---PAGE_START---") && !m.content.includes("---PAGE_END---"),
            );
            if (prevAssistant) {
              const startMarker = "---PAGE_START---";
              const partialContent = prevAssistant.content.slice(
                prevAssistant.content.indexOf(startMarker) + startMarker.length,
              );
              // 続きの内容から PAGE_END までを抽出
              const endIdx = fullText.indexOf("---PAGE_END---");
              const continuationContent = endIdx >= 0 ? fullText.slice(0, endIdx).trim() : fullText.trim();
              const mergedBlock = (partialContent + "\n" + continuationContent).trim();

              const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
              const styleMatches = [...mergedBlock.matchAll(styleRegex)];
              const css = styleMatches.map((m) => m[1].trim()).join("\n");
              const htmlOnly = mergedBlock.replace(styleRegex, "").trim();

              if (htmlOnly) {
                await prisma.page.update({
                  where: { id: linkedPage.id },
                  data: {
                    html: htmlOnly,
                    css: css || linkedPage.css,
                    updatedAt: new Date(),
                  },
                });
                log.info("[Stream API] Continuation merged and saved", {
                  pageId: linkedPage.id,
                  htmlLength: htmlOnly.length,
                  cssLength: css.length,
                });
              }
            }
          } catch (e) {
            log.error("[Stream API] Failed to merge continuation:", e);
          }
        }

        // ── Brand Memory: ページ生成から学習 ──
        if (designContext && fullText.includes("---PAGE_START---")) {
          try {
            await fetch(
              new URL("/api/brand-memory?action=learn-from-page", request.url).href,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  templateId: isGen3 ? (designContext as any).templateId : null,
                  pageType: designContext.pageType,
                  tones: designContext.tones,
                }),
              },
            );
          } catch { /* non-fatal */ }
        }
      },
      cancel() { /* aborted by client */ },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    return apiErrorResponse(error, "Stream API");
  }
}

// ── Helper Functions ──

/**
 * ページ生成リクエストかどうかを判定
 * 会話的な質問（SEOアドバイス等）はfalse、ページ生成はtrue
 */
function detectPageGenerationRequest(
  text: string,
  explicitPageType?: string,
): boolean {
  // 明示的にpageTypeが指定されている場合は生成リクエスト
  if (explicitPageType) return true;

  // サイト全体構築リクエストも生成リクエスト
  if (detectSiteBuildRequest(text)) return true;

  const lowerText = text.toLowerCase();

  // ── 除外パターン: 質問・相談・アドバイス系はページ生成ではない ──
  const questionPatterns = [
    "教えて", "とは", "について", "の違い", "方法は", "やり方",
    "アドバイス", "おすすめ", "ヒント", "コツ", "ポイント",
    "どうすれば", "どうやって", "なぜ", "何が", "いつ",
    "SEO", "マーケティング", "集客", "分析", "運営",
    "返信", "テンプレート", "書き方", "例文",
    "比較", "違い", "メリット", "デメリット",
    "確認して", "チェックして", "レビューして",
  ];
  const isQuestion = questionPatterns.some((kw) => lowerText.includes(kw));

  // ── 強い生成シグナル: これらがあれば質問パターンでも生成とみなす ──
  const strongGenerationSignals = [
    "ページを作", "ページ作成", "ページ生成",
    "サイトを作", "サイト作成",
    "リビルド", "rebuild", "作り直し", "リニューアル",
  ];
  const hasStrongSignal = strongGenerationSignals.some((kw) => lowerText.includes(kw));
  if (hasStrongSignal) return true;

  // 質問系なら生成ではない
  if (isQuestion) return false;

  // ── 弱い生成シグナル: 質問でない場合のみ有効 ──
  const generationKeywords = [
    "トップページ", "ランディングページ", "LP",
    "商品ページ", "商品詳細",
    "コレクション", "カテゴリー",
    "ブログ", "記事",
    "お問い合わせ", "コンタクト",
    "作って", "作成して", "生成して", "デザインして",
  ];

  return generationKeywords.some((kw) => lowerText.includes(kw));
}

/**
 * サイト全体構築リクエストかどうかを判定
 * 「サイト全体」「サイトを作成」「リビルドして」などの自然な表現を検出
 */
function detectSiteBuildRequest(text: string): boolean {
  const siteBuildKeywords = [
    "サイト全体",
    "サイトを作成",
    "サイトを作って",
    "サイト構築",
    "サイトをリビルド",
    "リビルドして",
    "全ページ",
    "まずトップページから",
    "Shopifyサイト全体",
  ];

  return siteBuildKeywords.some((kw) => text.includes(kw));
}

function detectIndustry(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("美容") || lower.includes("コスメ") || lower.includes("化粧品") || lower.includes("スキンケア") || lower.includes("beauty") || lower.includes("サロン") || lower.includes("美容室") || lower.includes("エステ") || lower.includes("メイク") || lower.includes("ネイル") || lower.includes("ヘアサロン")) return "beauty";
  if (lower.includes("ファッション") || lower.includes("アパレル") || lower.includes("服") || lower.includes("fashion") || lower.includes("コーデ") || lower.includes("衣料") || lower.includes("ブティック") || lower.includes("アクセサリー") || lower.includes("ジュエリー")) return "fashion";
  if (lower.includes("食品") || lower.includes("グルメ") || lower.includes("フード") || lower.includes("food") || lower.includes("カフェ") || lower.includes("cafe") || lower.includes("レストラン") || lower.includes("料理") || lower.includes("ベーカリー") || lower.includes("パン") || lower.includes("スイーツ") || lower.includes("コーヒー") || lower.includes("居酒屋") || lower.includes("ラーメン") || lower.includes("寿司") || lower.includes("ワイン") || lower.includes("バー")) return "food";
  if (lower.includes("テック") || lower.includes("ガジェット") || lower.includes("tech") || lower.includes("IT") || lower.includes("ソフトウェア") || lower.includes("デジタル") || lower.includes("アプリ") || lower.includes("SaaS")) return "tech";
  if (lower.includes("健康") || lower.includes("ヘルス") || lower.includes("サプリ") || lower.includes("health") || lower.includes("フィットネス") || lower.includes("ジム") || lower.includes("ヨガ") || lower.includes("ウェルネス") || lower.includes("ピラティス")) return "health";
  if (lower.includes("インテリア") || lower.includes("家具") || lower.includes("ライフスタイル") || lower.includes("lifestyle") || lower.includes("雑貨") || lower.includes("キッチン") || lower.includes("ホーム") || lower.includes("ガーデン")) return "lifestyle";
  if (lower.includes("教育") || lower.includes("スクール") || lower.includes("学習") || lower.includes("レッスン") || lower.includes("塾") || lower.includes("教室")) return "education";
  return "general";
}

function detectTones(text: string): string[] {
  const tones: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("高級") || lower.includes("ラグジュアリー") || lower.includes("luxury")) tones.push("luxury");
  if (lower.includes("ナチュラル") || lower.includes("自然") || lower.includes("オーガニック")) tones.push("natural");
  if (lower.includes("モダン") || lower.includes("modern")) tones.push("modern");
  if (lower.includes("ポップ") || lower.includes("カワイイ") || lower.includes("楽しい")) tones.push("playful");
  if (lower.includes("ミニマル") || lower.includes("シンプル") || lower.includes("minimal")) tones.push("minimal");
  if (lower.includes("大胆") || lower.includes("インパクト") || lower.includes("bold")) tones.push("bold");
  if (lower.includes("エレガント") || lower.includes("elegant")) tones.push("elegant");
  if (lower.includes("あたたか") || lower.includes("warm")) tones.push("warm");
  if (lower.includes("クール") || lower.includes("cool")) tones.push("cool");
  if (lower.includes("和風") || lower.includes("伝統")) tones.push("traditional");
  return tones.length > 0 ? tones : ["modern"]; // デフォルト
}

/**
 * Enhance モード用システムプロンプト
 * 既存ページのHTML/CSSを含め、ユーザーの改善要望に基づいて修正させる
 */
function buildEnhanceSystemPrompt(page: {
  id: string;
  title: string;
  html: string;
  css: string;
  pageType: string;
}): string {
  const parts = [
    "あなたはAicata — ShopifyストアのAIページビルダーです。",
    "",
    "## 現在のモード: 既存ページ改善モード",
    "",
    `ユーザーは既存ページ「${page.title}」（タイプ: ${page.pageType}）を改善しようとしています。`,
    "以下が現在のページのHTML/CSSです。ユーザーの要望に基づいてこのページを改善してください。",
    "",
    "## 重要なルール",
    "",
    "1. **必ず改善後の完全なHTML+CSSを出力してください。** 部分的なコードや説明だけではなく、ページ全体を出力します。",
    "2. **出力コードは必ず `---PAGE_START---` と `---PAGE_END---` で囲んでください。** これがないとプレビューに反映されません。",
    "3. **既存のコンテンツ（テキスト、画像URL等）はできるだけ活かしてください。** デザインやレイアウトを改善しつつ、コンテンツは保持します。",
    "4. HTMLを先に出力し、最後に `<style>` タグでCSSをまとめてください。",
    "5. レスポンシブデザインを心がけてください。",
    "6. モダンなCSS機能（Grid, Flexbox, CSS変数, アニメーション等）を活用してください。",
    "7. まず簡潔に改善内容を説明し（2-3行程度）、その後にコードを出力してください。",
    "",
    "## 出力フォーマット例",
    "",
    "```",
    "改善内容の説明（2-3行）",
    "",
    "---PAGE_START---",
    "<div class=\"page-container\">",
    "  <!-- 改善後のHTML -->",
    "</div>",
    "<style>",
    "  /* 改善後のCSS */",
    "</style>",
    "---PAGE_END---",
    "```",
    "",
    "## 現在のページHTML",
    "",
    "```html",
    page.html,
    "```",
  ];

  if (page.css && page.css.trim()) {
    parts.push("");
    parts.push("## 現在のページCSS");
    parts.push("");
    parts.push("```css");
    parts.push(page.css);
    parts.push("```");
  }

  return parts.join("\n");
}
