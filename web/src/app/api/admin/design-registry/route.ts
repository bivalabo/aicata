// ============================================================
// Admin API: Design Registry
// テンプレート・セクション・HQSスコアの一覧を返す
// ============================================================

import { NextResponse } from "next/server";
import { getAllTemplates } from "@/lib/design-engine/template-selector";
import { getAllSections } from "@/lib/design-engine/knowledge/sections/registry";
import { getAllSectionMeta, computeHQSComposite } from "@/lib/ddp-next";
import { buildFullHtml } from "@/components/preview/LivePreview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ── テンプレート一覧 ──
    const rawTemplates = getAllTemplates();
    const templates = rawTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      industries: t.industries,
      tones: t.tones,
      pageType: t.pageType,
      sectionCount: t.sections.length,
      sectionIds: t.sections
        .sort((a, b) => a.order - b.order)
        .map((s) => s.sectionId),
      designTokens: {
        colors: t.designTokens.colors,
        typography: t.designTokens.typography,
      },
      fonts: t.fonts,
    }));

    // ── セクション一覧 ──
    const rawSections = getAllSections();
    const sectionMetas = getAllSectionMeta();
    const metaMap = new Map(sectionMetas.map((m) => [m.sectionId, m]));

    const sections = rawSections.map((s) => {
      const meta = metaMap.get(s.id);
      const hqs = meta?.hqs;
      const composite = hqs ? computeHQSComposite(hqs) : null;

      return {
        id: s.id,
        category: s.category,
        variant: s.variant,
        name: s.name,
        description: s.description,
        tones: s.tones,
        placeholderCount: s.placeholders?.length ?? 0,
        animationCount: s.animations?.length ?? 0,
        htmlLength: s.html.length,
        cssLength: s.css.length,
        // HQS
        hqs: hqs ?? null,
        hqsComposite: composite,
        // DNA
        dna: meta?.dna ?? null,
        // Flow hints
        flowsWellAfter: meta?.flowsWellAfter ?? null,
        flowsWellBefore: meta?.flowsWellBefore ?? null,
      };
    });

    // ── 統計 ──
    const stats = {
      totalTemplates: templates.length,
      totalSections: sections.length,
      categoryCounts: {} as Record<string, number>,
      industryCount: {} as Record<string, number>,
      avgHQS: 0,
    };

    for (const s of sections) {
      stats.categoryCounts[s.category] = (stats.categoryCounts[s.category] || 0) + 1;
    }
    for (const t of templates) {
      for (const ind of t.industries) {
        stats.industryCount[ind] = (stats.industryCount[ind] || 0) + 1;
      }
    }
    const hqsValues = sections.filter((s) => s.hqsComposite !== null).map((s) => s.hqsComposite!);
    stats.avgHQS = hqsValues.length > 0
      ? Math.round((hqsValues.reduce((a, b) => a + b, 0) / hqsValues.length) * 100) / 100
      : 0;

    return NextResponse.json({ templates, sections, stats });
  } catch (err) {
    console.error("[Admin API] design-registry error:", err);
    return NextResponse.json(
      { error: "Failed to load design registry" },
      { status: 500 },
    );
  }
}
