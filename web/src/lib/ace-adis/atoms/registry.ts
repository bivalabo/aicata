// ============================================================
// ACE Layer 1: Atom Registry
// 全Atomの集約・検索・カテゴリ別取得
// ============================================================

import type { DesignAtom, AtomCategory } from "../types";
import { typographyAtoms } from "./typography";
import { mediaAtoms } from "./media";
import { interactiveAtoms } from "./interactive";
import { layoutAtoms } from "./layout";
import { decorativeAtoms } from "./decorative";

// 全Atomを結合
const ALL_ATOMS: DesignAtom[] = [
  ...typographyAtoms,
  ...mediaAtoms,
  ...interactiveAtoms,
  ...layoutAtoms,
  ...decorativeAtoms,
];

// ID → Atom マップ（高速検索用）
const ATOM_MAP = new Map<string, DesignAtom>(
  ALL_ATOMS.map((a) => [a.id, a])
);

// ============================================================
// Public API
// ============================================================

/** 全Atomを取得 */
export function getAllAtoms(): DesignAtom[] {
  return ALL_ATOMS;
}

/** IDでAtomを取得 */
export function getAtomById(id: string): DesignAtom | undefined {
  return ATOM_MAP.get(id);
}

/** カテゴリ別にAtomを取得 */
export function getAtomsByCategory(category: AtomCategory): DesignAtom[] {
  return ALL_ATOMS.filter((a) => a.category === category);
}

/** Atomの総数 */
export function getAtomCount(): number {
  return ALL_ATOMS.length;
}

/** カテゴリ別のAtom数 */
export function getAtomCountByCategory(): Record<AtomCategory, number> {
  const counts: Record<string, number> = {
    typography: 0,
    media: 0,
    interactive: 0,
    layout: 0,
    decorative: 0,
  };
  for (const atom of ALL_ATOMS) {
    counts[atom.category]++;
  }
  return counts as Record<AtomCategory, number>;
}

/** テキスト検索 */
export function searchAtoms(query: string): DesignAtom[] {
  const q = query.toLowerCase();
  return ALL_ATOMS.filter(
    (a) =>
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q))
  );
}

/** 特定トークンを使用するAtomを取得 */
export function getAtomsByToken(token: string): DesignAtom[] {
  return ALL_ATOMS.filter((a) => a.tokens.includes(token));
}
