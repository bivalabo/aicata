import type { CssPattern } from "../../types";

export const glassmorphismPattern: CssPattern = {
  id: "glassmorphism",
  name: "グラスモーフィズム＆モダン装飾",
  browserSupport: "95%+",

  promptContent: `
## グラスモーフィズム＆モダン装飾

### ガラス効果カード
\`\`\`css
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}
\`\`\`

### グラデーション背景セクション
\`\`\`css
.gradient-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
}
/* グラデーションの上にノイズテクスチャ風の効果 */
.gradient-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%);
  pointer-events: none;
}
\`\`\`

### ソフトシャドウシステム
\`\`\`css
:root {
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  --shadow-xl: 0 24px 60px rgba(0,0,0,0.08);
}
\`\`\`

### ボーダーグラデーション
\`\`\`css
.gradient-border {
  position: relative;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, #C9A96E, #E8D5B0, #C9A96E);
}
.gradient-border-inner {
  background: #fff;
  border-radius: 10px;
  padding: 32px;
}
\`\`\`

**使用ルール:**
- backdrop-filter は必ず -webkit-backdrop-filter も併記
- ガラス効果は白背景では効果が薄い → グラデーション / 画像背景の上で使う
- 影は控えめに: rgba(0,0,0,0.06) 程度でソフトに
`,
};
