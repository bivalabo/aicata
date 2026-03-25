// ============================================================
// API 入力バリデーション — zod スキーマ
// ============================================================

import { z } from "zod";

// ── Chat Stream API ──

const ContentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("image"),
    source: z.object({
      type: z.literal("base64"),
      media_type: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
      data: z.string(),
    }),
  }),
]);

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.union([z.string(), z.array(ContentBlockSchema)]),
});

export const ChatStreamInputSchema = z.object({
  messages: z.array(MessageSchema).min(1, "メッセージが必要です"),
  conversationId: z.string().nullish().transform((v) => v ?? undefined),
  pageType: z.string().nullish().transform((v) => v ?? undefined),
  urlAnalysis: z.any().optional(),
});

export type ChatStreamInput = z.infer<typeof ChatStreamInputSchema>;

// ── Pages API ──

export const CreatePageSchema = z.object({
  title: z.string().min(1).max(500),
  html: z.string().optional(),
  css: z.string().optional(),
  conversationId: z.string().optional().nullable(),
  slug: z.string().optional(),
  pageType: z.string().optional(),
  templateId: z.string().optional(),
});

export const UpdatePageSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  html: z.string().optional(),
  css: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// ── Brand Memory API ──

export const BrandMemorySchema = z.object({
  brandName: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  tones: z.array(z.string().max(50)).max(10).optional(),
  targetAudience: z.string().max(500).optional(),
  colors: z.record(z.string().max(50), z.string().max(50)).optional(),
  fonts: z.array(z.string().max(200)).max(20).optional(),
  logoUrl: z.string().url().max(2000).optional().or(z.literal("")),
  referenceUrls: z.array(z.string().url().max(2000)).max(10).optional(),
});

// ── Media Upload API ──

export const MediaUploadSchema = z.object({
  url: z.string().url().max(2000),
  alt: z.string().max(500).optional(),
});

// ── Shared: parse and return result or error response ──

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: Response } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  return {
    success: false,
    response: Response.json(
      { error: "入力が不正です", details: messages },
      { status: 400 },
    ),
  };
}
