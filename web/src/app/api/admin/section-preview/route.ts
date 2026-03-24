// ============================================================
// Admin API: Section Preview
// 単一セクションのHTMLプレビューを返す
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSectionById } from "@/lib/design-engine/knowledge/sections/registry";
import { cleanupRemainingPlaceholders, setCleanupIndustry } from "@/lib/ddp-next/personalizer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sectionId = request.nextUrl.searchParams.get("id");
  if (!sectionId) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const section = getSectionById(sectionId);
  if (!section) {
    return NextResponse.json({ error: `Section not found: ${sectionId}` }, { status: 404 });
  }

  // プレースホルダーをデフォルト値で置換
  let html = section.html;
  if (section.placeholders) {
    for (const p of section.placeholders) {
      if (p.defaultValue) {
        html = html.replaceAll(`{{${p.key}}}`, p.defaultValue);
      }
    }
  }

  // 残留プレースホルダーをクリーンアップ
  setCleanupIndustry("beauty");
  html = cleanupRemainingPlaceholders(html);

  // フルHTMLドキュメント構築
  const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Sans+3:wght@300;400;500;600&family=Shippori+Mincho:wght@400;500&family=Noto+Sans+JP:wght@200;300;400;500&display=swap" rel="stylesheet">
  <style>
*, *::before, *::after { box-sizing: border-box; }
html, body {
  margin: 0;
  background-color: #ffffff;
  color: #333333;
  font-family: "Noto Sans JP", "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; height: auto; display: block; }
a { text-decoration: none; color: inherit; }
:root {
  --color-bg: #faf8f5;
  --color-text: #2d2926;
  --color-accent: #8b6f4e;
  --color-accent-light: #c5a882;
  --color-muted: #6b6560;
  --color-border: #e8e2db;
  --color-surface: #ffffff;
  --font-heading: "Playfair Display", "Shippori Mincho", serif;
  --font-body: "Source Sans 3", "Noto Sans JP", sans-serif;
  --section-padding: clamp(3rem, 8vw, 6rem);
  --gap-sm: clamp(0.5rem, 1.5vw, 1rem);
  --gap-md: clamp(1rem, 3vw, 2rem);
  --gap-lg: clamp(2rem, 5vw, 4rem);
}
  </style>
  <style>
${section.css}
  </style>
</head>
<body>
${html}
</body>
</html>`;

  return NextResponse.json({
    sectionId,
    name: section.name,
    category: section.category,
    html: fullHtml,
  });
}
