// ============================================================
// Design Harvester — Puppeteer Block Extractor
// Pixel-perfect HTML/CSS抽出エンジン
// ============================================================

import type { ExtractedBlock, RQSBreakdown } from "./types";

// Puppeteer は実行時に動的インポート（サーバーサイドのみ）
type Browser = import("puppeteer").Browser;
type Page = import("puppeteer").Page;

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 900 },
  wide: { width: 1920, height: 1080 },
} as const;

/** セクション境界を検出するためのセマンティックセレクタ */
const SECTION_SELECTORS = [
  "section",
  "header",
  "footer",
  "main > div",
  "[class*='hero']",
  "[class*='banner']",
  "[class*='features']",
  "[class*='testimonial']",
  "[class*='pricing']",
  "[class*='cta']",
  "[class*='faq']",
  "[class*='gallery']",
  "[class*='product']",
  "[class*='collection']",
  "[class*='about']",
  "[class*='contact']",
  "[class*='newsletter']",
  "[class*='footer']",
  "[class*='header']",
  "[class*='nav']",
].join(", ");

/** 最小セクション高さ（これ以下はノイズとして除外） */
const MIN_SECTION_HEIGHT = 100;

/** 最大セクション高さ（これ以上は分割を検討） */
const MAX_SECTION_HEIGHT = 3000;

interface ExtractorOptions {
  /** タイムアウト（ms） */
  timeout?: number;
  /** スクリーンショットを取得するか */
  captureScreenshots?: boolean;
  /** 最大ブロック数 */
  maxBlocks?: number;
  /** ビューポート (デフォルト: desktop) */
  viewport?: keyof typeof VIEWPORTS;
}

const DEFAULT_OPTIONS: Required<ExtractorOptions> = {
  timeout: 30000,
  captureScreenshots: true,
  maxBlocks: 50,
  viewport: "desktop",
};

/**
 * 単一ページからデザインブロックを抽出する
 */
