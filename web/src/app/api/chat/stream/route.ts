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
import { runDDP } from "@/lib/ddp";
import type { DDPInput } from "@/lib/ddp";
import { prisma } from "@/lib/db";

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
  try {
    const { messages, conversationId, pageType, urlAnalysis } =
      await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "メッセージが必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

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
        console.error("[Stream API] Failed to save user message:", e);
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
          console.log("[Stream API] Enhance mode: linked page found", {
            pageId: page.id,
            title: page.title,
            pageType: page.pageType,
            htmlLength: page.html.length,
          });
        }
      } catch (e) {
        console.error("[Stream API] Failed to lookup linked page:", e);
      }
    }

    // ── ページ生成リクエストかどうか判定 ──
    // Enhance モードの場合は常にページ生成として扱う
    const isPageGenerationRequest = linkedPage
      ? true
      : detectPageGenerationRequest(latestUserText, pageType);

    // ── DDP パイプライン（新規ページ生成時のみ。Enhanceモードはレガシーパスへ） ──
    // ── Vercel Hobby プラン検出 ──
    const isVercelHobby = process.env.VERCEL === "1" && !process.env.VERCEL_PRO;
    const skipDDP = isVercelHobby || process.env.SKIP_DDP === "1";

    if (isPageGenerationRequest && !linkedPage && !skipDDP) {
      console.log("[Stream API] Using DDP pipeline for page generation");

      const isSiteBuildRequest = detectSiteBuildRequest(latestUserText);
      let ddpSucceeded = false;

      // Brand Memory 取得
      let brandMemoryData;
      try {
        const bm = await getActiveBrandMemory();
        if (bm) {
          brandMemoryData = {
            primaryColor: bm.primaryColor,
            secondaryColor: bm.secondaryColor,
            accentColor: bm.accentColor,
            primaryFont: bm.primaryFont,
            bodyFont: bm.bodyFont,
            voiceTone: bm.voiceTone,
            copyKeywords: bm.copyKeywords,
            avoidKeywords: bm.avoidKeywords,
          };
        }
      } catch { /* non-fatal */ }

      // DDPInput 構築
      const ddpInput = buildDDPInput(latestUserText, pageType, urlAnalysis, brandMemoryData);
      if (isSiteBuildRequest) ddpInput.pageType = "landing";

      // ── DDP をまず同期的に実行し、完了後に SSE ストリームで結果を返す ──
      // こうすることで、DDP 失敗時にレガシーパスへフォールバックできる（C-2修正）
      try {
        const ddpResult = await runDDP(ddpInput, undefined, (event) => {
          // Progress は console.log のみ（DDPは同期実行）
          if (event.stage === "spec" && event.status === "complete") {
            const spec = "spec" in event ? event.spec : null;
            if (spec) console.log("[DDP] Spec complete:", spec.designPhilosophy.slice(0, 60));
          } else if (event.stage === "section" && event.status === "complete") {
            const id = "sectionId" in event ? event.sectionId : "?";
            console.log("[DDP] Section complete:", id);
          }
        });

        ddpSucceeded = true;
        console.log("[DDP] Pipeline success. Streaming result via SSE...");

        // SSE ストリームで結果を返す
        const stream = new ReadableStream({
          async start(controller) {
            const sse = new SSEWriter(controller);

            // 進捗サマリーテキスト
            if (isSiteBuildRequest) {
              sse.sendText("承知しました！サイト全体を構築していきますね。\n\n");
              sse.sendText("まずはトップページから作成していきます。\n\n");
            } else {
              sse.sendText("ページをデザインしました。\n\n");
            }

            sse.sendText(`**デザイン方針**: ${ddpResult.spec?.designPhilosophy || ""}\n`);
            sse.sendText(`**配色**: ${ddpResult.spec?.colors?.reasoning || ""}\n`);
            sse.sendText(`**セクション構成**: ${ddpResult.spec?.sections?.length || 0}セクション\n\n`);

            // 完成 HTML を PAGE_START/PAGE_END マーカー付きで送信
            sse.sendText(`---PAGE_START---\n`);

            const doc = ddpResult.fullDocument;
            const chunkSize = 500;
            for (let i = 0; i < doc.length; i += chunkSize) {
              if (sse.isClosed) break;
              sse.sendText(doc.slice(i, i + chunkSize));
              await new Promise((r) => setTimeout(r, 3));
            }

            sse.sendText(`\n---PAGE_END---\n`);

            if (isSiteBuildRequest) {
              sse.sendText(`\nトップページが完成しました！プレビューでご確認ください。\n\n`);
              sse.sendText(`続けて他のページも作成できます。例えば：\n`);
              sse.sendText(`・「コレクションページを作成してください」\n`);
              sse.sendText(`・「商品詳細ページを作成してください」\n`);
              sse.sendText(`・「ブランドストーリーページを作成してください」\n\n`);
              sse.sendText(`どのページを次に作成しましょうか？`);
            }

            sse.sendDone({ model: DEFAULT_MODEL || "claude-sonnet-4-20250514" });
            sse.close();

            // DB保存（ストリーム外で非同期）
            if (conversationId) {
              try {
                await saveMessage(conversationId, "assistant", sse.accumulated, {
                  model: DEFAULT_MODEL || "claude-sonnet-4-20250514",
                });
              } catch (e) {
                console.error("[Stream API] Failed to save DDP assistant message:", e);
              }
            }
          },
          cancel() { /* aborted by client */ },
        });

        return new Response(stream, { headers: SSE_HEADERS });
      } catch (err) {
        console.error("[Stream API] DDP pipeline failed, falling back to legacy:", err);
        // ddpSucceeded remains false → fall through to legacy streaming
      }

      // DDP が失敗した場合のみレガシーパスへフォールバック
      if (ddpSucceeded) {
        // Should not reach here (returned above), but just in case
        return new Response("DDP completed", { status: 200 });
      }
    }

    if (skipDDP && isPageGenerationRequest && !linkedPage) {
          console.log("[Stream API] DDP skipped (Vercel Hobby/SKIP_DDP) — using legacy streaming for page generation");
        }

    // ── レガシー: Vercel AI SDK ストリーミング ──
    let systemPrompt: string;
    let designContext;
    let isGen3 = false;

    // ── Enhance モード: 既存HTMLを含む特別なプロンプト ──
    if (linkedPage) {
      console.log("[Stream API] Building enhance system prompt for page:", linkedPage.id);
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
        console.log(`[Design Engine ${isGen3 ? "Gen-3" : "Gen-2"}]`, {
          industry: designContext.industry,
          pageType: designContext.pageType,
          tones: designContext.tones,
          ...(pageType ? { explicitPageType: pageType } : {}),
          ...(urlAnalysis ? { urlAnalysisIncluded: true } : {}),
          ...(result.gen3 ? { templateId: result.selectedTemplate?.id } : {}),
          promptLength: systemPrompt.length,
        });
      } catch (e) {
        console.error("[Design Engine] Prompt composition failed:", e);
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
          console.log("[Brand Memory] Injected into prompt:", {
            brandName: brandMemory.brandName,
            industry: brandMemory.industry,
            hasColors: !!brandMemory.primaryColor,
            hasFonts: !!brandMemory.primaryFont,
            pageCount: brandMemory.pageCount,
          });
        }
      }
    } catch (e) {
      console.warn("[Brand Memory] Failed to inject:", e);
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

    console.log("[Stream API] Calling Claude via Vercel AI SDK...", {
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
          console.error("[Stream API] Stream error:", err);
          sse.sendError(
            err instanceof Error ? err.message : "ストリーミングエラー",
            true,
          );
        } finally {
          sse.close();
        }

        // ── Post-stream: DB保存 & 後処理 ──
        const fullText = sse.accumulated;
        console.log("[Stream API] Stream completed:", { contentLength: fullText.length });

        // Save assistant message to DB
        if (conversationId && fullText) {
          try {
            await saveMessage(conversationId, "assistant", fullText, {
              model: modelId,
            });
          } catch (e) {
            console.error("[Stream API] Failed to save assistant message:", e);
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
              console.log("[Stream API] Enhanced page HTML auto-saved", {
                pageId: linkedPage.id,
                htmlLength: htmlOnly.length,
                cssLength: css.length,
              });
            }
          } catch (e) {

        // ── Enhance モード 続き生成: PAGE_START なしで HTML/CSS の続きが来た場合 ──
        if (linkedPage && !fullText.includes("---PAGE_START---") && fullText.includes("---PAGE_END---")) {
          try {
            const prevMessages = await prisma.message.findMany({
              where: { conversationId: conversationId },
              orderBy: { createdAt: "desc" },
              take: 5,
            });
            const prevAssistant = prevMessages.find(
              (m) => m.role === "assistant" && m.content.includes("---PAGE_START---") && !m.content.includes("---PAGE_END---"),
            );
            if (prevAssistant) {
              const startMarker = "---PAGE_START---";
              const partialContent = prevAssistant.content.slice(
                prevAssistant.content.indexOf(startMarker) + startMarker.length,
              );
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
                  data: { html: htmlOnly, css: css || linkedPage.css, updatedAt: new Date() },
                });
              }
            }
          } catch (e) {
            console.error("[Stream API] Failed to merge continuation:", e);
          }
        }
            console.error("[Stream API] Failed to auto-save enhanced page:", e);
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
    console.error("[Stream API] Top-level error:", error);
    return new Response(
      JSON.stringify({
        error: `AIの応答でエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
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

  // ページ生成を示すキーワード
  const generationKeywords = [
    "ページを作", "ページ作成", "ページ生成",
    "トップページ", "ランディングページ", "LP",
    "商品ページ", "商品詳細",
    "コレクション", "カテゴリー",
    "ブログ", "記事",
    "お問い合わせ", "コンタクト",
    "作って", "作成して", "生成して", "デザインして",
    "リビルド", "rebuild",
    "作り直し", "リニューアル",
  ];

  const lowerText = text.toLowerCase();
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

/**
 * ユーザーの入力からDDPInput を構築
 */
function buildDDPInput(
  userText: string,
  pageType?: string,
  urlAnalysis?: any,
  brandMemory?: any,
): DDPInput {
  // ページ種別の推定
  const detectedPageType = pageType || detectPageType(userText);

  // 業種の推定
  const industry = detectIndustry(userText);

  // トーンの推定
  const tones = detectTones(userText);

  // ブランド名の推定
  const brandName = detectBrandName(userText);

  const input: DDPInput = {
    pageType: detectedPageType,
    industry,
    brandName,
    tones,
    keywords: extractKeywords(userText),
    userInstructions: userText,
  };

  // URL解析結果
  if (urlAnalysis) {
    input.urlAnalysis = {
      url: urlAnalysis.url || "",
      title: urlAnalysis.title || "",
      headings: (urlAnalysis.texts || [])
        .filter((t: any) => t.role === "heading" || t.role === "subheading")
        .map((t: any) => t.content),
      bodyTexts: (urlAnalysis.texts || [])
        .filter((t: any) => t.role === "body")
        .map((t: any) => t.content),
      images: urlAnalysis.images || [],
      colors: urlAnalysis.colors || [],
      fonts: urlAnalysis.fonts || [],
    };
  }

  // Brand Memory
  if (brandMemory) {
    input.brandMemory = brandMemory;
  }

  return input;
}

function detectPageType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("トップ") || lower.includes("ランディング") || lower.includes("lp") || lower.includes("ホーム")) return "landing";
  if (lower.includes("商品") || lower.includes("プロダクト") || lower.includes("product")) return "product";
  if (lower.includes("コレクション") || lower.includes("カテゴリ") || lower.includes("collection")) return "collection";
  if (lower.includes("ブログ") || lower.includes("記事") || lower.includes("blog")) return "blog";
  if (lower.includes("お問い合わせ") || lower.includes("コンタクト") || lower.includes("contact")) return "contact";
  if (lower.includes("about") || lower.includes("会社概要") || lower.includes("ブランドストーリー")) return "about";
  if (lower.includes("カート") || lower.includes("cart")) return "cart";
  if (lower.includes("検索") || lower.includes("search")) return "search";
  if (lower.includes("404")) return "404";
  return "landing"; // デフォルト
}

function detectIndustry(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("美容") || lower.includes("コスメ") || lower.includes("化粧品") || lower.includes("スキンケア") || lower.includes("beauty")) return "beauty";
  if (lower.includes("ファッション") || lower.includes("アパレル") || lower.includes("服") || lower.includes("fashion")) return "fashion";
  if (lower.includes("食品") || lower.includes("グルメ") || lower.includes("フード") || lower.includes("food")) return "food";
  if (lower.includes("テック") || lower.includes("ガジェット") || lower.includes("tech")) return "tech";
  if (lower.includes("健康") || lower.includes("ヘルス") || lower.includes("サプリ") || lower.includes("health")) return "health";
  if (lower.includes("インテリア") || lower.includes("家具") || lower.includes("ライフスタイル") || lower.includes("lifestyle")) return "lifestyle";
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

function detectBrandName(text: string): string | undefined {
  // 「ブランド名」や「ストア名」の後に続くテキストを抽出
  const brandMatch = text.match(/(?:ブランド名|ストア名|ブランド)[：:「]?([^」\s、。]+)/);
  if (brandMatch) return brandMatch[1];
  return undefined;
}

function extractKeywords(text: string): string[] {
  // 【】内のキーワードを抽出
  const bracketMatches = text.match(/【([^】]+)】/g);
  if (bracketMatches) {
    return bracketMatches.map((m) => m.replace(/[【】]/g, ""));
  }
  return [];
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
    "7. まず簡潔に改善内容を説明し（2-3行程度、**必ず現在進行形**で「〜を改善しています」のように書くこと。「改善しました」のような完了形は禁止）、その後にコードを出力してください。",
    "",
    "## 出力フォーマット例",
    "",
    "```",
    "改善内容の説明（2-3行、進行形で）",
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
