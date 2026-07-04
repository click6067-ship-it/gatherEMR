export type Chunk = {
  id: string;
  start: number;
  end: number;
  line: number;
  text: string;
};

/**
 * Split text into line-based chunks, preserving exact character offsets into
 * the source. Blank/whitespace-only lines are skipped, but their characters are
 * still consumed so `source.slice(chunk.start, chunk.end) === chunk.text` always
 * holds. Run this on the DE-IDENTIFIED text — de-identification happens before
 * chunking, so every downstream offset lives in de-identified space.
 */
export function chunkText(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;
  let line = 0;
  for (const raw of text.split('\n')) {
    line += 1;
    const end = start + raw.length;
    if (raw.trim().length > 0) {
      chunks.push({ id: `c${chunks.length + 1}`, start, end, line, text: raw });
    }
    start = end + 1; // +1 for the consumed '\n'
  }
  return chunks;
}
