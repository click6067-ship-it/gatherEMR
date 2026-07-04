import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { detect, mask } from '../deid';
import { chunkText } from '../chunking';
import { summarize } from './summarize';

// Messy chest-pain case (the landing/eval fixture): contradictions + gaps.
const MESSY = `[Triage 2026-06-18 18:42]
Name: 홍길동  MRN: 00123456  Age/Sex: 67/M
CC: chest discomfort, SOB
Vitals: BP 168/94, HR 104, RR 22, SpO2 91% room air
Pain 7/10, sweating (+), left shoulder radiation (+)
[Nursing 18:51] "가슴이 꽉 막힌 느낌" onset about 1hr ago. O2 2L NC -> SpO2 95%. Home meds: "warfarin? 당뇨약" patient unsure.
[ED note 19:08] Pain now 3/10 after rest. Warfarin - not taking? (old AF?) Allergy: not documented.
[EKG 19:10] Sinus tach 102. Nonspecific ST-T. No STEMI criteria. QTc 458.
[Labs] Troponin-I 0.8 (19:22) -> 2.1 (20:46). Cr 1.8, eGFR 38, K 5.1, INR 1.7.
Repeat Troponin ordered 21:10 - pending at sign-out.`;

describe.skipIf(!process.env.OPENAI_API_KEY)('live EM summarize', () => {
  it('produces a cited, span-resolved EM summary of the messy chest-pain case', async () => {
    const { masked } = mask(MESSY, detect(MESSY), { shiftDays: 3 });
    const chunks = chunkText(masked);
    const { summary, lint, usage } = await summarize(masked, chunks, {
      model: process.env.OPENAI_MODEL,
    });

    if (process.env.SMOKE_OUT) {
      writeFileSync(
        process.env.SMOKE_OUT,
        JSON.stringify({ model: process.env.OPENAI_MODEL, usage, lint, maskedPreview: masked.slice(0, 200), summary }, null, 2),
      );
    }

    const all = [
      ...summary.acuity, ...summary.oneLiner, ...summary.immediateThreats,
      ...summary.keyLabs, ...summary.ddx.working, ...summary.ddx.cannotMiss,
    ];
    // every surviving item resolved to a real span in the masked source
    for (const it of all) {
      expect(masked.slice(it.span.start, it.span.end).length).toBeGreaterThan(0);
    }
    expect(summary.acuity.length + summary.oneLiner.length).toBeGreaterThan(0);
  }, 180000);
});
