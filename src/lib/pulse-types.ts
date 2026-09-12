import { z } from "zod";

export const goneDarkItemSchema = z.object({
  person: z.string().nullable().optional(),
  item: z.string(),
  reason: z.string().nullable().optional(),
  confidence: z.number().nullable().optional(),
});

export const inMotionItemSchema = z.object({
  person: z.string().nullable().optional(),
  item: z.string(),
  context: z.string().nullable().optional(),
  confidence: z.number().nullable().optional(),
});

export const confirmedItemSchema = z.object({
  person: z.string().nullable().optional(),
  item: z.string(),
  context: z.string().nullable().optional(),
  confidence: z.number().nullable().optional(),
});

export const analysisSchema = z.object({
  goneDark: z.array(goneDarkItemSchema).default([]),
  inMotion: z.array(inMotionItemSchema).default([]),
  confirmed: z.array(confirmedItemSchema).default([]),
});

export type GoneDarkItem = z.infer<typeof goneDarkItemSchema>;
export type InMotionItem = z.infer<typeof inMotionItemSchema>;
export type ConfirmedItem = z.infer<typeof confirmedItemSchema>;
export type PulseAnalysis = z.infer<typeof analysisSchema>;

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export const MAX_CONVERSATION_LENGTH = 30000;
