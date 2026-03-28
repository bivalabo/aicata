"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  PenTool,
  LayoutGrid,
  FileText,
  Paintbrush,
  Eye,
} from "lucide-react";

interface GeneratingOverlayProps {
  isGenerating: boolean;
  /** When generation finishes, play reveal animation then call this */
  onRevealComplete?: () => void;
}

// ============================================================
// 5-Stage Progressive Build Phases
// ============================================================

interface BuildPhase {
  id: string;
  icon: React.ElementType;
  label: string;
  sub: string;
  /** グラデーション色（アクセント） */
  color: string;
  colorLight: string;
}

const BUILD_PHASES: BuildPhase[] = [
  {
    id: "blueprint",
    icon: PenTool,
    label: "設計図を描いています",
    sub: "ページ構造とセクションを設計中",
    color: "rgba(124,92,252,0.8)",
    colorLight: "rgba(124,92,252,0.12)",
  },
  {
    id: "section-place",
    icon: LayoutGrid,
    label: "セクションを配置しています",
    sub: "レイアウトにコンポーネントを組み込み中",
    color: "rgba(91,141,239,0.8)",
    colorLight: "rgba(91,141,239,0.12)",
  },
  {
    id: "content-inject",
    icon: FileText,
    label: "コンテンツを注入しています",
    sub: "テキスト・画像・要素を配置中",
    color: "rgba(16,185,129,0.8)",
    colorLight: "rgba(16,185,129,0.12)",
  },
  {
    id: "polish",
    icon: Paintbrush,
    label: "仕上げをしています",
    sub: "カラー・フォント・シャドウを調整中",
    color: "rgba(245,158,11,0.8)",
    colorLight: "rgba(245,158,11,0.12)",
  },
  {
    id: "reveal",
    icon: Eye,
    label: "完成間近です",
    sub: "最終チェック・レスポンシブ調整中",
    color: "rgba(236,72,153,0.8)",
    colorLight: "rgba(236,72,153,0.12)",
  },
];

// ============================================================
// Sub-components
// ============================================================

/** Blueprint wireframe skeleton animation */
function BlueprintSkeleton({ phase }: { phase: number }) {
  return (
    <div className="w-48 h-32 rounded-lg border border-accent/20 overflow-hidden bg-white/40 relative">
      {/* Header skeleton */}
      <motion.div
        className="h-4 mx-3 mt-3 rounded bg-accent/10"
        initial={{ width: 0 }}
        animate={{ width: phase >= 0 ? "60%" : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      {/* Hero block */}
      <motion.div
        className="h-10 mx-3 mt-2 rounded bg-accent/[0.07]"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{
          opacity: phase >= 1 ? 1 : 0,
          scaleY: phase >= 1 ? 1 : 0,
        }}
        style={{ transformOrigin: "top" }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
      {/* Content blocks */}
      <div className="flex gap-2 mx-3 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="flex-1 h-6 rounded bg-accent/[0.05]"
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: phase >= 2 ? 1 : 0,
              y: phase >= 2 ? 0 : 8,
            }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
          />
        ))}
      </div>
      {/* Color sweep overlay */}
      {phase >= 3 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.06), transparent)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
      {/* Reveal glow */}
      {phase >= 4 && (
        <motion.div
          className="absolute inset-0 bg-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </div>
  );
}

