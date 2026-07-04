import { z } from 'zod';

export const LabelEnum = z.enum(['explicit', 'derived', 'uncertain']);
export type Label = z.infer<typeof LabelEnum>;

/** One summary sentence. `citations` are chunk ids; `label` marks whether it is
 * a direct quote (`explicit`), an inference across spans (`derived`), or
 * `uncertain`. Enforcement drops any item that ends up with no valid citation. */
export const SummaryItemSchema = z.object({
  text: z.string().min(1),
  quote: z.string().nullable(), // verbatim source snippet for exact-span; null if none. (OpenAI strict output requires all keys present)
  citations: z.array(z.string()),
  label: LabelEnum,
});
export type SummaryItem = z.infer<typeof SummaryItemSchema>;

export const DDxSchema = z.object({
  working: z.array(SummaryItemSchema),
  cannotMiss: z.array(SummaryItemSchema),
  ruledOut: z.array(SummaryItemSchema),
});

/** Emergency-Medicine summary. Block order is urgency-first (I-PASS aligned) and
 * IS the product thesis — do not reorder. Every block is an array so citation
 * enforcement can filter uniformly. */
export const SummarySchema = z.object({
  acuity: z.array(SummaryItemSchema),
  oneLiner: z.array(SummaryItemSchema),
  riskModifiers: z.array(SummaryItemSchema),
  immediateThreats: z.array(SummaryItemSchema),
  pending: z.array(SummaryItemSchema),
  hpi: z.array(SummaryItemSchema),
  vitals: z.array(SummaryItemSchema),
  keyLabs: z.array(SummaryItemSchema),
  ddx: DDxSchema,
  txResponse: z.array(SummaryItemSchema),
  disposition: z.array(SummaryItemSchema),
  gaps: z.array(SummaryItemSchema),
});
export type Summary = z.infer<typeof SummarySchema>;

export const BLOCK_ORDER = [
  'acuity', 'oneLiner', 'riskModifiers', 'immediateThreats', 'pending',
  'hpi', 'vitals', 'keyLabs', 'ddx', 'txResponse', 'disposition', 'gaps',
] as const;
