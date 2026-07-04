export type Span = { start: number; end: number };

/**
 * Resolve the exact character span of `quote` inside `source`.
 * 1) exact substring match, else
 * 2) whitespace-normalized match (collapse runs of whitespace) mapped back to
 *    original offsets.
 * Returns null when the quote is empty or cannot be located — the caller MUST
 * drop any summary sentence whose citation span is null (no span → not shown).
 */
export function resolveSpan(source: string, quote: string): Span | null {
  if (!quote) return null;

  const exact = source.indexOf(quote);
  if (exact >= 0) return { start: exact, end: exact + quote.length };

  // Whitespace-normalized fallback.
  const map: number[] = []; // normalized index -> original index
  let norm = '';
  let prevSpace = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      if (prevSpace) continue;
      norm += ' ';
      map.push(i);
      prevSpace = true;
    } else {
      norm += ch;
      map.push(i);
      prevSpace = false;
    }
  }

  const normQuote = quote.replace(/\s+/g, ' ').trim();
  if (!normQuote) return null;
  const ni = norm.indexOf(normQuote);
  if (ni < 0) return null;

  const start = map[ni];
  const lastOriginal = map[ni + normQuote.length - 1];
  return { start, end: lastOriginal + 1 };
}