/** Phase step indicator */
function PhaseSteps({ currentPhase }: { currentPhase: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {BUILD_PHASES.map((phase, i) => {
        const PhaseIcon = phase.icon;
        const isActive = i === currentPhase;
        const isCompleted = i < currentPhase;

        return (
          <motion.div
            key={phase.id}
            className={clsx(
              "flex items-center justify-center rounded-full transition-all duration-300",
              isActive
                ? "w-8 h-8 bg-accent/10 ring-2 ring-accent/20"
                : isCompleted
                  ? "w-6 h-6 bg-accent/[0.06]"
                  : "w-6 h-6 bg-black/[0.03]",
            )}
            animate={isActive ? { scale: [1, 1.1, 1] } : {}}
            transition={isActive ? { duration: 2, repeat: Infinity } : {}}
          >
            <PhaseIcon
              className={clsx(
                "transition-all duration-300",
                isActive
                  ? "w-4 h-4 text-accent"
                  : isCompleted
                    ? "w-3 h-3 text-accent/50"
                    : "w-3 h-3 text-muted-foreground/30",
              )}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

// Need clsx import
import clsx from "clsx";

/** Floating particle */
function Particle({ delay, duration, x, y, size }: {
  delay: number; duration: number; x: number; y: number; size: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, rgba(124,92,252,0.4) 0%, rgba(91,141,239,0.1) 70%, transparent 100%)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0.4, 0.8, 0],
        scale: [0, 1, 0.8, 1.1, 0],
        y: [0, -30, -15, -40, -60],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/** Grid background */
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="gen-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gen-grid)" className="text-accent" />
      </svg>
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(124,92,252,0.08) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** Progress bar with gradient based on phase */
function ProgressBar({ progress, phaseIndex }: { progress: number; phaseIndex: number }) {
  const phase = BUILD_PHASES[phaseIndex];
  return (
    <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
      <motion.div
        className="h-full rounded-full relative"
        style={{
          backgroundImage: `linear-gradient(90deg, #7c5cfc, ${phase?.color || "#5b8def"}, #7c5cfc)`,
          backgroundSize: "200% 100%",
        }}
        initial={{ width: "0%" }}
        animate={{
          width: `${progress}%`,
          backgroundPosition: ["0% 0%", "100% 0%"],
        }}
        transition={{
          width: { duration: 0.8, ease: "easeOut" },
          backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
        }}
      />
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-8 h-4 rounded-full"
        style={{
          background: `radial-gradient(ellipse, ${phase?.color || "rgba(124,92,252,0.6)"} 0%, transparent 70%)`,
          left: `${progress}%`,
          marginLeft: -16,
          filter: "blur(4px)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function GeneratingOverlay({ isGenerating, onRevealComplete }: GeneratingOverlayProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [revealing, setRevealing] = useState(false);

  // Phase progression — each phase takes ~4.5s, 5 phases for ~22s total
  useEffect(() => {
    if (!isGenerating) return;
    setPhaseIndex(0);
    setProgress(5);

    const interval = setInterval(() => {
      setPhaseIndex((prev) => {
        if (prev >= BUILD_PHASES.length - 1) return prev; // Stay on last phase
        return prev + 1;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Progress — maps to phases
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Progress is tied to phases: each phase = ~18% progress
        const targetForPhase = Math.min(90, (phaseIndex + 1) * 18);
        const increment = Math.max(0.3, (targetForPhase - prev) * 0.06);
        return Math.min(90, prev + increment);
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isGenerating, phaseIndex]);

  // When generation completes → reveal
  useEffect(() => {
    if (!isGenerating && progress > 0 && !revealing) {
      setProgress(100);
      setPhaseIndex(BUILD_PHASES.length - 1);
      setRevealing(true);
      const timer = setTimeout(() => {
        setRevealing(false);
        setProgress(0);
        setPhaseIndex(0);
        onRevealComplete?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, progress, revealing, onRevealComplete]);

  // Deterministic particles
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      delay: i * 0.5,
      duration: 3 + ((i * 7 + 3) % 10) * 0.2,
      x: 25 + ((i * 13 + 5) % 25) * 2,
      y: 25 + ((i * 11 + 7) % 25) * 2,
      size: 4 + ((i * 5 + 2) % 8),
    })),
  []);

  const currentPhase = BUILD_PHASES[phaseIndex];
  const shouldShow = isGenerating || revealing;
  const PhaseIcon = currentPhase?.icon || Sparkles;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: revealing ? 0.8 : 0.4, ease: "easeOut" }}
          style={{
            background: revealing
              ? "transparent"
              : "linear-gradient(135deg, rgba(248,249,254,0.97) 0%, rgba(240,242,248,0.98) 50%, rgba(248,249,254,0.97) 100%)",
          }}
        >
          <GridBackground />

          {/* Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <Particle key={p.id} {...p} />
            ))}
          </div>

          {/* Center content */}
          <div className="relative flex flex-col items-center gap-6 z-10">
            {/* Blueprint visualization */}
            <BlueprintSkeleton phase={phaseIndex} />

            {/* Phase icon + text */}
            <div className="flex flex-col items-center gap-3 min-h-[72px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phaseIndex}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: currentPhase?.colorLight }}
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <PhaseIcon
                        className="w-4 h-4"
                        style={{ color: currentPhase?.color }}
                      />
                    </motion.div>
                    <span className="text-[15px] font-semibold text-foreground tracking-tight">
                      {currentPhase?.label}
                    </span>
                  </div>
                  <span className="text-[12px] text-muted-foreground">
                    {currentPhase?.sub}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Phase step indicator */}
            <PhaseSteps currentPhase={phaseIndex} />

            {/* Progress bar */}
            <ProgressBar progress={progress} phaseIndex={phaseIndex} />

            {/* Progress percentage */}
            <motion.span
              className="text-[11px] text-muted-foreground/60 tabular-nums"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>

          {/* Scanline */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.2), transparent)",
            }}
            animate={{ top: ["20%", "80%", "20%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
