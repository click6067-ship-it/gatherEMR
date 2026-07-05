// Multi-format text extraction. Plain text is decoded locally; PDFs try Upstage
// Document Parse first (structured + OCR, Korean-native) and fall back to a local
// text-layer extraction (unpdf/pdf.js) when Upstage is unavailable or empty; other
// formats (image, HWP/HWPX, DOCX, PPTX, XLSX) need Upstage's OCR.
// The raw bytes are processed in memory and never stored.
import { extractText as unpdfExtractText, getDocumentProxy } from 'unpdf';

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

/** pdf.js throws a PasswordException for encrypted PDFs — detect it to give clear guidance. */
function isPasswordError(e: unknown): boolean {
  const name = ((e as { name?: string })?.name ?? '').toLowerCase();
  const msg = ((e as Error)?.message ?? '').toLowerCase();
  return name.includes('password') || msg.includes('password') || msg.includes('encrypted');
}

/** Local PDF text-layer extraction (no external service). Empty for scanned/image-only PDFs. */
async function localPdfText(bytes: Uint8Array): Promise<string> {
  // getDocumentProxy loads the PDF (throws PasswordException if encrypted)
  const pdf = await getDocumentProxy(bytes);
  const { text } = await unpdfExtractText(pdf, { mergePages: true });
  return (text ?? '').trim();
}

/** Upstage Document Parse — OCR + structured parse. Returns '' if it finds nothing; throws on transport/auth errors. */
async function upstageParse(bytes: Uint8Array, filename: string, contentType: string): Promise<string> {
  const key = process.env.UPSTAGE_API_KEY;
  if (!key) throw new Error('UPSTAGE_API_KEY missing');

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
    throw new Error(`upstage ${r.status}: ${msg.slice(0, 140)}`);
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

/** Extract plain text from an uploaded document. Throws a user-facing (Korean) error when nothing can be read. */
export async function extractText(bytes: Uint8Array, filename: string, contentType: string): Promise<string> {
  const ext = (filename.split('.').pop() ?? '').toLowerCase();

  if (isTextLike(ext, contentType)) {
    return new TextDecoder('utf-8').decode(bytes).trim();
  }

  const isPdf = ext === 'pdf' || contentType === 'application/pdf';

  if (isPdf) {
    // Primary: Upstage (best structured/OCR). Fall back to the local text layer
    // when Upstage errors, has no key, or returns nothing.
    try {
      const t = await upstageParse(bytes, filename, contentType);
      if (t) return t;
    } catch {
      /* fall through to local extraction */
    }
    try {
      const t = await localPdfText(bytes);
      if (t) return t;
    } catch (e) {
      if (isPasswordError(e)) {
        throw new Error('암호가 걸린 PDF는 열 수 없어요. 암호를 풀고 다시 올리거나, 텍스트를 붙여넣어 주세요.');
      }
      /* unreadable PDF — fall through to the generic message */
    }
    throw new Error('PDF에서 텍스트를 추출하지 못했어요. 스캔 화질이 낮거나 이미지로만 된 PDF, 또는 암호가 걸린 파일일 수 있어요 — 텍스트를 직접 붙여넣어 주세요.');
  }

  // Other formats (image / HWP / HWPX / DOCX / PPTX / XLSX) — OCR only, no local fallback.
  try {
    const t = await upstageParse(bytes, filename, contentType);
    if (t) return t;
  } catch {
    if (!process.env.UPSTAGE_API_KEY) {
      throw new Error('이미지·HWP·DOCX 등은 문서 파싱이 필요한데 지금 설정되어 있지 않아요. 텍스트를 직접 붙여넣어 주세요.');
    }
    throw new Error('문서에서 텍스트를 추출하지 못했어요. 잠시 후 다시 시도하거나, 텍스트를 직접 붙여넣어 주세요.');
  }
  throw new Error('이 파일에서 텍스트를 추출하지 못했어요. 텍스트를 직접 붙여넣어 주세요.');
}
