import type { CssPattern } from "../../types";

export const motionPattern: CssPattern = {
  id: "motion",
  name: "マイクロインタラクション＆モーション",
  browserSupport: "99%+",

  promptContent: `
## マイクロインタラクション・デザイン

洗練されたウェブサイトに欠かせないモーションデザイン。以下のパターンを活用してください。

### 基本イージング関数
\`\`\`css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
\`\`\`

### ホバーエフェクト（商品カード — 浮き上がり＋影）
\`\`\`css
.card {
  transition: transform 0.4s var(--ease-out-expo),
              box-shadow 0.4s ease;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}
.card img {
  transition: transform 0.6s var(--ease-out-expo);
}
.card:hover img {
  transform: scale(1.05);
}
\`\`\`

### ボタンのシャイン効果
\`\`\`css
.btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s var(--ease-out-quart);
}
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}
.btn:hover::after {
  transform: translateX(100%);
}
.btn:active {
  transform: scale(0.97);
}
\`\`\`

### フェードイン＋スライドアップ（セクション登場）
\`\`\`css
.fade-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeUp 0.8s var(--ease-out-expo) forwards;
}
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
\`\`\`

### テキスト揭示アニメーション（clip-path）
\`\`\`css
.reveal-text {
  clip-path: inset(0 100% 0 0);
  animation: textReveal 0.8s var(--ease-in-out) forwards;
}
@keyframes textReveal {
  to { clip-path: inset(0 0 0 0); }
}
\`\`\`

### 画像のケン・バーンズ効果（スロームーブ）
\`\`\`css
.ken-burns {
  overflow: hidden;
}
.ken-burns img {
  animation: slowZoom 20s ease-in-out infinite alternate;
}
@keyframes slowZoom {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}
\`\`\`

### アクセシビリティ対応（必須）
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

**デザイン原則:**
- @media (hover: hover) { } でホバーをポインターデバイスのみに限定
- 遷移時間は 0.3s〜0.6s（速すぎず遅すぎず）
- prefers-reduced-motion を必ず尊重する
- 1ページ内のアニメーション種類は3〜4種に抑える（統一感）
`,
};
