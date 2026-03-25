"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, X } from "lucide-react";
import clsx from "clsx";
import { getSwapCandidates } from "@/lib/ddp-next/section-swap";
import type { DesignDNAPreferences } from "@/lib/ace-adis/types";

interface SectionSwapPanelProps {
  sectionId: string;
  targetDNA: DesignDNAPreferences;
  onSwap: (newSectionId: string) => void;
  onClose: () => void;
}

/**
 * セクション置換パネル
 * - 現在のセクションと同カテゴリの代替デザイン候補を表示
 * - HQS Composite とDNA Distanceをスコア表示
 * - 「置換」ボタンで新しいセクションに切り替え
 */
export default function SectionSwapPanel({
  sectionId,
  targetDNA,
  onSwap,
  onClose,
}: SectionSwapPanelProps) {
  const candidates = useMemo(
    () => getSwapCandidates(sectionId, targetDNA, 8),
    [sectionId, targetDNA]
  );

  // 現在のセクションを特定
  const currentCandidate = candidates.find((c) => c.isCurrent);
  const alternatives = candidates.filter((c) => !c.isCurrent);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-80 h-full flex flex-col bg-[#10101f] border-l border-white/[0.06] overflow-hidden"
    >
      {/* ═══════ ヘッダー ═══════ */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-white/60" />
          <h2 className="text-sm font-semibold text-white/80">セクション置換</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          title="パネルを閉じる"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ═══════ コンテンツ ═══════ */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-3">
          {/* 現在のセクション表示 */}
          {currentCandidate && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/50">現在のセクション</p>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white/90">
                    {currentCandidate.section.name}
                  </p>
                  <span className="inline-block bg-accent/30 text-accent text-[9px] font-bold px-2 py-1 rounded">
                    使用中
                  </span>
                </div>
                <div className="space-y-1 text-xs text-white/50">
                  <p>HQS: {currentCandidate.hqsComposite.toFixed(2)}</p>
                  <p>DNA距離: {(currentCandidate.dnaDistance * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* 代替デザイン候補 */}
          {alternatives.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-white/[0.06]">
              <p className="text-xs font-medium text-white/50">
                代替デザイン ({alternatives.length})
              </p>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {alternatives.map((candidate, idx) => (
                    <motion.div
                      key={candidate.section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-accent/30 hover:bg-white/[0.06] transition-all p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/90 truncate">
                            {candidate.section.name}
                          </p>
                          <p className="text-xs text-white/40">
                            {candidate.section.category}
                          </p>
                        </div>
                      </div>

                      {/* スコア表示 */}
                      <div className="space-y-2 mb-3">
                        {/* HQS Composite */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">HQS</span>
                            <span className="text-xs font-semibold text-white/70">
                              {candidate.hqsComposite.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                              style={{
                                width: `${(candidate.hqsComposite / 5) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* DNA距離 */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">DNA適合度</span>
                            <span className="text-xs font-semibold text-white/70">
                              {((1 - candidate.dnaDistance) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                              style={{
                                width: `${(1 - candidate.dnaDistance) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* 総合スコア */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">総合スコア</span>
                            <span className="text-xs font-semibold text-accent">
                              {(candidate.score * 100).toFixed(0)}
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent to-purple-400 rounded-full transition-all duration-300"
                              style={{
                                width: `${candidate.score * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 置換ボタン */}
                      <button
                        onClick={() => onSwap(candidate.section.id)}
                        className={clsx(
                          "w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all",
                          "bg-accent/20 text-accent hover:bg-accent/30 hover:shadow-lg hover:shadow-accent/20",
                          "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all"
                        )}
                      >
                        このデザインに置換
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* 候補なし */}
          {alternatives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-white/40">
              <p className="text-sm">代替デザイン候補がありません</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
