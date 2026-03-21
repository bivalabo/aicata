import type { CssPattern } from "../../types";

export const scrollAnimationsPattern: CssPattern = {
  id: "scroll-animations",
  name: "スクロール駆動アニメーション",
  browserSupport: "85%+ (Chrome, Edge, Safari 18.4+)",

  promptContent: `
## スクロール駆動アニメーション（CSS Scroll-Driven Animations）

JavaScriptなしで高パフォーマンスなスクロール連動アニメーションを実現する最新CSS機能。
**重要:** フォールバックを必ず含めること。

### フェードイン＋スライドアップ（ビューポート連動 — 最も使える）
\`\`\`css
.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
}
@supports (animation-timeline: view()) {
  .scroll-reveal {
    animation: scrollFadeUp linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 35%;
  }
}
@keyframes scrollFadeUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* フォールバック: JSがない環境では最初から見える */
@supports not (animation-timeline: view()) {
  .scroll-reveal {
    opacity: 1;
    transform: none;
  }
}
\`\`\`

### 横からスライドイン（左右交互）
\`\`\`css
.slide-in-left {
  opacity: 0;
  transform: translateX(-60px);
}
.slide-in-right {
  opacity: 0;
  transform: translateX(60px);
}
@supports (animation-timeline: view()) {
  .slide-in-left, .slide-in-right {
    animation: slideIn linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }
}
@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
\`\`\`

### スクロール進捗バー（ページ全体のスクロール量を表示）
\`\`\`css
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent, #3B82F6);
  transform-origin: left;
  z-index: 9999;
}
@supports (animation-timeline: scroll()) {
  .scroll-progress {
    animation: growProgress linear;
    animation-timeline: scroll();
  }
}
@keyframes growProgress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
\`\`\`

### 画像のパララックス風
\`\`\`css
.parallax-img {
  overflow: hidden;
}
.parallax-img img {
  height: 120%;
  object-fit: cover;
}
@supports (animation-timeline: view()) {
  .parallax-img img {
    animation: parallaxShift linear both;
    animation-timeline: view();
  }
}
@keyframes parallaxShift {
  from { transform: translateY(-10%); }
  to { transform: translateY(10%); }
}
\`\`\`

**使用ルール:**
- animation-timeline: view() → 要素がビューポートに入ったときのアニメーション
- animation-timeline: scroll() → ページ全体のスクロール進捗
- animation-range: entry 0% entry 35% → ビューポートに入り始めてから35%まで
- @supports で必ず機能検出する（非対応ブラウザではフォールバック表示）
- フォールバック: opacity: 1; transform: none; で最初から見える状態にする
`,
};
