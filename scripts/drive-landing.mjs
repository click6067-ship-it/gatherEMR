import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');
const SP = process.env.SP;
const BASE = process.env.BASE ?? 'http://localhost:4400';

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
await p.goto(BASE, { waitUntil: 'networkidle' });

// hero: let the loop reach the distilled state (t≈4s)
await p.waitForTimeout(4200);
await p.screenshot({ path: `${SP}/ld-0-hero.png` });

const H = await p.evaluate(() => innerHeight);
const scrollTo = async (y) => { await p.evaluate((v) => scrollTo({ top: v }), y); await p.waitForTimeout(900); };

await scrollTo(H * 1.9);   // S1 mid-scene
await p.screenshot({ path: `${SP}/ld-1-frags.png` });
const s2 = await p.evaluate(() => document.querySelector('.ld-s2').offsetTop - innerHeight * 0.15);
await scrollTo(s2); await p.waitForTimeout(1600); // wire draw
await p.screenshot({ path: `${SP}/ld-2-demo.png` });
const s3 = await p.evaluate(() => document.querySelector('.ld-s3').offsetTop - innerHeight * 0.15);
await scrollTo(s3); await p.waitForTimeout(1200);
await p.screenshot({ path: `${SP}/ld-3-groups.png` });
const s4 = await p.evaluate(() => document.querySelector('.ld-s4').offsetTop - innerHeight * 0.15);
await scrollTo(s4); await p.waitForTimeout(1800); // mask flip
await p.screenshot({ path: `${SP}/ld-4-trust.png` });
await p.evaluate(() => scrollTo({ top: document.body.scrollHeight }));
await p.waitForTimeout(900);
await p.screenshot({ path: `${SP}/ld-5-cta.png` });

// console errors + overflow
const errs = [];
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
console.log('overflow:', overflow, '| consoleErrors:', errs.length);
await b.close();
console.log('LANDING_SHOTS_OK');
