import { z } from 'zod';

export const LabelEnum = z.enum(['explicit', 'derived', 'uncertain']);
export type Label = z.infer<typeof LabelEnum>;

/** One summary sentence. `quote` = verbatim source snippet (must live inside a
 * cited chunk) for exact-span highlight; null if none → item is dropped.
 * `label`: explicit(원문 직접) / derived(추론) / uncertain. */
export const SummaryItemSchema = z.object({
  text: z.string().min(1),
  quote: z.string().nullable(),
  citations: z.array(z.string()),
  label: LabelEnum,
});
export type SummaryItem = z.infer<typeof SummaryItemSchema>;

/** A specialty-specific block. `title` is chosen per the selected specialty's
 * template (dynamic content, fixed schema shape). */
export const SummaryBlockSchema = z.object({
  title: z.string(),
  items: z.array(SummaryItemSchema),
});
export type SummaryBlock = z.infer<typeof SummaryBlockSchema>;

/**
 * Specialty-AGNOSTIC summary. The universal spine (oneLiner → cannotMiss →
 * blocks → medChanges → gaps) is fixed across all 26 specialties; the specialty
 * lens lives in the ordered `blocks`. Derived from cross-specialty research
 * (docs/research/specialty-needs/INDEX.md): trend>snapshot, cannot-miss on top,
 * medication-change log is universal.
 */
export const SummarySchema = z.object({
  oneLiner: z.array(SummaryItemSchema), // 한 줄 문제표상
  cannotMiss: z.array(SummaryItemSchema), // 놓치면 안 될 것 (최상단 경고)
  blocks: z.array(SummaryBlockSchema), // 분과별 블록 (순서 = 분과 템플릿)
  medChanges: z.array(SummaryItemSchema), // 투약/치료 변경 로그 (공통)
  gaps: z.array(SummaryItemSchema), // 불확실·누락
});
export type Summary = z.infer<typeof SummarySchema>;
