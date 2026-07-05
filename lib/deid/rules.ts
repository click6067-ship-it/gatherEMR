export type IdentifierKind = 'rrn' | 'phone' | 'email' | 'date' | 'mrn' | 'name' | 'address' | 'insured';

export type RawMatch = {
  kind: IdentifierKind;
  start: number;
  end: number;
  text: string;
};

type Recognizer = { kind: IdentifierKind; pattern: RegExp; group?: number };

// `d` flag exposes per-group match indices so labelled recognizers (mrn, name)
// can mask only the VALUE, not the "MRN:"/"Name:" label.
const recognizers: Recognizer[] = [
  { kind: 'rrn', pattern: /\b\d{6}-\d{7}\b/gd },
  { kind: 'rrn', pattern: /\b\d{13}\b/gd }, // unhyphenated 주민등록번호
  { kind: 'phone', pattern: /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/gd }, // hyphen OR space separated
  { kind: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gd },
  { kind: 'date', pattern: /\b\d{4}[-./]\d{1,2}[-./]\d{1,2}\b/gd }, // ISO / slash / dot
  { kind: 'date', pattern: /\d{4}\s?년\s?\d{1,2}\s?월\s?\d{1,2}\s?일/gd }, // Korean
  { kind: 'mrn', pattern: /(?:MRN|등록번호|환자번호|차트번호|병록번호|진료번호)[:\s]*(\d{4,})/gid, group: 1 },
  // Labelled name: first token + up to 2 further Capitalized/Korean tokens
  // (English full names) — stops at a lowercase word like "admitted".
  // First token = Korean name (single word) or English word; further tokens only
  // for English full names (John Smith) — Korean follow-tokens would grab the next
  // field label (e.g. "홍길동 등록번호").
  { kind: 'name', pattern: /(?:이름|환자명|성명|Name)[:\s]*([A-Za-z가-힣]+(?:\s+[A-Z][a-z]+){0,2})/gid, group: 1 },
  // 피보험자(insured person): 이름 값 + 피보험자/보험 번호
  { kind: 'insured', pattern: /(?:피보험자|보험가입자|가입자)(?:명|성명)?[:\s]+([A-Za-z가-힣]+(?:\s+[A-Z][a-z]+){0,2})/gid, group: 1 },
  { kind: 'insured', pattern: /(?:피보험자번호|보험번호|증권번호|증번호|가입자번호)[:\s]*([0-9][0-9-]{3,})/gid, group: 1 },
  // 주소(address): "주소:" 라벨 뒤 값(줄 끝까지) + 라벨 없는 한국 주소(시/도→시·군·구→동·로·길+번지)
  { kind: 'address', pattern: /(?:주소|주소지|현주소|거주지)[:\s]*([^\n]{2,80}?)(?=\s{2}|\n|$)/gd, group: 1 },
  { kind: 'address', pattern: /[가-힣]{2,}(?:시|도)(?:\s?[가-힣]{2,}(?:시|군|구))+(?:\s?[가-힣0-9]{1,}(?:읍|면|동|리|로|길|가))+\s?\d{1,4}(?:-\d{1,4})?(?:번지)?/gd },
];

export function runRecognizers(text: string): RawMatch[] {
  const out: RawMatch[] = [];
  for (const r of recognizers) {
    r.pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = r.pattern.exec(text)) !== null) {
      if (m[0] === '') {
        r.pattern.lastIndex++;
        continue;
      }
      const indices = (m as RegExpExecArray & { indices?: Array<[number, number]> }).indices;
      if (r.group && indices && indices[r.group]) {
        const [start, end] = indices[r.group];
        out.push({ kind: r.kind, start, end, text: m[r.group] });
      } else {
        out.push({ kind: r.kind, start: m.index, end: m.index + m[0].length, text: m[0] });
      }
    }
  }
  return out;
}
