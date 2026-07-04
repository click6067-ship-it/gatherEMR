import type { Summary, SummaryItem } from './schema';

export type LintFinding = { rule: string; text: string };

const LAB_TOKENS =
  /\b(troponin|wbc|hb|hgb|cr|creatinine|lactate|bnp|nt-probnp|potassium|sodium|na|k|glucose|inr|platelet|plt|d-dimer|crp|ck-mb)\b/i;
const VITALS = /\b(spo2|bp|hr|rr|temp|map|gcs|etco2|o2 sat)\b/i;
const TREND = /(→|↑|↓|상승|하강|증가|감소|추세|trend)/;
const TIME = /\b\d{1,2}:\d{2}\b/;
// pending / ordered / follow-up items legitimately lack a value or a time.
const PENDING = /(pending|ordered|대기|추적|f\/u|보류|미시행|예정|계획)/i;

function allItems(s: Summary): SummaryItem[] {
  return [
    ...s.acuity, ...s.oneLiner, ...s.riskModifiers, ...s.immediateThreats,
    ...s.pending, ...s.hpi, ...s.vitals, ...s.keyLabs,
    ...s.ddx.working, ...s.ddx.cannotMiss, ...s.ddx.ruledOut,
    ...s.txResponse, ...s.disposition, ...s.gaps,
  ];
}

/**
 * Clinical anti-slop lint — STRUCTURAL checks on the produced summary:
 *  - a lab mentioned with no number ("Troponin 상승"),
 *  - a lab/vital trend with no timestamp.
 * Exemptions (tuned against real output): pending/ordered items (no value yet),
 * and pure symptom trends (pain score) that carry no lab/vital token.
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
  }
  return findings;
}
