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
    if (isPageGenerationRequest && !linkedPage) {
      try {
        console.log("[Stream API] Using DDP pipeline for page generation");

        // サイト全体構築リクエストかどうか判定
        const isSiteBuildRequest = detectSiteBuildRequest(latestUserText);

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
        const ddpInput = buildDDPInput(
          latestUserText,
          pageType,
          urlAnalysis,
          brandMemoryData,
        );

        // サイト全体構築の場合、最初のページはトップページ
        if (isSiteBuildRequest) {
          ddpInput.pageType = "landing";
        }

        // ── リアルタイムストリーミング DDP ──
        const encoder = new TextEncoder();
        let streamClosed = false;

        const stream = new ReadableStream({
          async start(controller) {
            const send = (text: string) => {
              if (streamClosed) return;
              try {
                controller.enqueue(encoder.encode(text));
              } catch {
                streamClosed = true;
              }
            };

            try {
              // 自然な会話メッセージから開始
              if (isSiteBuildRequest) {
                send("承知しました！サイト全体を構築していきますね。\n\n");
                send("まずはトップページから作成していきます。\n\n");
              } else {
                send("ページをデザインしています...\n\n");
              }

              const result = await runDDP(ddpInput, undefined, (event) => {
                if (streamClosed) return;
                if (event.stage === "spec" && event.status === "start") {
                  send("🎨 デザイン設計図を作成中...\n");
                } else if (event.stage === "spec" && event.status === "complete") {
                  const spec = (event as any).spec;
                  if (spec) {
                    send(`✅ デザイン方針: ${spec.designPhilosophy}\n`);
                    send(`   配色: ${spec.colors.reasoning}\n`);
                    send(`   セクション: ${spec.sections.length}個\n\n`);
                  }
                } else if (event.stage === "section" && event.status === "start") {
                  const sectionId = (event as any).sectionId;
                  const index = (event as any).index;
                  const total = (event as any).total;
                  send(`🔨 セクション ${index + 1}/${total} (${sectionId}) を構築中...\n`);
                } else if (event.stage === "section" && event.status === "complete") {
                  const sectionId = (event as any).sectionId;
                  send(`✅ ${sectionId} 完成\n`);
                } else if (event.stage === "assembly" && event.status === "start") {
                  send(`\n⚙️ ページを組み立て中...\n`);
                } else if (event.stage === "assembly" && event.status === "complete") {
                  send(`✅ 組み立て完了\n\n`);
                }
              });

              // 完成したHTMLを ---PAGE_START---/---PAGE_END--- マーカー付きで送信
              send(`\n---PAGE_START---\n`);

              const doc = result.fullDocument;
              const chunkSize = 500;
              for (let i = 0; i < doc.length; i += chunkSize) {
                if (streamClosed) break;
                send(doc.slice(i, i + chunkSize));
                await new Promise((r) => setTimeout(r, 5));
              }

              send(`\n---PAGE_END---\n`);

              // サイト全体構築の場合、次のステップを案内
              if (isSiteBuildRequest) {
                send(`\nトップページが完成しました！プレビューでご確認ください。\n\n`);
                send(`続けて他のページも作成できます。例えば：\n`);
                send(`・「コレクションページを作成してください」\n`);
                send(`・「商品詳細ページを作成してください」\n`);
                send(`・「ブランドストーリーページを作成してください」\n\n`);
                send(`どのページを次に作成しましょうか？`);
              }

              // Save assistant message to DB
              const siteGuide = isSiteBuildRequest
                ? `\n\nトップページが完成しました！続けて他のページも作成できます。例えば「コレクションページを作成してください」「商品詳細ページを作成してください」など、お気軽にお声がけください。`
                : "";
              const fullResponse = `ページをデザインしました。\n\n**デザイン方針**: ${result.spec?.designPhilosophy || ""}\n**配色**: ${result.spec?.colors?.reasoning || ""}\n**セクション構成**: ${result.spec?.sections?.length || 0}セクション\n\n---PAGE_START---\n${result.fullDocument}\n---PAGE_END---${siteGuide}`;
              if (conversationId) {
                try {
                  await saveMessage(conversationId, "assistant", fullResponse, {
                    model: DEFAULT_MODEL || "claude-sonnet-4-20250514",
                  });
                } catch (e) {
                  console.error("[Stream API] Failed to save assistant message:", e);
                }
              }
            } catch (err) {
              console.error("[Stream API] DDP pipeline error:", err);
              send(`\nエラーが発生しました。レガシーエンジンにフォールバックします...\n`);
            }

            if (!streamClosed) {
              try { controller.close(); } catch { /* already closed */ }
            }
          },
          cancel() {
            streamClosed = true;
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } catch (err) {
        console.error("[Stream API] DDP pipeline failed, falling back to legacy:", err);
        // Fall through to legacy streaming
      }
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

    console.log("[Stream API] Calling Claude via Vercel AI SDK...", {
      model: modelId,
      maxOutputTokens: DEFAULT_MAX_TOKENS,
      messageCount: aiMessages.length,
      systemPromptLength: systemPrompt.length,
    });

    // === Vercel AI SDK streamText ===
    // Enhance モードでは既存HTML全体を再出力するため、トークン上限を引き上げ
    const maxTokens = linkedPage
      ? Math.max(DEFAULT_MAX_TOKENS, 32768)
      : DEFAULT_MAX_TOKENS;

    const result = streamText({
      model: anthropic(modelId),
      system: systemPrompt,
      messages: aiMessages,
      maxOutputTokens: maxTokens,
      // onFinish callback for DB persistence and post-processing
      async onFinish({ text, usage }) {
        console.log("[Stream API] Stream completed:", {
          contentLength: text.length,
          usage,
        });

        // Save assistant message to DB
        if (conversationId && text) {
          try {
            await saveMessage(conversationId, "assistant", text, {
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              model: modelId,
            });
          } catch (e) {
            console.error(
              "[Stream API] Failed to save assistant message:",
              e,
            );
          }
        }

        // ── Enhance モード: 生成されたHTMLをページに自動保存 ──
        if (linkedPage && text.includes("---PAGE_START---")) {
          try {
            const startMarker = "---PAGE_START---";
            const endMarker = "---PAGE_END---";
            const startIdx = text.indexOf(startMarker) + startMarker.length;
            const endIdx = text.indexOf(endMarker);
            if (endIdx > startIdx) {
              const generatedHtml = text.slice(startIdx, endIdx).trim();
              // HTML と CSS を分離
              const styleMatch = generatedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
              const css = styleMatch ? styleMatch[1].trim() : "";
              const html = generatedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim();

              await prisma.page.update({
                where: { id: linkedPage.id },
                data: {
                  html: generatedHtml, // 完全なHTML（styleタグ含む）
                  css: css || linkedPage.css, // CSSが抽出できた場合は更新
                  updatedAt: new Date(),
                },
              });
              console.log("[Stream API] Enhanced page HTML auto-saved", {
                pageId: linkedPage.id,
                htmlLength: generatedHtml.length,
              });
            }
          } catch (e) {
            console.error("[Stream API] Failed to auto-save enhanced page:", e);
          }
        }

        // ── Brand Memory: ページ生成から学習 ──
        if (designContext && text.includes("---PAGE_START---")) {
          try {
            await fetch(
              new URL(
                "/api/brand-memory?action=learn-from-page",
                request.url,
              ).href,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  templateId: isGen3
                    ? (designContext as any).templateId
                    : null,
                  pageType: designContext.pageType,
                  tones: designContext.tones,
                }),
              },
            );
          } catch {
            /* non-fatal */
          }
        }
      },
    });

    // Return the AI SDK's streaming response
    // The toDataStreamResponse() method creates SSE-compatible output
    // that works with the useChat() hook on the frontend
    return result.toTextStreamResponse();
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
