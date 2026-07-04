import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');

const BASE = process.env.BASE ?? 'http://localhost:3001';
const OUT = process.env.OUT ?? '/tmp/result.png';
const SAMPLE = `[Triage 2026-06-18 18:42]
Name: 홍길동  MRN: 00123456  Age/Sex: 67/M
CC: chest discomfort, SOB
Vitals: BP 168/94, HR 104, RR 22, SpO2 91% room air
Pain 7/10, sweating (+), left shoulder radiation (+)
[Nursing 18:51] "가슴이 꽉 막힌 느낌" onset about 1hr ago. O2 2L NC -> SpO2 95%. Home meds: "warfarin? 당뇨약" patient unsure.
[ED note 19:08] Pain now 3/10 after rest. Warfarin - not taking? (old AF?) Allergy: not documented.
[EKG 19:10] Sinus tach 102. Nonspecific ST-T. No STEMI criteria. QTc 458.
[Labs] Troponin-I 0.8 (19:22) -> 2.1 (20:46). Cr 1.8, eGFR 38, K 5.1, INR 1.7.
Repeat Troponin ordered 21:10 - pending at sign-out.`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(BASE, { waitUntil: 'load' });
await page.fill('textarea', SAMPLE);
await page.getByRole('button', { name: /비식별 미리보기/ }).click();
await page.getByText('전송 전 비식별 확인').waitFor({ timeout: 15000 });
await page.getByRole('button', { name: /확인했습니다/ }).click();
await page.getByText('EMERGENCY MEDICINE SUMMARY').waitFor({ timeout: 90000 });
// click a Troponin summary item to trigger exact-span highlight + evidence popover
await page.getByRole('button').filter({ hasText: /Troponin/ }).first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: OUT, fullPage: false });
await browser.close();
console.log('SCREENSHOT_OK', OUT);
