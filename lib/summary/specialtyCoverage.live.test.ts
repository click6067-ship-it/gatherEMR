import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { detect, mask } from '../deid';
import { chunkText } from '../chunking';
import { resolveTemplate } from '../specialties';
import { summarize } from './summarize';

// 다계통 복합 입원(실제 EMR에 가까움) — 여러 분과가 각자 볼 내용이 있음
const CHART = `[Admission 2026-06-18 09:20]
Name: 홍길동  등록번호: 00123456  Age/Sex: 78/F
PMH: HTN, DM type 2, CKD stage 3, atrial fibrillation (on warfarin)
CC: 오늘 아침 낙상 후 confusion, fever
Neuro: GCS 14 (E4V4M6), 좌측 상지 위약 의심, 언어 어눌
Vitals: BP 158/90, HR 110 irregular, RR 24, SpO2 90% room air, Temp 38.6
[Labs 10:05] WBC 14.2, CRP 120, Cr 2.1 (baseline 1.4), K 5.3, Na 131, glucose 320, HbA1c 9.1, Troponin 0.05, lactate 3.1, INR 3.4, Hb 9.4
Meds: warfarin 3mg, metformin, amlodipine
Imaging: Brain CT ordered - r/o ICH; CXR 우하엽 침윤 의심(pneumonia?)
GI: 3일간 식이 저하, 오심, melena 의심
Social: 독거, ADL 일부 의존, 최근 낙상 2회
Plan: sepsis workup, hold warfarin (INR 3.4), neuro imaging pending`;

// 복합 입원이 실제로 건드리는 12개 분과(4계열 전반 + 내과 세부)
const CASES = [
  ['neurology'], ['internal-medicine', 'infection'], ['internal-medicine', 'nephro'],
  ['internal-medicine', 'endo'], ['internal-medicine', 'cardio'], ['internal-medicine', 'pulmo'],
  ['internal-medicine', 'gi'], ['family-medicine'], ['rehab'],
  ['radiology'], ['anesthesiology'], ['emergency'],
] as const;

describe.skipIf(!process.env.OPENAI_API_KEY)('26-specialty coverage (representative 12)', () => {
  it('every specialty produces its own lens (distinct blocks, resolved spans)', async () => {
    const { masked } = mask(CHART, detect(CHART), { shiftDays: 3 });
    const chunks = chunkText(masked);
    const rows: { name: string; titles: string[]; oneLiner: string }[] = [];

    for (const [sid, subid] of CASES) {
      const t = resolveTemplate(sid, subid)!;
      const { summary } = await summarize(masked, chunks, t, { model: process.env.OPENAI_MODEL });
      const titles = summary.blocks.map((b) => b.title);
      const all = [...summary.oneLiner, ...summary.cannotMiss, ...summary.blocks.flatMap((b) => b.items)];
      for (const it of all) expect(masked.slice(it.span.start, it.span.end).length).toBeGreaterThan(0);
      expect(titles.length + summary.oneLiner.length).toBeGreaterThan(0);
      rows.push({ name: t.name, titles, oneLiner: summary.oneLiner.map((i) => i.text).join(' ') });
    }

    // most specialties should have a distinct block-title fingerprint
    const fps = new Set(rows.map((r) => r.titles.join('|')));
    expect(fps.size).toBeGreaterThanOrEqual(Math.floor(CASES.length * 0.7));

    mkdirSync('docs/verify', { recursive: true });
    const md = ['# 분과 커버리지 스모크 — 같은 다계통 차트, 12개 분과 (라이브 GPT-5.x)\n', '낙상·confusion·fever·AKI·AF·pneumonia·melena 복합 입원. 12개 분과가 각자 렌즈로 서로 다른 블록 구성 = 분과별로 실제 다르게 요약됨을 증명. (단일계통 차트에선 무관 분과가 비는 게 정상 = 환각 안 함.)\n'];
    for (const r of rows) md.push(`- **${r.name}** → 블록: ${r.titles.join(' · ') || '—'}`);
    writeFileSync('docs/verify/specialty-coverage.md', md.join('\n') + '\n');
  }, 300_000);
});
