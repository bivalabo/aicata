// ============================================================
// Aicata Design Engine — Compatibility Checker
//
// デプロイ前にShopify互換性を自動チェック
// テーマアップデートに起因するトラブルを未然に防止
// ============================================================

import type { SectionTemplate, PageTemplate, DeployCompatibility } from "./types";
import { getSectionById } from "./knowledge/sections/registry";

// ============================================================
// Types
// ============================================================

export type CompatibilityLevel = "ok" | "warning" | "error";

export interface CompatibilityIssue {
  level: CompatibilityLevel;
  code: string;
  message: string;
  messageJa: string;
  section?: string;
  fix?: string;
}

export interface CompatibilityReport {
  passed: boolean;
  issues: CompatibilityIssue[];
  compatibility: DeployCompatibility;
  checkedAt: string;
}

// ============================================================
// Deprecated Liquid Tags/Filters (Shopify 2024-2026)
// ============================================================

const DEPRECATED_LIQUID: Array<{
  pattern: RegExp;
  code: string;
  message: string;
  messageJa: string;
  replacement: string;
}> = [
  {
    pattern: /\{\{.*?\|\s*img_url\s*[:\s]/g,
    code: "DEPRECATED_IMG_URL",
    message: "img_url filter is deprecated. Use image_url instead.",
    messageJa: "img_url フィルターは非推奨です。image_url を使用してください。",
    replacement: "image_url",
  },
  {
    pattern: /\{\{.*?\|\s*img_tag\b/g,
    code: "DEPRECATED_IMG_TAG",
    message: "img_tag filter is deprecated. Use image_tag instead.",
    messageJa: "img_tag フィルターは非推奨です。image_tag を使用してください。",
    replacement: "image_tag",
  },
  {
    pattern: /\{\{\s*include\s+['"][^'"]+['"]/g,
    code: "DEPRECATED_INCLUDE",
    message: "{% include %} is deprecated. Use {% render %} instead.",
    messageJa: "{% include %} は非推奨です。{% render %} を使用してください。",
    replacement: "{% render %}",
  },
  {
    pattern: /\bproduct\.featured_image\b/g,
    code: "DEPRECATED_FEATURED_IMAGE",
    message: "product.featured_image is deprecated. Use product.featured_media instead.",
    messageJa: "product.featured_image は非推奨。product.featured_media を使用してください。",
    replacement: "product.featured_media",
  },
  {
    pattern: /\|\s*json\b/g,
    code: "CHECK_JSON_FILTER",
    message: "Ensure json filter output is properly escaped for XSS prevention.",
    messageJa: "json フィルターの出力が適切にエスケープされているか確認してください。",
    replacement: "",
  },
];

// ============================================================
// Accessibility Checks
// ============================================================

const ACCESSIBILITY_CHECKS: Array<{
  pattern: RegExp;
  missing: RegExp;
  code: string;
  message: string;
  messageJa: string;
}> = [
  {
    pattern: /<img\b/g,
    missing: /alt\s*=/,
    code: "A11Y_IMG_ALT",
    message: "Image tags should have alt attributes for accessibility.",
    messageJa: "画像タグには alt 属性が必要です（アクセシビリティ）。",
  },
  {
    pattern: /<button\b/g,
    missing: /aria-label|aria-labelledby|>[^<]+</,
    code: "A11Y_BUTTON_LABEL",
    message: "Buttons should have accessible labels.",
    messageJa: "ボタンにはアクセシブルなラベルが必要です。",
  },
  {
    pattern: /<nav\b/g,
    missing: /aria-label|role/,
    code: "A11Y_NAV_LABEL",
    message: "Navigation elements should have aria-label.",
    messageJa: "ナビゲーション要素には aria-label が必要です。",
  },
];

// ============================================================
// Public API
// ============================================================

/**
 * ページテンプレートの Shopify 互換性をチェック
 */
export function checkCompatibility(
  pageTemplate: PageTemplate,
  options?: {
    shopifyApiVersion?: string;
    checkAccessibility?: boolean;
    checkDeprecated?: boolean;
    checkPerformance?: boolean;
  },
): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];
  const opts = {
    shopifyApiVersion: "2025-04",
    checkAccessibility: true,
    checkDeprecated: true,
    checkPerformance: true,
    ...options,
  };

  // セクションごとにチェック
  for (const ref of pageTemplate.sections) {
    const section = getSectionById(ref.sectionId);
    if (!section) {
      issues.push({
        level: "error",
        code: "MISSING_SECTION",
        message: `Section "${ref.sectionId}" not found in registry.`,
        messageJa: `セクション "${ref.sectionId}" がレジストリに見つかりません。`,
        section: ref.sectionId,
      });
      continue;
    }

    // 非推奨 Liquid チェック
    if (opts.checkDeprecated) {
      checkDeprecatedLiquid(section, issues);
    }

    // アクセシビリティチェック
    if (opts.checkAccessibility) {
      checkAccessibility(section, issues);
    }

    // パフォーマンスチェック
    if (opts.checkPerformance) {
      checkPerformance(section, issues);
    }
  }

  // CSS isolation check
  checkCssIsolation(pageTemplate, issues);

  const hasErrors = issues.some((i) => i.level === "error");

  return {
    passed: !hasErrors,
    issues,
    compatibility: {
      shopifyApiVersion: opts.shopifyApiVersion,
      themeBlocksUsed: false, // Will be true when we implement theme blocks
      colorSchemesUsed: true,
      appBlocksEnabled: true,
      deployMode: "template",
    },
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Liquid テンプレート文字列を直接チェック（デプロイ前の最終チェック用）
 */
export function checkLiquidContent(
  liquidContent: string,
  sectionId: string,
): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  // 非推奨 Liquid パターン
  for (const dep of DEPRECATED_LIQUID) {
    const matches = liquidContent.match(dep.pattern);
    if (matches) {
      issues.push({
        level: "warning",
        code: dep.code,
        message: dep.message,
        messageJa: dep.messageJa,
        section: sectionId,
        fix: dep.replacement,
      });
    }
  }

  // Schema validation
  const schemaMatch = liquidContent.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/);
  if (schemaMatch) {
    try {
      const schema = JSON.parse(schemaMatch[1]);
      if (!schema.name) {
        issues.push({
          level: "error",
          code: "SCHEMA_MISSING_NAME",
          message: "Section schema must have a 'name' field.",
          messageJa: "セクションスキーマには 'name' フィールドが必要です。",
          section: sectionId,
        });
      }
    } catch (e) {
      issues.push({
        level: "error",
        code: "SCHEMA_INVALID_JSON",
        message: "Section schema contains invalid JSON.",
        messageJa: "セクションスキーマの JSON が不正です。",
        section: sectionId,
      });
    }
  }

  return issues;
}

// ============================================================
// Internal Checks
// ============================================================

function checkDeprecatedLiquid(
  section: SectionTemplate,
  issues: CompatibilityIssue[],
): void {
  const content = section.html + "\n" + section.css;

  for (const dep of DEPRECATED_LIQUID) {
    const matches = content.match(dep.pattern);
    if (matches) {
      issues.push({
        level: "warning",
        code: dep.code,
        message: dep.message,
        messageJa: dep.messageJa,
        section: section.id,
        fix: dep.replacement,
      });
    }
  }
}

function checkAccessibility(
  section: SectionTemplate,
  issues: CompatibilityIssue[],
): void {
  const html = section.html;

  for (const check of ACCESSIBILITY_CHECKS) {
    const elements = html.match(check.pattern);
    if (elements) {
      for (const element of elements) {
        // Extract the full tag
        const startIdx = html.indexOf(element);
        const endIdx = html.indexOf(">", startIdx);
        const fullTag = html.slice(startIdx, endIdx + 1);

        if (!check.missing.test(fullTag)) {
          issues.push({
            level: "warning",
            code: check.code,
            message: check.message,
            messageJa: check.messageJa,
            section: section.id,
          });
          break; // Report once per section
        }
      }
    }
  }
}

function checkPerformance(
  section: SectionTemplate,
  issues: CompatibilityIssue[],
): void {
  const css = section.css;

  // 巨大なCSSは警告
  if (css.length > 10000) {
    issues.push({
      level: "warning",
      code: "PERF_LARGE_CSS",
      message: `Section CSS is ${Math.round(css.length / 1024)}KB. Consider splitting or optimizing.`,
      messageJa: `セクションCSS が ${Math.round(css.length / 1024)}KB です。分割または最適化を検討してください。`,
      section: section.id,
    });
  }

  // @import in section CSS (blocking)
  if (css.includes("@import")) {
    issues.push({
      level: "warning",
      code: "PERF_CSS_IMPORT",
      message: "Avoid @import in section CSS. Use asset_url | stylesheet_tag instead.",
      messageJa: "セクションCSS での @import は避けてください。asset_url | stylesheet_tag を使用してください。",
      section: section.id,
    });
  }

  // Large inline images (base64)
  const base64Matches = section.html.match(/data:image\/[^;]+;base64,[^"')]+/g);
  if (base64Matches && base64Matches.some((m) => m.length > 5000)) {
    issues.push({
      level: "warning",
      code: "PERF_INLINE_IMAGE",
      message: "Large inline base64 images detected. Use Shopify CDN (image_url) instead.",
      messageJa: "大きなインライン base64 画像が検出されました。Shopify CDN (image_url) を使用してください。",
      section: section.id,
    });
  }
}

function checkCssIsolation(
  pageTemplate: PageTemplate,
  issues: CompatibilityIssue[],
): void {
  for (const ref of pageTemplate.sections) {
    const section = getSectionById(ref.sectionId);
    if (!section) continue;

    // Check for potential CSS leaks (global selectors without .aicata- prefix)
    const globalSelectors = section.css.match(
      /(?:^|\n)\s*(?:body|html|main|header|footer|nav|a|p|h[1-6]|ul|li|img)\s*\{/g,
    );
    if (globalSelectors) {
      issues.push({
        level: "warning",
        code: "CSS_GLOBAL_SELECTOR",
        message: `Section uses global CSS selectors that may conflict with the base theme: ${globalSelectors.map((s) => s.trim()).join(", ")}`,
        messageJa: `ベーステーマと競合する可能性のあるグローバルCSS セレクタを使用しています: ${globalSelectors.map((s) => s.trim()).join(", ")}`,
        section: section.id,
      });
    }
  }
}

// ============================================================
// Deployment Versioning
// ============================================================

export interface DeploymentSnapshot {
  id: string;
  storeId: string;
  themeId: number;
  templateSuffix: string;
  files: Array<{
    key: string;
    checksum: string;
  }>;
  compatibility: DeployCompatibility;
  deployedAt: string;
  pageTemplateId: string;
  version: number;
}

/**
 * デプロイファイルのチェックサム生成（ロールバック判定用）
 */
export function generateFileChecksum(content: string): string {
  // Simple hash for content comparison (not cryptographic)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * 2つのスナップショットの差分を計算
 */
export function diffSnapshots(
  prev: DeploymentSnapshot,
  next: DeploymentSnapshot,
): {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
} {
  const prevMap = new Map(prev.files.map((f) => [f.key, f.checksum]));
  const nextMap = new Map(next.files.map((f) => [f.key, f.checksum]));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];

  for (const [key, checksum] of nextMap) {
    if (!prevMap.has(key)) {
      added.push(key);
    } else if (prevMap.get(key) !== checksum) {
      modified.push(key);
    } else {
      unchanged.push(key);
    }
  }

  for (const key of prevMap.keys()) {
    if (!nextMap.has(key)) {
      removed.push(key);
    }
  }

  return { added, removed, modified, unchanged };
}
