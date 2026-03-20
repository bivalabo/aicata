import { NextRequest, NextResponse } from "next/server";
import {
  selectBestTemplate,
  assembleFullHtml,
  type DesignContext,
} from "@/lib/design-engine";

/**
 * GET /api/template-preview
 *
 * Returns a template preview based on onboarding selections.
 *
 * Query params:
 *   - industry: string (beauty, food, fashion, lifestyle, tech, health, general)
 *   - tone: string (luxury, natural, modern, playful, minimal, bold, etc)
 *   - pageType: string (landing, product, collection, cart, about, etc)
 *
 * Response: { templateId, templateName, html, score }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const industry = searchParams.get("industry") || "general";
    const tone = searchParams.get("tone") || "modern";
    const pageType = searchParams.get("pageType") || "landing";

    // Build DesignContext for template selection
    const context: DesignContext = {
      industry: industry as DesignContext["industry"],
      tones: tone ? [tone as DesignContext["tones"][number]] : [],
      pageType: pageType as DesignContext["pageType"],
      cssFeatures: [],
      keywords: [],
      confidence: 0.7,
    };

    // Select best matching template
    const match = selectBestTemplate(context);
    const template = match.template;

    // Generate full HTML preview
    const html = assembleFullHtml(template);

    // Return preview data
    return NextResponse.json({
      templateId: template.id,
      templateName: template.name || template.id,
      html,
      score: match.score,
      pageType: template.pageType,
    });
  } catch (error) {
    console.error("[template-preview API]", error);
    return NextResponse.json(
      { error: "Failed to generate template preview" },
      { status: 500 }
    );
  }
}
