"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface GeneratingOverlayProps {
  isGenerating: boolean;
  /** When generation finishes, play reveal animation then call this */
  onRevealComplete?: () => void;
}

// Phase messages that rotate during generation
const PHASE_MESSAGES = [
  { text: "デザインを構築中", sub: "レイアウトを設計しています" },
  { text: "コンテンツを配置中", sub: "セクションを組み立てています" },
  { text: "スタイルを適用中", sub: "カラー・フォントを調整しています" },
  { text: "最終調整中", sub: "細部を仕上げています" },
];

// Floating particle component
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

// Orbital ring component
function OrbitalRing({ radius, duration, reverse, color, thickness }: {
  radius: number; duration: number; reverse?: boolean; color: string; thickness: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -radius,
        marginTop: -radius,
        borderColor: "transparent",
        borderTopColor: color,
        borderRightColor: reverse ? color : "transparent",
        borderWidth: thickness,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Grid lines that pulse
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-accent" />
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

// Progress bar with glow
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
      <motion.div
        className="h-full rounded-full relative"
        style={{
          background: "linear-gradient(90deg, #7c5cfc, #5b8def, #7c5cfc)",
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
      {/* Glow effect */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-8 h-4 rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(124,92,252,0.6) 0%, transparent 70%)",
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

export default function GeneratingOverlay({ isGenerating, onRevealComplete }: GeneratingOverlayProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [revealing, setRevealing] = useState(false);

  // Cycle through phases
  useEffect(() => {
    if (!isGenerating) return;
    setPhaseIndex(0);
    setProgress(5);
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASE_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Simulate progress (AI generation doesn't give real progress, so we estimate)
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // cap at 90 until done
        // Slow down as we approach 90
        const increment = Math.max(0.5, (90 - prev) * 0.04);
        return Math.min(90, prev + increment);
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // When generation completes, quickly fill to 100 then reveal
  useEffect(() => {
    if (!isGenerating && progress > 0 && !revealing) {
      setProgress(100);
      setRevealing(true);
      const timer = setTimeout(() => {
        setRevealing(false);
        setProgress(0);
        onRevealComplete?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, progress, revealing, onRevealComplete]);

  // Generate particles with deterministic values (avoid Math.random for SSR hydration)
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: i * 0.4,
      duration: 3 + ((i * 7 + 3) % 10) * 0.2,       // deterministic pseudo-random
      x: 30 + ((i * 13 + 5) % 20) * 2,               // 30–68 range
      y: 30 + ((i * 11 + 7) % 20) * 2,               // 30–68 range
      size: 4 + ((i * 5 + 2) % 8),                    // 4–11 range
    })),
  []);

  const currentPhase = PHASE_MESSAGES[phaseIndex];
  const shouldShow = isGenerating || revealing;

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

          {/* Center animation group */}
          <div className="relative flex flex-col items-center gap-8 z-10">
            {/* Orbital animation */}
            <div className="relative w-32 h-32">
              <OrbitalRing radius={64} duration={8} color="rgba(124,92,252,0.2)" thickness={1} />
              <OrbitalRing radius={52} duration={6} reverse color="rgba(91,141,239,0.25)" thickness={1.5} />
              <OrbitalRing radius={40} duration={4} color="rgba(124,92,252,0.3)" thickness={1} />

              {/* Orbiting dot */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-accent shadow-lg shadow-accent/50"
                style={{ left: "50%", top: "50%", marginLeft: -4, marginTop: -4 }}
                animate={{
                  x: [0, 48, 0, -48, 0],
                  y: [-48, 0, 48, 0, -48],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #7c5cfc, #5b8def)",
                    boxShadow: "0 8px 32px rgba(124,92,252,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 8px 32px rgba(124,92,252,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
                      "0 12px 48px rgba(124,92,252,0.45), 0 0 0 1px rgba(255,255,255,0.2) inset",
                      "0 8px 32px rgba(124,92,252,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Phase text */}
            <div className="flex flex-col items-center gap-3 min-h-[60px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phaseIndex}
                  className="flex flex-col items-center gap-1.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-[15px] font-semibold text-foreground tracking-tight">
                    {currentPhase.text}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {currentPhase.sub}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <ProgressBar progress={progress} />

            {/* Progress percentage */}
            <motion.span
              className="text-[11px] text-muted-foreground/60 tabular-nums"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>

          {/* Bottom scanline effect */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.3), transparent)",
            }}
            animate={{ top: ["20%", "80%", "20%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
