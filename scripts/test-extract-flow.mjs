import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');

const BASE = process.env.BASE ?? 'http://localhost:4400';

// 1. render EMR screenshot PNG
const html = `<div id="c" style="font:16px 'DejaVu Sans Mono',monospace;padding:28px;white-space:pre-wrap;width:720px;color:#111;background:#fff">[Triage 2026-06-18 18:42]
환자명: 홍길동   등록번호: 00123456   67세 / 남
CC: chest discomfort, SOB. Pain 7/10, sweating (+), left shoulder radiation (+)
Vitals: BP 168/94, HR 104, SpO2 91% room air
Troponin-I 0.8 (19:22) -> 2.1 (20:46). Cr 1.8, K 5.1, INR 1.7</div>`;
const b = await chromium.launch({ headless: true });
const p = await b.newPage();
await p.setContent(html);
const png = await p.locator('#c').screenshot();
await b.close();

// 2. /api/extract (multipart)
const fd = new FormData();
fd.append('file', new Blob([png], { type: 'image/png' }), 'emr-screenshot.png');
const ex = await (await fetch(BASE + '/api/extract', { method: 'POST', body: fd })).json();
if (ex.error) { console.log('EXTRACT ERR:', ex.error); process.exit(1); }
console.log('[extract] chars:', ex.text.length, '| 홍길동?', ex.text.includes('홍길동'), '| troponin?', /troponin/i.test(ex.text));

// 3. /api/deid-preview
const dp = await (await fetch(BASE + '/api/deid-preview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: ex.text }) })).json();
console.log('[deid] ids:', dp.identifiers.length, '| name masked?', !dp.masked.includes('홍길동'));

// 4. /api/summarize (순환기내과)
const s = await (await fetch(BASE + '/api/summarize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ maskedText: dp.masked, specialtyId: 'internal-medicine', subId: 'cardio' }) })).json();
if (s.error) { console.log('SUMMARIZE ERR:', s.error); process.exit(1); }
console.log('[summarize 순환기내과] blocks:', s.summary.blocks.map((x) => x.title).join(' | '));
console.log('FULL FLOW OK: 이미지 → OCR → 비식별 → 분과 요약');