export async function extractBlocksFromPage(
  pageUrl: string,
  browser: Browser,
  options: ExtractorOptions = {},
): Promise<ExtractedBlock[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const page = await browser.newPage();

  try {
    // ビューポート設定
    await page.setViewport(VIEWPORTS[opts.viewport]);

    // ページ読み込み
    await page.goto(pageUrl, {
      waitUntil: "networkidle2",
      timeout: opts.timeout,
    });

    // Cookie バナー等を閉じる
    await dismissOverlays(page);

    // フルスクロールしてlazy loadを発火
    await autoScroll(page);

    // セクション境界を検出
    const sections = await page.evaluate(
      (selectors: string, minHeight: number, maxHeight: number) => {
        const elements = document.querySelectorAll(selectors);
        const seen = new Set<Element>();
        const results: Array<{
          index: number;
          tagName: string;
          className: string;
          boundingBox: { x: number; y: number; width: number; height: number };
        }> = [];

        let idx = 0;
        elements.forEach((el) => {
          // 祖先がすでにキャプチャ済みなら除外
          let parent = el.parentElement;
          while (parent) {
            if (seen.has(parent)) return;
            parent = parent.parentElement;
          }

          const rect = el.getBoundingClientRect();
          if (rect.height < minHeight || rect.width < 200) return;
          if (rect.height > maxHeight) return; // 巨大すぎるものは除外

          seen.add(el);
          results.push({
            index: idx++,
            tagName: el.tagName.toLowerCase(),
            className: (el as HTMLElement).className || "",
            boundingBox: {
              x: rect.x,
              y: rect.y + window.scrollY,
              width: rect.width,
              height: rect.height,
            },
          });
        });

        return results;
      },
      SECTION_SELECTORS,
      MIN_SECTION_HEIGHT,
      MAX_SECTION_HEIGHT,
    );

    // 各セクションからHTML/CSSを抽出
    const blocks: ExtractedBlock[] = [];

    for (const section of sections.slice(0, opts.maxBlocks)) {
      const block = await extractSectionContent(page, section, opts);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  } finally {
    await page.close();
  }
}

/**
 * 単一セクションのHTML/CSS/スクリーンショットを抽出
 */
async function extractSectionContent(
  page: Page,
  section: {
    index: number;
    tagName: string;
    className: string;
    boundingBox: { x: number; y: number; width: number; height: number };
  },
  opts: Required<ExtractorOptions>,
): Promise<ExtractedBlock | null> {
  try {
    // セクション内のHTML + computedStylesをまとめて取得
    const result = await page.evaluate(
      (sectionIndex: number, selectors: string) => {
        const elements = document.querySelectorAll(selectors);
        const seen = new Set<Element>();
        let targetEl: Element | null = null;
        let idx = 0;

        elements.forEach((el) => {
          let parent = el.parentElement;
          let skip = false;
          while (parent) {
            if (seen.has(parent)) { skip = true; break; }
            parent = parent.parentElement;
          }
          if (skip) return;

          const rect = el.getBoundingClientRect();
          if (rect.height < 100 || rect.width < 200) return;
          if (rect.height > 3000) return;

          seen.add(el);
          if (idx === sectionIndex) {
            targetEl = el;
          }
          idx++;
        });

        if (!targetEl) return null;

        const el = targetEl as HTMLElement;

        // getComputedStyle で全CSSプロパティを取得
        const computed = window.getComputedStyle(el);
        const styles: Record<string, string> = {};
        const importantProps = [
          "display", "position", "background", "background-color",
          "background-image", "color", "font-family", "font-size",
          "font-weight", "line-height", "letter-spacing", "padding",
          "margin", "border", "border-radius", "box-shadow",
          "text-align", "gap", "grid-template-columns",
          "flex-direction", "justify-content", "align-items",
          "max-width", "min-height", "overflow",
        ];
        for (const prop of importantProps) {
          styles[prop] = computed.getPropertyValue(prop);
        }

        // 全子要素のCSSも収集
        const allElements = el.querySelectorAll("*");
        const cssRules: string[] = [];

        // インラインスタイルを含むcloneを作成
        const clone = el.cloneNode(true) as HTMLElement;

        // 画像のsrcをabsoluteに変換
        clone.querySelectorAll("img").forEach((img) => {
          if (img.src) {
            try {
              img.src = new URL(img.src, document.baseURI).href;
            } catch {
              // ignore
            }
          }
        });

        // background-imageのurl()をabsoluteに変換
        clone.querySelectorAll("[style]").forEach((styledEl) => {
          const style = (styledEl as HTMLElement).style.backgroundImage;
          if (style && style.includes("url(")) {
            // leave as-is for now
          }
        });

        return {
          html: clone.outerHTML,
          computedStyles: styles,
        };
      },
      section.index,
      SECTION_SELECTORS,
    );

    if (!result) return null;

    // CSSの抽出（ページのstylesheetから関連ルールを取得）
    const css = await extractRelevantCSS(page, section.index);

    // スクリーンショット
    let screenshot: string | undefined;
    if (opts.captureScreenshots) {
      try {
        const screenshotBuffer = await page.screenshot({
          clip: {
            x: section.boundingBox.x,
            y: section.boundingBox.y,
            width: Math.min(section.boundingBox.width, VIEWPORTS[opts.viewport].width),
            height: Math.min(section.boundingBox.height, 2000),
          },
          type: "png",
          encoding: "base64",
        });
        screenshot = screenshotBuffer as string;
      } catch {
        // スクリーンショット失敗は非致命的
      }
    }

    // セクションカテゴリを推定
    const category = inferSectionCategory(section.tagName, section.className);

    return {
      sectionIndex: section.index,
      sectionCategory: category,
      sectionVariant: "",
      html: result.html,
      css: css,
      js: "",
      screenshot,
      boundingBox: section.boundingBox,
      computedStyles: result.computedStyles,
    };
  } catch {
    return null;
  }
}

/**
 * ページのstylesheetから特定セクションに関連するCSSルールを抽出
 */
async function extractRelevantCSS(page: Page, sectionIndex: number): Promise<string> {
  return page.evaluate(
    (sIndex: number, selectors: string) => {
      const elements = document.querySelectorAll(selectors);
      const seen = new Set<Element>();
      let targetEl: Element | null = null;
      let idx = 0;

      elements.forEach((el) => {
        let parent = el.parentElement;
        let skip = false;
        while (parent) {
          if (seen.has(parent)) { skip = true; break; }
          parent = parent.parentElement;
        }
        if (skip) return;

        const rect = el.getBoundingClientRect();
        if (rect.height < 100 || rect.width < 200) return;
        if (rect.height > 3000) return;

        seen.add(el);
        if (idx === sIndex) targetEl = el;
        idx++;
      });

      if (!targetEl) return "";

      // セクション内の全要素のクラス名を収集
      const classNames = new Set<string>();
      const foundEl: Element = targetEl;
      const allEls = [foundEl, ...foundEl.querySelectorAll("*")];
      for (const el of allEls) {
        const htmlEl = el as HTMLElement;
        if (htmlEl.classList) {
          htmlEl.classList.forEach((c) => classNames.add(c));
        }
      }

      // stylesheetからマッチするルールを抽出
      const matchedRules: string[] = [];
      try {
        for (const sheet of document.styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of rules) {
              if (rule instanceof CSSStyleRule) {
                // クラス名がセクション内の要素に含まれるか確認
                const ruleClasses = rule.selectorText.match(/\.([\w-]+)/g);
                if (ruleClasses) {
                  const hasMatch = ruleClasses.some((cls) =>
                    classNames.has(cls.slice(1)),
                  );
                  if (hasMatch) {
                    matchedRules.push(rule.cssText);
                  }
                }
              } else if (rule instanceof CSSMediaRule) {
                // メディアクエリ内のルールもチェック
                const innerMatches: string[] = [];
                for (const innerRule of rule.cssRules) {
                  if (innerRule instanceof CSSStyleRule) {
                    const ruleClasses = innerRule.selectorText.match(/\.([\w-]+)/g);
                    if (ruleClasses) {
                      const hasMatch = ruleClasses.some((cls) =>
                        classNames.has(cls.slice(1)),
                      );
                      if (hasMatch) {
                        innerMatches.push(innerRule.cssText);
                      }
                    }
                  }
                }
                if (innerMatches.length > 0) {
                  matchedRules.push(
                    `@media ${rule.conditionText} {\n${innerMatches.join("\n")}\n}`,
                  );
                }
              }
            }
          } catch {
            // CORSで読めないstylesheetは無視
          }
        }
      } catch {
        // stylesheet access error
      }

      return matchedRules.join("\n\n");
    },
    sectionIndex,
    SECTION_SELECTORS,
  );
}

