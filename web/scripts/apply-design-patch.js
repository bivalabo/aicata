#!/usr/bin/env node
/**
 * apply-design-patch.js — ホスト側で実行するデザインパッチ
 *
 * Usage: cd web && node scripts/apply-design-patch.js
 *
 * FUSE マウント経由の VM 編集では Turbopack が変更を検出できないため、
 * ホスト OS の Node.js から直接ファイルを書き換える。
 */

const fs = require("fs");
const path = require("path");

const WEB_DIR = path.join(__dirname, "..");

function patchFile(relPath, replacements) {
  const fullPath = path.join(WEB_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⏭  ${relPath} (ファイルが見つかりません)`);
    return;
  }
  let content = fs.readFileSync(fullPath, "utf-8");
  let changed = false;

  for (const [oldStr, newStr] of replacements) {
    if (content.includes(oldStr)) {
      content = content.replace(oldStr, newStr);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, "utf-8");
    console.log(`  ✓ ${relPath}`);
  } else {
    console.log(`  ⏭  ${relPath} (既に適用済み or パターン不一致)`);
  }
}

console.log("🎨 Aicata デザインパッチを適用中...\n");

// ============================================================
// 1. SiteMapView — ページヘッダー上部パディング拡大
// ============================================================
patchFile("src/components/pages/SiteMapView.tsx", [
  // パディング: 元の pt-6 も、中間の pt-8/pt-12/pt-16 も対応
  ['shrink-0 px-6 pt-6 pb-4', 'shrink-0 px-8 pt-14 pb-6'],
  ['shrink-0 px-8 pt-8 pb-5', 'shrink-0 px-8 pt-14 pb-6'],
  ['shrink-0 px-8 pt-12 pb-6', 'shrink-0 px-8 pt-14 pb-6'],
  ['shrink-0 px-8 pt-16 pb-6', 'shrink-0 px-8 pt-14 pb-6'],
  // inline style版も対応
  ['shrink-0 px-8 pt-10 pb-6" style={{ paddingTop: "clamp(40px, 5vh, 80px)" }}', 'shrink-0 px-8 pt-14 pb-6"'],
  // タイトルサイズ
  ['text-xl font-bold text-foreground mb-0.5', 'text-2xl font-bold text-foreground mb-1'],
  ['text-xl font-bold text-foreground mb-1', 'text-2xl font-bold text-foreground mb-1'],
  // 説明文サイズ
  ['text-[13px] text-muted-foreground">\n', 'text-[15px] text-muted-foreground">\n'],
  // mb-2 → mb-3
  ['items-center justify-between mb-2', 'items-center justify-between mb-3'],
]);

// ============================================================
// 2. SiteBuilderView — ページヘッダー上部パディング拡大
// ============================================================
patchFile("src/components/site-builder/SiteBuilderView.tsx", [
  ['shrink-0 px-6 pt-6 pb-4', 'shrink-0 px-8 pt-14 pb-6'],
  ['shrink-0 px-8 pt-8 pb-5', 'shrink-0 px-8 pt-14 pb-6'],
  ['shrink-0 px-8 pt-12 pb-6', 'shrink-0 px-8 pt-14 pb-6'],
  ['shrink-0 px-8 pt-16 pb-6', 'shrink-0 px-8 pt-14 pb-6'],
  ['shrink-0 px-8 pt-10 pb-6" style={{ paddingTop: "clamp(40px, 5vh, 80px)" }}', 'shrink-0 px-8 pt-14 pb-6"'],
  ['text-xl font-bold text-foreground', 'text-2xl font-bold text-foreground'],
  ['items-center justify-between mb-4', 'items-center justify-between mb-5'],
  // タブフォント
  ['text-[13px] font-medium whitespace-nowrap', 'text-[14px] font-medium whitespace-nowrap'],
  // 説明文
  ['text-sm text-muted-foreground mt-1', 'text-[15px] text-muted-foreground mt-1'],
]);

// ============================================================
// 3. Sidebar — 履歴テキストを濃く
// ============================================================
patchFile("src/components/layout/Sidebar.tsx", [
  // プロジェクトヘッダー（新旧両対応）
  ['text-[12px] text-muted-foreground uppercase tracking-widest font-medium">\n          プロジェクト',
   'text-[12px] text-foreground/60 uppercase tracking-widest font-medium">\n          プロジェクト'],
  // 件数
  ['text-[11px] text-muted-foreground/50">\n            {totalCount}',
   'text-[11px] text-foreground/40">\n            {totalCount}'],
  // 会話タイトル（非アクティブ）
  [': "text-muted-foreground",', ': "text-foreground/70",'],
  // RelativeTime
  ['text-[11px] text-muted-foreground/50"\n      suppressHydrationWarning',
   'text-[11px] text-foreground/40"\n      suppressHydrationWarning'],
  // デフォルトアイコン
  ['w-3 h-3 text-muted-foreground/40', 'w-3 h-3 text-foreground/30'],
  // 空状態
  ['text-[14px] text-muted-foreground px-3 py-8 text-center', 'text-[14px] text-foreground/50 px-3 py-8 text-center'],
  ['w-7 h-7 mx-auto mb-2.5 text-muted-foreground/20', 'w-7 h-7 mx-auto mb-2.5 text-foreground/20'],
  ['w-9 h-9 mx-auto mb-2.5 text-muted-foreground/30', 'w-9 h-9 mx-auto mb-2.5 text-foreground/20'],
]);

// ============================================================
// 4. SettingsView — 幅拡大 & フォントサイズ増加
// ============================================================
patchFile("src/components/settings/SettingsView.tsx", [
  // コンテナ幅 (様々な中間状態に対応)
  ['max-w-xl mx-auto px-6 py-10', 'max-w-3xl mx-auto px-8 pt-16 pb-14'],
  ['max-w-xl mx-auto px-6 py-12', 'max-w-3xl mx-auto px-8 pt-16 pb-14'],
  ['max-w-3xl mx-auto px-8 py-14', 'max-w-3xl mx-auto px-8 pt-16 pb-14'],
  // タイトル
  ['text-xl font-bold text-foreground mb-2">設定', 'text-3xl font-bold text-foreground mb-2">設定'],
  ['text-2xl font-bold text-foreground mb-2">設定', 'text-3xl font-bold text-foreground mb-2">設定'],
  // 説明文
  ['text-sm text-muted-foreground mb-8', 'text-[15px] text-muted-foreground mb-10'],
  ['text-[15px] text-muted-foreground mb-8', 'text-[15px] text-muted-foreground mb-10'],
  // Shopify接続タイトル
  ['text-[15px] font-semibold text-foreground">\n                Shopifyストア接続',
   'text-[18px] font-semibold text-foreground">\n                Shopifyストア接続'],
  ['text-[16px] font-semibold text-foreground">\n                Shopifyストア接続',
   'text-[18px] font-semibold text-foreground">\n                Shopifyストア接続'],
  // 接続状態テキスト
  ['text-[12px] text-muted-foreground">\n                {connected',
   'text-[14px] text-muted-foreground">\n                {connected'],
  ['text-[13px] text-muted-foreground">\n                {connected',
   'text-[14px] text-muted-foreground">\n                {connected'],
  // 接続済みバッジ
  ['text-emerald-600 text-[12px] font-medium', 'text-emerald-600 text-[14px] font-medium'],
  ['text-emerald-600 text-[13px] font-medium', 'text-emerald-600 text-[14px] font-medium'],
  // ストア情報ラベル
  ['text-[12px] text-muted-foreground block mb-1', 'text-[14px] text-muted-foreground block mb-1'],
  ['text-[13px] text-muted-foreground block mb-1', 'text-[14px] text-muted-foreground block mb-1'],
  // セットアップ手順
  ['text-[13px] font-semibold text-foreground mb-2', 'text-[16px] font-semibold text-foreground mb-3'],
  ['text-[15px] font-semibold text-foreground mb-2', 'text-[16px] font-semibold text-foreground mb-3'],
  // セットアップリスト
  ['text-[13px] text-muted-foreground space-y-2 list-decimal', 'text-[15px] text-muted-foreground space-y-2.5 list-decimal'],
  ['text-[14px] text-muted-foreground space-y-2 list-decimal', 'text-[15px] text-muted-foreground space-y-2.5 list-decimal'],
  // ヘルパーテキスト
  ['text-[11px] text-muted-foreground/60 mt-2', 'text-[13px] text-muted-foreground/60 mt-2'],
  ['text-[12px] text-muted-foreground/60 mt-2', 'text-[13px] text-muted-foreground/60 mt-2'],
]);

// ============================================================
// 5. BrandMemoryView — 幅拡大 & フォントサイズ増加
// ============================================================
patchFile("src/components/settings/BrandMemoryView.tsx", [
  // コンテナ
  ['max-w-2xl mx-auto space-y-8', 'max-w-3xl mx-auto space-y-10'],
  // Brand Memory タイトル
  ['text-[17px] font-bold text-foreground">\n            Brand Memory',
   'text-[22px] font-bold text-foreground">\n            Brand Memory'],
  ['text-[20px] font-bold text-foreground">\n            Brand Memory',
   'text-[22px] font-bold text-foreground">\n            Brand Memory'],
  // 説明文
  ['text-[12px] text-muted-foreground">\n            相方が',
   'text-[15px] text-muted-foreground">\n            相方が'],
  ['text-[14px] text-muted-foreground">\n            相方が',
   'text-[15px] text-muted-foreground">\n            相方が'],
  // ステータス
  ['text-[12px] font-medium text-accent">\n              Brand Memory 有効',
   'text-[14px] font-medium text-accent">\n              Brand Memory 有効'],
  ['text-[13px] font-medium text-accent">\n              Brand Memory 有効',
   'text-[14px] font-medium text-accent">\n              Brand Memory 有効'],
  // セクションタイトル
  ['text-[14px] font-semibold text-foreground">{title}', 'text-[17px] font-semibold text-foreground">{title}'],
  ['text-[16px] font-semibold text-foreground">{title}', 'text-[17px] font-semibold text-foreground">{title}'],
  // フィールドラベル (Field component)
  ['text-[12px] font-medium text-foreground mb-1.5">\n        {label}',
   'text-[15px] font-medium text-foreground mb-2">\n        {label}'],
  ['text-[14px] font-medium text-foreground mb-2">\n        {label}',
   'text-[15px] font-medium text-foreground mb-2">\n        {label}'],
  // フィールド説明
  ['text-[11px] text-muted-foreground mb-1.5', 'text-[14px] text-muted-foreground mb-2.5'],
  ['text-[13px] text-muted-foreground mb-2">', 'text-[14px] text-muted-foreground mb-2.5">'],
  // Save bar
  ['max-w-xl mx-auto px-5 pb-5', 'max-w-3xl mx-auto px-8 pb-6'],
  ['max-w-xl mx-auto px-6 pb-6', 'max-w-3xl mx-auto px-8 pb-6'],
  ['max-w-3xl mx-auto px-6 pb-6', 'max-w-3xl mx-auto px-8 pb-6'],
  // パレット名
  ['text-[12px] font-medium text-foreground leading-tight', 'text-[14px] font-medium text-foreground leading-tight'],
  ['text-[13px] font-medium text-foreground leading-tight', 'text-[14px] font-medium text-foreground leading-tight'],
  // パレット説明
  ['text-[11px] text-muted-foreground mt-1 leading-snug', 'text-[13px] text-muted-foreground mt-1 leading-snug'],
  ['text-[12px] text-muted-foreground mt-1 leading-snug', 'text-[13px] text-muted-foreground mt-1 leading-snug'],
  // input-field CSS
  ['padding: 8px 12px;', 'padding: 12px 16px;'],
  ['border-radius: 10px;', 'border-radius: 12px;'],
  ['font-size: 13px;', 'font-size: 15px;'],
  // おすすめ順
  ['text-[10px] text-accent', 'text-[12px] text-accent'],
  ['text-[11px] text-accent bg-accent/8', 'text-[12px] text-accent bg-accent/8'],
]);

// ============================================================
// 6. globals.css — body フォントサイズ
// ============================================================
const cssPath = path.join(WEB_DIR, "src/app/globals.css");
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, "utf-8");
  if (!css.includes("font-size: 15px")) {
    css += "\n\nbody {\n  font-size: 15px;\n  line-height: 1.7;\n}\n";
    fs.writeFileSync(cssPath, css, "utf-8");
    console.log("  ✓ src/app/globals.css");
  } else {
    console.log("  ⏭  src/app/globals.css (既に適用済み)");
  }
}

console.log("\n✅ デザインパッチ適用完了！");
console.log("   ブラウザをリロードして確認してください\n");
