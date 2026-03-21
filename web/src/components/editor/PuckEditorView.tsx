"use client";

/**
 * PuckEditorView — Visual Page Editor powered by Puck
 *
 * This component wraps @measured/puck and provides:
 * - Drag & drop visual editing with Shopify-compatible components
 * - AI-assisted page generation (generates Puck JSON)
 * - Export to Shopify Liquid via the to-liquid converter
 * - Save/Load from Supabase via page API
 */

import { useState, useCallback } from "react";
import { Puck, Render } from "@measured/puck";
import type { Data } from "@measured/puck";
import "@measured/puck/puck.css";
import {
  ArrowLeft,
  Save,
  Download,
  Sparkles,
  Eye,
  Code,
  Loader2,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { puckConfig, createEmptyPuckData } from "@/lib/puck/config";
import { puckToLiquid } from "@/lib/puck/to-liquid";

interface PuckEditorViewProps {
  /** Initial Puck data (from saved page or AI generation) */
  initialData?: Data;
  /** Page ID for save operations */
  pageId?: string;
  /** Page title */
  pageTitle?: string;
  /** Navigate back */
  onBack: () => void;
  /** Called when page is saved */
  onSave?: (data: Data) => void;
}

type ViewMode = "edit" | "preview" | "liquid";

export default function PuckEditorView({
  initialData,
  pageId,
  pageTitle = "新しいページ",
  onBack,
  onSave,
}: PuckEditorViewProps) {
  const [data, setData] = useState<Data>(initialData ?? createEmptyPuckData());
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liquidOutput, setLiquidOutput] = useState<string>("");

  const handleSave = useCallback(
    async (puckData: Data) => {
      setSaving(true);
      try {
        setData(puckData);
        if (pageId) {
          await fetch(`/api/pages/${pageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              puckData: puckData,
              title: pageTitle,
            }),
          });
        }
        onSave?.(puckData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e) {
        console.error("[PuckEditor] Save failed:", e);
      } finally {
        setSaving(false);
      }
    },
    [pageId, pageTitle, onSave],
  );

  const handleExportLiquid = useCallback(() => {
    const output = puckToLiquid(data);
    setLiquidOutput(output.template);
    setViewMode("liquid");
  }, [data]);

  const handleCopyLiquid = useCallback(() => {
    navigator.clipboard.writeText(liquidOutput);
  }, [liquidOutput]);

  // Header toolbar
  const toolbar = (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white/80 backdrop-blur-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        戻る
      </button>

      <div className="flex-1 text-center">
        <span className="text-[15px] font-semibold text-foreground">
          {pageTitle}
        </span>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-black/[0.04]">
        {(
          [
            { mode: "edit", icon: Sparkles, label: "編集" },
            { mode: "preview", icon: Eye, label: "プレビュー" },
            { mode: "liquid", icon: Code, label: "Liquid" },
          ] as const
        ).map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => {
              if (mode === "liquid") handleExportLiquid();
              else setViewMode(mode);
            }}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all",
              viewMode === mode
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <button
        onClick={() => handleSave(data)}
        disabled={saving}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-all",
          "bg-gradient-to-r from-accent to-[#5b8def] text-white",
          "hover:shadow-md hover:shadow-accent/20 active:scale-[0.97]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <Check className="w-4 h-4" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? "保存中..." : saved ? "保存済み" : "保存"}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {toolbar}

      <div className="flex-1 overflow-hidden">
        {viewMode === "edit" && (
          <Puck
            config={puckConfig}
            data={data}
            onPublish={handleSave}
            onChange={setData}
          />
        )}

        {viewMode === "preview" && (
          <div className="h-full overflow-auto bg-white">
            <Render config={puckConfig} data={data} />
          </div>
        )}

        {viewMode === "liquid" && (
          <div className="h-full overflow-auto p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-foreground">
                  Shopify Liquid テンプレート
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLiquid}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border border-border hover:bg-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    コピー
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-gray-900 text-gray-100 text-[13px] leading-relaxed overflow-x-auto">
                <code>{liquidOutput}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