/**
 * クラス名・タグ名からセクションカテゴリを推定
 */
function inferSectionCategory(tagName: string, className: string): string {
  const cls = className.toLowerCase();

  if (tagName === "header" || cls.includes("header") || cls.includes("nav")) return "header";
  if (tagName === "footer" || cls.includes("footer")) return "footer";
  if (cls.includes("hero") || cls.includes("banner") || cls.includes("jumbotron")) return "hero";
  if (cls.includes("feature")) return "features";
  if (cls.includes("testimonial") || cls.includes("review")) return "testimonials";
  if (cls.includes("pricing") || cls.includes("plan")) return "pricing";
  if (cls.includes("cta") || cls.includes("call-to-action")) return "cta";
  if (cls.includes("faq") || cls.includes("accordion")) return "faq";
  if (cls.includes("gallery") || cls.includes("portfolio")) return "gallery";
  if (cls.includes("product")) return "product-showcase";
  if (cls.includes("collection") || cls.includes("category")) return "collection";
  if (cls.includes("about") || cls.includes("story")) return "about";
  if (cls.includes("contact") || cls.includes("form")) return "contact";
  if (cls.includes("newsletter") || cls.includes("subscribe")) return "newsletter";
  if (cls.includes("stat") || cls.includes("counter") || cls.includes("number")) return "stats";
  if (cls.includes("team") || cls.includes("member")) return "team";
  if (cls.includes("logo") || cls.includes("partner") || cls.includes("client")) return "logo-bar";
  if (cls.includes("blog") || cls.includes("article") || cls.includes("post")) return "blog";

  return "generic";
}

