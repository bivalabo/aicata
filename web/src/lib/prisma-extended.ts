// ============================================================
// Prisma Extended Client — ACE/ADIS モデルの型安全アクセス
//
// prisma generate がネットワーク制限で実行不可のため、
// 新モデルへの型安全なアクセスレイヤーを手動で定義。
// prisma generate 実行後は prisma を直接使用し、このファイルは不要になる。
// ============================================================

import { prisma } from "./db";

// ============================================================
// Model Types (Prisma Schema と一致)
// ============================================================

export interface DbDesignAtom {
  id: string;
  atomId: string;
  category: string;
  tag: string;
  name: string;
  description: string | null;
  html: string;
  css: string;
  variants: string | null;
  tokens: string | null;
  a11y: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbBlockPattern {
  id: string;
  blockId: string;
  category: string;
  name: string;
  description: string | null;
  layout: string | null;
  slots: string;
  css: string;
  responsive: string | null;
  animations: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbDesignPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  cssSnippet: string | null;
  prevalence: number;
  momentum: number;
  firstSeen: Date;
  lastSeen: Date;
  curatorScore: number | null;
  curatorNotes: string | null;
  atomIds: string | null;
  blockIds: string | null;
  industries: string | null;
  tones: string | null;
  exampleUrls: string | null;
  exampleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSiteEvaluation {
  id: string;
  url: string;
  screenshotPath: string | null;
  overallRating: number;
  typographyScore: number | null;
  colorScore: number | null;
  layoutScore: number | null;
  animationScore: number | null;
  spacingScore: number | null;
  tags: string;
  notes: string | null;
  analyzedColors: string | null;
  analyzedFonts: string | null;
  analyzedLayout: string | null;
  detectedPatterns: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbDesignDNASnapshot {
  id: string;
  minimalism: number;
  whitespace: number;
  contrast: number;
  animationIntensity: number;
  serifAffinity: number;
  colorSaturation: number;
  layoutComplexity: number;
  imageWeight: number;
  asymmetry: number;
  novelty: number;
  confidence: number;
  totalRatings: number;
  favoritePatterns: string | null;
  avoidPatterns: string | null;
  createdAt: Date;
}

export interface DbTrendReport {
  id: string;
  period: string;
  emergingPatterns: string;
  decliningPatterns: string;
  colorTrends: string | null;
  typographyTrends: string | null;
  layoutTrends: string | null;
  createdAt: Date;
}

// ============================================================
// Extended Prisma Client
// prisma の型を拡張して新モデルへのアクセサを提供
// ============================================================

type PrismaDelegate = {
  findMany: (args?: any) => Promise<any[]>;
  findFirst: (args?: any) => Promise<any | null>;
  findUnique: (args?: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
};

interface ExtendedPrisma {
  designAtom: PrismaDelegate;
  blockPattern: PrismaDelegate;
  designPattern: PrismaDelegate;
  siteEvaluation: PrismaDelegate;
  designDNASnapshot: PrismaDelegate;
  trendReport: PrismaDelegate;
}

/**
 * ACE/ADIS テーブルへのアクセサを提供する拡張Prismaクライアント
 *
 * 使い方:
 * ```ts
 * import { db } from "@/lib/prisma-extended";
 * const patterns = await db.designPattern.findMany();
 * const dna = await db.designDNASnapshot.findFirst({ orderBy: { createdAt: "desc" } });
 * ```
 */
export const db: ExtendedPrisma = {
  designAtom: (prisma as any).designAtom,
  blockPattern: (prisma as any).blockPattern,
  designPattern: (prisma as any).designPattern,
  siteEvaluation: (prisma as any).siteEvaluation,
  designDNASnapshot: (prisma as any).designDNASnapshot,
  trendReport: (prisma as any).trendReport,
};

// 既存の prisma も re-export
export { prisma };

// ============================================================
// Safe JSON parser helper
// ============================================================

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
