import { describe, it, expect } from 'vitest';
import { detect, mask } from './index';

describe('de-id detect', () => {
  it('detects structured identifiers with correct spans', () => {
    const t = 'RRN 900101-1234567 / 010-1234-5678 / a@b.com / 2026-06-18 / MRN: 00123456';
    const kinds = detect(t).map((i) => i.kind);
    expect(kinds).toEqual(expect.arrayContaining(['rrn', 'phone', 'email', 'date', 'mrn']));
    const rrn = detect(t).find((i) => i.kind === 'rrn')!;
    expect(t.slice(rrn.start, rrn.end)).toBe('900101-1234567');
    const mrn = detect(t).find((i) => i.kind === 'mrn')!;
    expect(mrn.text).toBe('00123456'); // value only, not the "MRN:" label
  });

  it('does not false-positive rrn/phone on a plain clinical line', () => {
    const kinds = detect('Vitals: BP 168/94, HR 104, RR 22, SpO2 91% room air').map((i) => i.kind);
    expect(kinds).not.toContain('rrn');
    expect(kinds).not.toContain('phone');
  });
});

describe('de-id mask', () => {
  it('blocks identifiers and preserves date intervals under a consistent shift', () => {
    const t = 'Name: 홍길동 admitted 2026-06-18, discharged 2026-06-21';
    const { masked } = mask(t, detect(t), { shiftDays: 5 });
    expect(masked).not.toContain('홍길동');
    expect(masked).toContain('███');
    const dates = masked.match(/\d{4}-\d{2}-\d{2}/g)!;
    expect(dates[0]).toBe('2026-06-23'); // 18 + 5
    const days = (Date.parse(dates[1]) - Date.parse(dates[0])) / 86_400_000;
    expect(days).toBe(3); // interval preserved
  });
});

describe('de-id — codex-review regressions', () => {
  it('detects full English name, slash date, spaced phone, unhyphenated RRN', () => {
    const t = 'Name: John Smith DOB: 1970/01/02 Tel: 010 1234 5678 RRN: 9001011234567';
    const ids = detect(t);
    expect(ids.find((i) => i.kind === 'name')?.text).toContain('John Smith');
    expect(ids.some((i) => i.kind === 'date' && i.text === '1970/01/02')).toBe(true);
    expect(ids.some((i) => i.kind === 'phone' && i.text === '010 1234 5678')).toBe(true);
    expect(ids.some((i) => i.kind === 'rrn' && i.text === '9001011234567')).toBe(true);
    const { masked } = mask(t, ids, { shiftDays: 0 });
    expect(masked).not.toContain('Smith');
    expect(masked).not.toContain('9001011234567');
  });

  it('detects Korean EMR identifier labels (환자명·등록번호)', () => {
    const t = '환자명: 홍길동  등록번호: 00123456  67세';
    const ids = detect(t);
    expect(ids.find((i) => i.kind === 'name')?.text).toBe('홍길동');
    expect(ids.some((i) => i.kind === 'mrn' && i.text === '00123456')).toBe(true);
    const { masked } = mask(t, ids, { shiftDays: 0 });
    expect(masked).not.toContain('홍길동');
    expect(masked).not.toContain('00123456');
  });

  it('masks an invalid calendar date as a block instead of shifting to a wrong date', () => {
    const t = 'admit 2026-02-31';
    const { masked } = mask(t, detect(t), { shiftDays: 0 });
    expect(masked).toContain('███');
    expect(masked).not.toContain('2026-02-31');
    expect(masked).not.toContain('2026-03-03'); // Date() would have rolled over to this
  });
});
