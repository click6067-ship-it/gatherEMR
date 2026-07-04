import type { Summary, SummaryItem } from './schema';

export type LintFinding = { rule: string; text: string };

const LAB_TOKENS =
  /\b(troponin|wbc|hb|hgb|cr|creatinine|lactate|bnp|nt-probnp|potassium|sodium|na|k|glucose|inr|platelet|plt|d-dimer|crp|ck-mb|hba1c|esr|ef|gfr|egfr|meld|das28)\b/i;
const VITALS = /\b(spo2|bp|hr|rr|temp|map|gcs|etco2|o2 sat)\b/i;
const TREND = /(→|↑|↓|상승|하강|증가|감소|추세|trend)/;
const TIME = /\b\d{1,2}:\d{2}\b/;
const PENDING = /(pending|ordered|대기|추적|f\/u|보류|미시행|예정|계획)/i;
// "AI 말투" tells — hedge/filler phrasing a terse clinical summary should not carry.
const AI_TONE = /(사료된다|사료됨|사료됩니다|생각됩니다|보여집니다|판단됩니다|종합적으로 볼 때|전반적으로 볼 때|면밀한 (관찰|경과관찰)이 (요구|필요)|추가적인 평가가 필요할 것으로)/;

function allItems(s: Summary): SummaryItem[] {
  return [
    ...s.oneLiner,
    ...s.cannotMiss,
    ...s.blocks.flatMap((b) => b.items),
    ...s.medChanges,
    ...s.gaps,
  ];
}

/**
 * Clinical anti-slop lint — structural checks: a lab mentioned with no number,
 * or a lab/vital trend with no timestamp. Exempts pending/ordered items and
 * pure symptom trends. Specialty-agnostic (iterates the generic shape).
 */
export function slopLint(summary: Summary): LintFinding[] {
  const findings: LintFinding[] = [];
  for (const it of allItems(summary)) {
    const t = it.text;
    if (PENDING.test(t)) continue;
    const clinical = LAB_TOKENS.test(t) || VITALS.test(t);
    if (LAB_TOKENS.test(t) && !/\d/.test(t)) {
      findings.push({ rule: 'lab-without-number', text: t });
    }
    if (clinical && TREND.test(t) && !TIME.test(t)) {
      findings.push({ rule: 'trend-without-time', text: t });
    }
    if (AI_TONE.test(t)) {
      findings.push({ rule: 'ai-tone', text: t });
    }
  }
  return findings;
}
