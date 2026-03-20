// ============================================================
// ACE Layer 1: Media Atoms
// 画像・動画・アイコン・SVG
// ============================================================

import type { DesignAtom } from "../types";

export const ATOM_RESPONSIVE_IMAGE: DesignAtom = {
  id: "responsive-image",
  category: "media",
  tag: "img",
  name: "Responsive Image",
  description: "アスペクト比を維持するレスポンシブ画像。object-fit対応。",
  html: `<div class="atom-responsive-image">
  <img src="{{IMAGE_URL}}" alt="{{IMAGE_ALT}}" class="atom-responsive-image__img" loading="lazy" />
</div>`,
  css: `.atom-responsive-image {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius, 0);
  width: 100%;
}
.atom-responsive-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}`,
  variants: [
    { id: "square", label: "1:1 Square", overrideCss: `.atom-responsive-image--square { aspect-ratio: 1 / 1; }` },
    { id: "landscape", label: "16:9 Landscape", overrideCss: `.atom-responsive-image--landscape { aspect-ratio: 16 / 9; }` },
    { id: "portrait", label: "3:4 Portrait", overrideCss: `.atom-responsive-image--portrait { aspect-ratio: 3 / 4; }` },
    { id: "rounded", label: "Rounded corners", overrideCss: `.atom-responsive-image--rounded { border-radius: 8px; }` },
    { id: "hover-zoom", label: "Hover zoom", overrideCss: `.atom-responsive-image--hover-zoom:hover .atom-responsive-image__img { transform: scale(1.05); }` },
  ],
  tokens: ["--radius"],
  a11y: { role: "img", ariaLabel: "{{IMAGE_ALT}}", focusable: false },
};

export const ATOM_HERO_IMAGE: DesignAtom = {
  id: "hero-image",
  category: "media",
  tag: "img",
  name: "Hero Image",
  description: "全幅ヒーロー画像。ビューポート高さに対応。",
  html: `<div class="atom-hero-image">
  <img src="{{IMAGE_URL}}" alt="{{IMAGE_ALT}}" class="atom-hero-image__img" />
</div>`,
  css: `.atom-hero-image {
  position: relative;
  width: 100%;
  min-height: 50vh;
  max-height: 80vh;
  overflow: hidden;
}
.atom-hero-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}`,
  variants: [
    { id: "fullscreen", label: "Full viewport", overrideCss: `.atom-hero-image--fullscreen { min-height: 100vh; max-height: 100vh; }` },
    { id: "parallax", label: "Parallax effect", overrideCss: `.atom-hero-image--parallax .atom-hero-image__img { position: fixed; top: 0; }` },
    { id: "overlay", label: "Dark overlay", overrideCss: `.atom-hero-image--overlay::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.3); }` },
  ],
  tokens: [],
  a11y: { role: "img", ariaLabel: "{{IMAGE_ALT}}", focusable: false },
};

export const ATOM_ICON: DesignAtom = {
  id: "icon",
  category: "media",
  tag: "svg",
  name: "Icon",
  description: "SVGアイコン。サイズ・色をトークンで制御。",
  html: `<span class="atom-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    {{SVG_PATH}}
  </svg>
</span>`,
  css: `.atom-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-text);
  flex-shrink: 0;
}
.atom-icon svg {
  width: 100%;
  height: 100%;
}`,
  variants: [
    { id: "sm", label: "Small (16px)", overrideCss: `.atom-icon--sm { width: 16px; height: 16px; }` },
    { id: "lg", label: "Large (32px)", overrideCss: `.atom-icon--lg { width: 32px; height: 32px; }` },
    { id: "xl", label: "Extra Large (48px)", overrideCss: `.atom-icon--xl { width: 48px; height: 48px; }` },
    { id: "accent", label: "Accent color", overrideCss: `.atom-icon--accent { color: var(--color-accent); }` },
    { id: "circle", label: "Circle background", overrideCss: `.atom-icon--circle { background: var(--color-bg-secondary, #f5f5f5); border-radius: 50%; padding: 8px; width: 40px; height: 40px; }` },
  ],
  tokens: ["--color-text", "--color-accent", "--color-bg-secondary"],
  a11y: { role: "img", ariaLabel: "decorative icon", focusable: false },
};

export const ATOM_VIDEO_EMBED: DesignAtom = {
  id: "video-embed",
  category: "media",
  tag: "div",
  name: "Video Embed",
  description: "レスポンシブ動画埋め込み。16:9アスペクト比。",
  html: `<div class="atom-video-embed">
  <iframe src="{{VIDEO_URL}}" title="{{VIDEO_TITLE}}" allow="autoplay; encrypted-media" allowfullscreen class="atom-video-embed__iframe"></iframe>
</div>`,
  css: `.atom-video-embed {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius, 0);
  background: #000;
}
.atom-video-embed__iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}`,
  variants: [
    { id: "rounded", label: "Rounded", overrideCss: `.atom-video-embed--rounded { border-radius: 12px; }` },
    { id: "4-3", label: "4:3 ratio", overrideCss: `.atom-video-embed--4-3 { aspect-ratio: 4 / 3; }` },
  ],
  tokens: ["--radius"],
  a11y: { role: "region", ariaLabel: "Video player", focusable: true },
};

export const mediaAtoms: DesignAtom[] = [
  ATOM_RESPONSIVE_IMAGE,
  ATOM_HERO_IMAGE,
  ATOM_ICON,
  ATOM_VIDEO_EMBED,
];
