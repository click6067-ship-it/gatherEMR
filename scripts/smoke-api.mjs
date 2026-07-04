const BASE = process.env.BASE ?? 'http://localhost:3001';
const raw = `[Triage 2026-06-18 18:42]
Name: 홍길동  MRN: 00123456  Age/Sex: 67/M
CC: chest discomfort, SOB
Vitals: BP 168/94, HR 104, RR 22, SpO2 91% room air
Pain 7/10, sweating (+), left shoulder radiation (+)
[Nursing 18:51] "가슴이 꽉 막힌 느낌" onset about 1hr ago. O2 2L NC -> SpO2 95%. Home meds: "warfarin? 당뇨약" patient unsure.
[ED note 19:08] Pain now 3/10 after rest. Warfarin - not taking? (old AF?) Allergy: not documented.
[EKG 19:10] Sinus tach 102. Nonspecific ST-T. No STEMI criteria. QTc 458.
[Labs] Troponin-I 0.8 (19:22) -> 2.1 (20:46). Cr 1.8, eGFR 38, K 5.1, INR 1.7.
Repeat Troponin ordered 21:10 - pending at sign-out.`;

const post = async (path, body) =>
  (await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })).json();

const p = await post('/api/deid-preview', { text: raw });
console.log('[deid-preview] identifiers:', p.identifiers.length, '| chunks:', p.chunks.length);
console.log('[deid-preview] masked head:', p.masked.slice(0, 90).replace(/\n/g, ' '));
if (p.masked.includes('홍길동')) console.log('!! NAME LEAKED'); else console.log('name masked: OK');

const s = await post('/api/summarize', { maskedText: p.masked });
if (s.error) { console.log('[summarize] ERROR:', s.error); process.exit(1); }
console.log('[summarize] acuity:', s.summary.acuity.length, '| immediateThreats:', s.summary.immediateThreats.length,
  '| ddx.working:', s.summary.ddx.working.length, '| ddx.cannotMiss:', s.summary.ddx.cannotMiss.length, '| lint:', s.lint.length);
const a = s.summary.acuity[0];
console.log('[summarize] acuity[0]:', a.label, '|', a.text.slice(0, 80));
console.log('[summarize] acuity[0] span slices to:', JSON.stringify(p.masked.slice(a.span.start, a.span.end)));
