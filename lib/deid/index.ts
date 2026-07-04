import { runRecognizers, type RawMatch } from './rules';

export type Identifier = RawMatch;
export type { IdentifierKind } from './rules';

const BLOCK = '███';

/**
 * Detect identifier candidates. Sorted by start; overlapping matches are
 * de-duplicated (keep the earliest, then the longest). Detection is an ASSIST
 * only — the user always previews and confirms the masked text before it is
 * sent to OpenAI or persisted.
 */
export function detect(text: string): Identifier[] {
  const matches = runRecognizers(text).sort(
    (a, b) => a.start - b.start || b.end - a.end,
  );
  const kept: Identifier[] = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      kept.push(m);
      lastEnd = m.end;
    }
  }
  return kept;
}

/** Shift an ISO/slash/dot date by `days`, preserving intervals. Returns null for
 * anything that isn't a valid calendar date (e.g. 2026-02-31, Korean-format) so
 * the caller masks it as a block instead of emitting a wrong shifted date. */
function shiftDate(value: string, days: number): string | null {
  const m = value.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    return null; // invalid calendar date (Date silently rolled over)
  }
  dt.setUTCDate(dt.getUTCDate() + days);
  const sep = value.includes('/') ? '/' : value.includes('.') ? '.' : '-';
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}${sep}${mm}${sep}${dd}`;
}

/**
 * Produce de-identified text: identifiers become ███; dates are shifted by a
 * single consistent offset so intervals between dates are preserved. Returns
 * the shift used (so it can be reused across a multi-document case).
 */
export function mask(
  text: string,
  identifiers: Identifier[],
  opts?: { shiftDays?: number },
): { masked: string; shiftDays: number } {
  const shiftDays = opts?.shiftDays ?? Math.floor(Math.random() * 21) - 10;
  // Replace right-to-left so earlier offsets stay valid while we edit.
  const sorted = [...identifiers].sort((a, b) => b.start - a.start);
  let masked = text;
  for (const id of sorted) {
    const replacement = id.kind === 'date' ? (shiftDate(id.text, shiftDays) ?? BLOCK) : BLOCK;
    masked = masked.slice(0, id.start) + replacement + masked.slice(id.end);
  }
  return { masked, shiftDays };
}
