import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');
const SP = process.env.SP;
const BASE = process.env.BASE ?? 'http://localhost:4400';

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1120, height: 820 }, deviceScaleFactor: 2 });

// 1) pick screen — hover 내과·진료 + open 내과 세부
await p.goto(BASE, { waitUntil: 'networkidle' });
await p.getByText('내과·진료계열').hover();
await p.waitForTimeout(500);
await p.locator('.chip.im').click();
await p.waitForTimeout(400);
await p.screenshot({ path: `${SP}/design-pick.png` });

// pick 순환기내과 → input
await p.getByRole('button', { name: '순환기내과' }).click();
await p.waitForTimeout(400);
await p.getByRole('button', { name: '샘플 채우기' }).click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${SP}/design-input.png` });

// consent → preview → summarize → result
await p.locator('.consent input').check();
await p.getByRole('button', { name: /비식별 확인/ }).click();
await p.waitForSelector('.preview-box', { timeout: 15000 });
await p.getByRole('button', { name: /요약/ }).click();
await p.waitForSelector('.split', { timeout: 45000 });
await p.waitForTimeout(600);
// click first summary item to show split-view highlight
await p.locator('.item').first().click();
await p.waitForTimeout(500);
await p.screenshot({ path: `${SP}/design-result.png` });

await b.close();
console.log('design shots: pick, input, result');