/**
 * Cookie同意バナー等のオーバーレイを閉じる
 */
async function dismissOverlays(page: Page): Promise<void> {
  const dismissSelectors = [
    // Cookie consent
    "[class*='cookie'] button",
    "[id*='cookie'] button",
    "[class*='consent'] button",
    "[class*='gdpr'] button",
    // Generic close buttons
    "[class*='modal'] [class*='close']",
    "[class*='overlay'] [class*='close']",
    "[class*='popup'] [class*='close']",
    "button[class*='accept']",
    "button[class*='agree']",
    "button[class*='dismiss']",
  ];

  for (const selector of dismissSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        await page.waitForTimeout(300);
      }
    } catch {
      // ignore
    }
  }
}

/**
 * ページをフルスクロールしてlazy loadコンテンツを発火
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          // スクロールトップに戻る
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);

      // 安全装置: 30秒で強制終了
      setTimeout(() => {
        clearInterval(timer);
        window.scrollTo(0, 0);
        resolve();
      }, 30000);
    });
  });
}

/**
 * RQS（Responsive Quality Score）を計測
 * 4ビューポートでレンダリングし、各ビューポートでのレイアウト品質を評価
 */
export async function measureRQS(
  html: string,
  css: string,
  browser: Browser,
): Promise<RQSBreakdown> {
  const page = await browser.newPage();
  const breakdown: RQSBreakdown = { mobile: 0, tablet: 0, desktop: 0, wide: 0 };

  try {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${html}</body></html>`;

    for (const [viewport, size] of Object.entries(VIEWPORTS)) {
      await page.setViewport(size);
      await page.setContent(fullHtml, { waitUntil: "networkidle0" });

      const score = await page.evaluate(() => {
        let score = 100;
        const body = document.body;
        const viewportWidth = window.innerWidth;

        // 水平オーバーフロー検出
        if (body.scrollWidth > viewportWidth + 10) {
          score -= 30;
        }

        // テキストサイズチェック
        const textElements = document.querySelectorAll("p, span, a, li, h1, h2, h3, h4, h5, h6");
        let tooSmallCount = 0;
        textElements.forEach((el) => {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          if (fontSize < 12) tooSmallCount++;
        });
        if (tooSmallCount > textElements.length * 0.2) {
          score -= 15;
        }

        // タッチターゲットサイズ（モバイルのみ）
        if (viewportWidth <= 768) {
          const buttons = document.querySelectorAll("a, button, input[type='submit']");
          let tooSmallTargets = 0;
          buttons.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) tooSmallTargets++;
          });
          if (tooSmallTargets > buttons.length * 0.3) {
            score -= 15;
          }
        }

        // 画像のアスペクト比崩れ検出
        const images = document.querySelectorAll("img");
        let brokenImages = 0;
        images.forEach((img) => {
          const rect = img.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) brokenImages++;
        });
        if (brokenImages > 0) {
          score -= 10 * Math.min(brokenImages, 3);
        }

        return Math.max(0, score);
      });

      breakdown[viewport as keyof RQSBreakdown] = score;
    }
  } finally {
    await page.close();
  }

  return breakdown;
}
