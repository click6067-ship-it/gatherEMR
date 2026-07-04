import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { detect, mask } from '../deid';
import { chunkText } from '../chunking';
import { resolveTemplate } from '../specialties';
import { summarize, type ResolvedSummary } from './summarize';

const CHART = `[Triage 2026-06-18 18:42]
Name: 홍길동  MRN: 00123456  Age/Sex: 67/M
CC: chest discomfort, SOB
Vitals: BP 168/94, HR 104, RR 22, SpO2 91% room air
Pain 7/10, sweating (+), left shoulder radiation (+)
[Nursing 18:51] "가슴이 꽉 막힌 느낌" onset about 1hr ago. O2 2L NC -> SpO2 95%. Home meds: "warfarin? 당뇨약" patient unsure.
[ED note 19:08] Pain now 3/10 after rest. Warfarin - not taking? (old AF?) Allergy: not documented.
[EKG 19:10] Sinus tach 102. Nonspecific ST-T. No STEMI criteria. QTc 458.
[Labs] Troponin-I 0.8 (19:22) -> 2.1 (20:46). Cr 1.8, eGFR 38, K 5.1, INR 1.7.
Repeat Troponin ordered 21:10 - pending at sign-out.`;

const CASES = [
  { specialtyId: 'emergency' as const, subId: undefined },
  { specialtyId: 'internal-medicine' as const, subId: 'cardio' },
  { specialtyId: 'anesthesiology' as const, subId: undefined },
];

function titles(s: ResolvedSummary): string[] {
  return s.blocks.map((b) => b.title);
}

describe.skipIf(!process.env.OPENAI_API_KEY)('specialty differentiation (same chart, 3 specialties)', () => {
  it('produces DIFFERENT block titles/content per specialty lens', async () => {
    const { masked } = mask(CHART, detect(CHART), { shiftDays: 3 });
    const chunks = chunkText(masked);

    const results = [];
    for (const c of CASES) {
      const t = resolveTemplate(c.specialtyId, c.subId)!;
      const { summary } = await summarize(masked, chunks, t, { model: process.env.OPENAI_MODEL });
      results.push({ name: t.name, summary });
    }

    // structural: block-title sets must differ between the three specialties
    const keys = results.map((r) => titles(r.summary).join('|'));
    expect(new Set(keys).size).toBe(3);

    // every surviving item resolved to a real span
    for (const r of results) {
      const all = [...r.summary.oneLiner, ...r.summary.cannotMiss, ...r.summary.blocks.flatMap((b) => b.items)];
      for (const it of all) expect(masked.slice(it.span.start, it.span.end).length).toBeGreaterThan(0);
    }

    // write a human-readable diff for the verification record
    mkdirSync('docs/verify', { recursive: true });
    const md = ['# 분과 차별화 스모크 — 같은 흉통 차트, 3분과 (라이브 GPT-5.x)\n'];
    for (const r of results) {
      md.push(`## ${r.name}`);
      md.push(`- **한 줄:** ${r.summary.oneLiner.map((i) => i.text).join(' / ') || '—'}`);
      md.push(`- **⚠️ cannot-miss:** ${r.summary.cannotMiss.map((i) => i.text).join(' / ') || '—'}`);
      md.push('- **블록:**');
      for (const b of r.summary.blocks) md.push(`  - **${b.title}:** ${b.items.map((i) => i.text).join(' / ')}`);
      md.push('');
    }
    writeFileSync('docs/verify/specialty-diff.md', md.join('\n'));
  }, 180_000);
});
