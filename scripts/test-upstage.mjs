import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');
import { writeFileSync } from 'node:fs';

// 1. render a fake EMR screen (Korean+English) to PNG — simulates a screenshot upload
const html = `<div id="c" style="font:16px 'DejaVu Sans Mono',monospace;padding:28px;white-space:pre-wrap;width:720px;color:#111;background:#fff">[Triage 2026-06-18 18:42]
환자명: 홍길동   등록번호: 00123456   67세 / 남
주호소(CC): chest discomfort, SOB
Vitals: BP 168/94, HR 104, RR 22, SpO2 91% room air
Pain 7/10, sweating (+), left shoulder radiation (+)
[Labs] Troponin-I 0.8 (19:22) -> 2.1 (20:46). Cr 1.8, K 5.1, INR 1.7</div>`;
const b = await chromium.launch({ headless: true });
const p = await b.newPage();
await p.setContent(html);
const png = await p.locator('#c').screenshot();
writeFileSync('/tmp/emr-test.png', png);
await b.close();

// 2. call Upstage Document Parse
const key = process.env.UPSTAGE_API_KEY;
const form = new FormData();
form.append('document', new Blob([png], { type: 'image/png' }), 'emr.png');
form.append('model', 'document-parse');
// ocr=auto (default) — no force. Verify image still OCRs.
const r = await fetch('https://api.upstage.ai/v1/document-digitization', {
  method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form,
});
console.log('HTTP', r.status);
const j = await r.json();
console.log('top keys:', Object.keys(j));
console.log('content.text len:', j.content?.text?.length, 'markdown len:', j.content?.markdown?.length, 'html len:', j.content?.html?.length);
console.log('ocr field:', typeof j.ocr, j.ocr ? JSON.stringify(j.ocr).slice(0, 120) : '');
console.log('elements count:', j.elements?.length, 'first el:', JSON.stringify(j.elements?.[0])?.slice(0, 200));
console.log('content.html sample:', (j.content?.html || '').slice(0, 200));
const strip = (s) => (s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
const text = j.content?.text || j.content?.markdown || strip(j.content?.html) || (j.elements?.map((e) => strip(e?.content?.html) || e?.content?.text || e?.text || '').join('\n')) || '';
console.log('--- extracted text ---');
console.log(text.slice(0, 400));
console.log('--- korean name present? ---', text.includes('홍길동'), '| troponin?', /troponin/i.test(text));
