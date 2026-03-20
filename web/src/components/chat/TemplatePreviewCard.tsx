"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

/**
 * TemplatePreviewCard
 *
 * Shows a live preview of the template that will be used based on onboarding selections.
 * Displays:
 * - Template name
 * - Small inline iframe preview (200x150)
 * - "Selected" indicator
 * - Loads from /api/template-preview
 *
 * Props:
 * - industry: string
 * - tone: string
 * - pageType: string
 */

interface TemplatePreviewCardProps {
  industry: string;
  tone: string;
  pageType: string;
}

interface PreviewData {
  templateId: string;
  templateName: string;
  html: string;
  score: number;
  pageType: string;
}

export default function TemplatePreviewCard({
  industry,
  tone,
  pageType,
}: TemplatePreviewCardProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          industry,
          tone,
          pageType,
        });

        const response = await fetch(`/api/template-preview?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch template preview");
        }

        const data = await response.json();
        setPreview(data);
      } catch (err) {
        console.error("[TemplatePreviewCard]", err);
        setError(
          err instanceof Error ? err.message : "Failed to load preview"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [industry, tone, pageType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full mt-6 p-4 rounded-xl border border-border bg-gradient-to-br from-white/50 to-white/20 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase text-muted tracking-wide">
            テンプレートプレビュー
          </span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Check className="w-3.5 h-3.5 text-green-500" />
          </motion.div>
        </div>

        {/* Selected Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 border border-green-200">
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-[11px] font-semibold text-green-700">
            選択済み
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-3">
        {/* Template Name */}
        {!loading && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/60 border border-border/50"
          >
            <div>
              <p className="text-[11px] text-muted font-medium mb-1">
                選択されたテンプレート
              </p>
              <p className="text-[13px] font-semibold text-foreground">
                {preview.templateName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted mb-1">マッチスコア</p>
              <p className="text-[14px] font-bold text-accent">
                {Math.round(preview.score * 100)}%
              </p>
            </div>
          </motion.div>
        )}

        {/* Preview Container */}
        <div className="relative bg-white rounded-lg border border-border/50 overflow-hidden">
          {loading && (
            <motion.div
              className="h-[150px] flex items-center justify-center bg-gradient-to-b from-white to-gray-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <p className="text-[11px] text-muted">
                  プレビューを読み込み中...
                </p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="h-[150px] flex items-center justify-center bg-red-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-[11px] text-red-600 text-center px-4">
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {!loading && !error && preview && (
            <motion.iframe
              key={preview.templateId}
              srcDoc={preview.html}
              className="w-full h-[150px] border-0"
              sandbox=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              title="Template Preview"
            />
          )}
        </div>

        {/* Info Footer */}
        {!loading && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200"
          >
            <p className="text-[11px] text-blue-700 leading-relaxed">
              このテンプレートを基に、次のステップで詳細な{" "}
              <span className="font-semibold">HTML/CSS</span>
              が生成されます。「作成を開始する」をクリックしてください。
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
