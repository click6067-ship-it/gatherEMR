// Multi-format text extraction. Plain text is decoded locally; every other
// format (PDF, image, HWP/HWPX, DOCX, PPTX, XLSX) goes through Upstage Document
// Parse — Korean-native, strong on Hangul/Hanja and low-quality scans.
// The raw bytes are processed in memory and never stored; for non-text formats
// they transit Upstage (OCR needs the original) before de-identification.

const UPSTAGE_ENDPOINT = 'https://api.upstage.ai/v1/document-digitization';

export const ACCEPTED_EXT = [
  'txt', 'md', 'text',
  'pdf', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif', 'heic',
  'hwp', 'hwpx', 'docx', 'pptx', 'xlsx',
];

function isTextLike(ext: string, contentType: string): boolean {
  return ext === 'txt' || ext === 'md' || ext === 'text' || contentType.startsWith('text/');
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[ \t]+\n/g, '\n').trim();
}

/** Extract plain text from an uploaded document. Returns '' if nothing found. */
export async function extractText(bytes: Uint8Array, filename: string, contentType: string): Promise<string> {
  const ext = (filename.split('.').pop() ?? '').toLowerCase();

  if (isTextLike(ext, contentType)) {
    return new TextDecoder('utf-8').decode(bytes).trim();
  }

  const key = process.env.UPSTAGE_API_KEY;
  if (!key) throw new Error('문서 파싱이 설정되지 않았습니다 (UPSTAGE_API_KEY 없음).');

  const form = new FormData();
  form.append('document', new Blob([bytes as BlobPart], { type: contentType || 'application/octet-stream' }), filename || 'upload');
  form.append('model', 'document-parse');

  const r = await fetch(UPSTAGE_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    throw new Error(`문서 파싱 실패 (${r.status}). ${msg.slice(0, 140)}`);
  }
  const j: unknown = await r.json();
  const c = (j as { content?: { text?: string; markdown?: string; html?: string }; elements?: Array<{ content?: { text?: string; markdown?: string }; text?: string }> }) ?? {};
  const fromElements = () =>
    Array.isArray(c.elements)
      ? c.elements.map((e) => e?.content?.text ?? e?.content?.markdown ?? e?.text ?? '').join('\n')
      : '';
  const raw = c.content?.text || c.content?.markdown || (c.content?.html ? stripHtml(c.content.html) : '') || fromElements();
  return String(raw ?? '').trim();
}
