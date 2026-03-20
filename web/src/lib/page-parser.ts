/**
 * AI の応答テキストから、ページ生成用の HTML/CSS を抽出する
 *
 * AI は以下のマーカーでページデータを出力する:
 * ---PAGE_START---
 * <section>...</section>
 * <style>...</style>
 * ---PAGE_END---
 */

export interface PageData {
  html: string;
  css: string;
}

const PAGE_START = "---PAGE_START---";
const PAGE_END = "---PAGE_END---";

/**
 * AI応答テキストからページデータを抽出
 * 最新のページブロックを返す（複数ある場合は最後のもの）
 */
export function extractPageData(text: string): PageData | null {
  const startIdx = text.lastIndexOf(PAGE_START);
  if (startIdx === -1) return null;

  const afterStart = startIdx + PAGE_START.length;
  const endIdx = text.indexOf(PAGE_END, afterStart);

  // ストリーミング中は PAGE_END がまだ来ていない場合がある
  const rawBlock =
    endIdx === -1 ? text.slice(afterStart) : text.slice(afterStart, endIdx);

  // マークダウンコードブロック内のマーカーを除去
  // Claudeが ```html ... ``` でラップする場合がある
  let block = rawBlock.trim();

  // ```html ラッパーを除去
  block = block.replace(/^```(?:html)?\s*/i, "");
  block = block.replace(/\s*```\s*$/, "");
  block = block.trim();

  if (!block) return null;

  // 完了した <style>...</style> を抽出（複数対応）
  const completedStyleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styleMatches = [...block.matchAll(completedStyleRegex)];

  let css = "";
  let html = block;

  // 完了した style タグからCSSを抽出
  for (const match of styleMatches) {
    css += match[1].trim() + "\n";
    html = html.replace(match[0], "");
  }

  // ストリーミング中: 開始した <style> がまだ閉じていない場合も抽出
  // (完了した style タグを除去した後の残りを確認)
  const unclosedStyleMatch = html.match(/<style[^>]*>([\s\S]*)$/i);
  if (unclosedStyleMatch) {
    // 閉じていない style タグの中身もCSSとして扱う
    const partialCss = unclosedStyleMatch[1].trim();
    if (partialCss) {
      css += partialCss + "\n";
    }
    // HTML からは除去
    html = html.slice(0, html.indexOf(unclosedStyleMatch[0]));
  }

  // フォールバック: <style> タグが見つからない場合、
  // インラインCSSっぽいブロックを探す（まれにClaudeがコードブロックで出力する場合）
  if (!css) {
    // ```css ... ``` ブロックがある場合
    const cssCodeBlockMatch = html.match(/```css\s*([\s\S]*?)```/i);
    if (cssCodeBlockMatch) {
      css = cssCodeBlockMatch[1].trim();
      html = html.replace(cssCodeBlockMatch[0], "");
    }
  }

  html = html.trim();
  css = css.trim();

  if (!html && !css) return null;

  return { html, css };
}

/**
 * テキストからページマーカーを除去して、チャット表示用のテキストを返す
 */
export function stripPageMarkers(text: string): string {
  let result = text;

  while (true) {
    const startIdx = result.indexOf(PAGE_START);
    if (startIdx === -1) break;

    const endIdx = result.indexOf(PAGE_END, startIdx);
    if (endIdx === -1) {
      // ストリーミング中: PAGE_START 以降を全て除去
      result = result.slice(0, startIdx);
      break;
    }

    result =
      result.slice(0, startIdx) + result.slice(endIdx + PAGE_END.length);
  }

  return result.trim();
}

/**
 * テキストにページデータが含まれているかチェック
 */
export function hasPageData(text: string): boolean {
  return text.includes(PAGE_START);
}
