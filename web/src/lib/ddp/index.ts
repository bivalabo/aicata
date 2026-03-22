// ============================================================
// Aicata DDP — Design Decomposition Pipeline
// Public API
// ============================================================

export { runDDP, runDDPForChat } from "./pipeline";
export type {
  DDPInput,
  DDPConfig,
  DDPProgressEvent,
  AssembledPageResult,
} from "./pipeline";

export type {
  DesignSpec,
  SectionSpec,
  ContentBrief,
  ColorSpec,
  TypographySpec,
  RenderedSection,
  ValidationResult,
} from "./types";
