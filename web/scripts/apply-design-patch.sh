#!/bin/bash
# apply-design-patch.sh — ホスト側で実行するデザインパッチ
# Usage: cd web && bash scripts/apply-design-patch.sh
#
# FUSE マウント経由の編集では Turbopack が変更を検出できないため、
# ホスト OS のシェルから直接 sed で書き換える方式を採用。

set -e
cd "$(dirname "$0")/.."

echo "🎨 Aicata デザインパッチを適用中..."
echo ""

# ============================================================
# 1. SiteMapView — ページヘッダー上部パディング拡大
# ============================================================
FILE="src/components/pages/SiteMapView.tsx"
if [ -f "$FILE" ]; then
  # pt-6 → pt-14, px-6 → px-8, pb-4 → pb-6
  sed -i '' 's/shrink-0 px-6 pt-6 pb-4/shrink-0 px-8 pt-14 pb-6/g' "$FILE"
  # text-xl → text-2xl
  sed -i '' 's/text-xl font-bold text-foreground mb-0.5/text-2xl font-bold text-foreground mb-1/g' "$FILE"
  # mb-2 → mb-3
  sed -i '' 's/flex items-center justify-between mb-2/flex items-center justify-between mb-3/g' "$FILE"
  echo "  ✓ $FILE"
fi

# ============================================================
# 2. SiteBuilderView — ページヘッダー上部パディング拡大
# ============================================================
FILE="src/components/site-builder/SiteBuilderView.tsx"
if [ -f "$FILE" ]; then
  sed -i '' 's/shrink-0 px-6 pt-6 pb-4/shrink-0 px-8 pt-14 pb-6/g' "$FILE"
  sed -i '' 's/text-xl font-bold text-foreground/text-2xl font-bold text-foreground/g' "$FILE"
  sed -i '' 's/flex items-center justify-between mb-4/flex items-center justify-between mb-5/g' "$FILE"
  echo "  ✓ $FILE"
fi

# ============================================================
# 3. Sidebar — 履歴テキストを濃く
# ============================================================
FILE="src/components/layout/Sidebar.tsx"
if [ -f "$FILE" ]; then
  # プロジェクトヘッダー
  sed -i '' 's/text-\[12px\] text-muted-foreground uppercase tracking-widest/text-[12px] text-foreground\/60 uppercase tracking-widest/g' "$FILE"
  # 件数
  sed -i '' 's/text-\[11px\] text-muted-foreground\/50">\s*{totalCount}/text-[11px] text-foreground\/40">\n            {totalCount}/g' "$FILE"
  # 会話タイトル（非アクティブ）
  sed -i '' 's/: "text-muted-foreground"/: "text-foreground\/70"/g' "$FILE"
  # RelativeTime
  sed -i '' 's/text-\[11px\] text-muted-foreground\/50"/text-[11px] text-foreground\/40"/g' "$FILE"
  # デフォルトアイコン
  sed -i '' 's/w-3 h-3 text-muted-foreground\/40/w-3 h-3 text-foreground\/30/g' "$FILE"
  # 空状態テキスト
  sed -i '' 's/text-\[14px\] text-muted-foreground px-3 py-8/text-[14px] text-foreground\/50 px-3 py-8/g' "$FILE"
  echo "  ✓ $FILE"
fi

# ============================================================
# 4. SettingsView — 幅拡大 & フォントサイズ増加
# ============================================================
FILE="src/components/settings/SettingsView.tsx"
if [ -f "$FILE" ]; then
  # max-w-xl → max-w-3xl, padding拡大
  sed -i '' 's/max-w-xl mx-auto px-6 py-10/max-w-3xl mx-auto px-8 pt-16 pb-14/g' "$FILE"
  # タイトル
  sed -i '' 's/text-xl font-bold text-foreground mb-2">設定/text-3xl font-bold text-foreground mb-2">設定/g' "$FILE"
  # 説明文
  sed -i '' 's/text-sm text-muted-foreground mb-8/text-[15px] text-muted-foreground mb-10/g' "$FILE"
  # Shopifyストア接続タイトル
  sed -i '' 's/text-\[15px\] font-semibold text-foreground">\s*Shopify/text-[18px] font-semibold text-foreground">\n                Shopify/g' "$FILE"
  # 接続状態テキスト
  sed -i '' 's/text-\[12px\] text-muted-foreground">\s*{connected/text-[14px] text-muted-foreground">\n                {connected/g' "$FILE"
  # ストア情報ラベル
  sed -i '' 's/text-\[12px\] text-muted-foreground block mb-1/text-[14px] text-muted-foreground block mb-1/g' "$FILE"
  # セットアップ手順タイトル
  sed -i '' 's/text-\[13px\] font-semibold text-foreground mb-2/text-[16px] font-semibold text-foreground mb-3/g' "$FILE"
  echo "  ✓ $FILE"
fi

# ============================================================
# 5. BrandMemoryView — 幅拡大 & フォントサイズ増加
# ============================================================
FILE="src/components/settings/BrandMemoryView.tsx"
if [ -f "$FILE" ]; then
  # max-w-2xl → max-w-3xl
  sed -i '' 's/max-w-2xl mx-auto space-y-8/max-w-3xl mx-auto space-y-10/g' "$FILE"
  # Brand Memory タイトル
  sed -i '' 's/text-\[17px\] font-bold text-foreground/text-[22px] font-bold text-foreground/g' "$FILE"
  # ヘッダー説明
  sed -i '' 's/text-\[12px\] text-muted-foreground">\s*相方/text-[15px] text-muted-foreground">\n            相方/g' "$FILE"
  # セクションタイトル
  sed -i '' 's/text-\[14px\] font-semibold text-foreground">{title}/text-[17px] font-semibold text-foreground">{title}/g' "$FILE"
  # フィールドラベル
  sed -i '' 's/text-\[12px\] font-medium text-foreground mb-1.5/text-[15px] font-medium text-foreground mb-2/g' "$FILE"
  # Save bar
  sed -i '' 's/max-w-xl mx-auto px-5/max-w-3xl mx-auto px-8/g' "$FILE"
  echo "  ✓ $FILE"
fi

# ============================================================
# 6. globals.css — body フォントサイズ
# ============================================================
FILE="src/app/globals.css"
if grep -q "font-size: 15px" "$FILE" 2>/dev/null; then
  echo "  ⏭  $FILE (既に適用済み)"
else
  # body にフォントサイズを追加（既存のbodyブロックがない場合）
  if ! grep -q "body {" "$FILE" 2>/dev/null; then
    echo "" >> "$FILE"
    echo "body { font-size: 15px; line-height: 1.7; }" >> "$FILE"
    echo "  ✓ $FILE"
  else
    echo "  ⏭  $FILE (bodyブロック既存)"
  fi
fi

echo ""
echo "✅ デザインパッチの適用が完了しました"
echo "   ブラウザをリロードして確認してください"
echo ""
