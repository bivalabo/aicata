"use client";

import { useState, useEffect, useCallback } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

interface ViewportState {
  /** Current device type based on viewport width */
  device: DeviceType;
  /** Viewport width in pixels */
  width: number;
  /** Viewport height in pixels */
  height: number;
  /** true if width < 768px */
  isMobile: boolean;
  /** true if 768px <= width < 1024px */
  isTablet: boolean;
  /** true if width >= 1024px */
  isDesktop: boolean;
  /** true if width < 1024px (mobile or tablet) */
  isMobileOrTablet: boolean;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

function getDevice(width: number): DeviceType {
  if (width < BREAKPOINTS.mobile) return "mobile";
  if (width < BREAKPOINTS.tablet) return "tablet";
  return "desktop";
}

function getState(width: number, height: number): ViewportState {
  const device = getDevice(width);
  return {
    device,
    width,
    height,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
    isMobileOrTablet: device !== "desktop",
  };
}

/**
 * ビューポートサイズを監視し、デバイス種別を返すフック
 * SSR安全: 初期値はdesktopとして返し、マウント後に実際の値に更新
 */
export function useViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(() =>
    typeof window !== "undefined"
      ? getState(window.innerWidth, window.innerHeight)
      : getState(1280, 800) // SSR fallback
  );

  const handleResize = useCallback(() => {
    setState(getState(window.innerWidth, window.innerHeight));
  }, []);

  useEffect(() => {
    // 初期値を確実に設定
    handleResize();

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return state;
}
