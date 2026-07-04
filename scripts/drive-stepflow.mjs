import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');

const BASE = process.env.BASE ?? 'http://localhost:4400';
const OUT = process.env.OUT ?? '/tmp/stepflow.png';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(BASE, { waitUntil: 'load' });

// Step 1 계열 → 응급·사회의학
await page.getByRole('button', { name: /응급·사회의학계열/ }).click();
// Step 2 분과 → 응급의학과
await page.getByRole('button', { name: '응급의학과', exact: true }).click();
// Step 3 입력: 샘플 채우기 → 동의 → 비식별 확인
await page.getByRole('button', { name: '샘플 채우기' }).click();
await page.locator('input[type=checkbox]').check();
await page.getByRole('button', { name: /비식별 확인/ }).click();
// Step 4 확인 → 요약
await page.getByText('전송 전 비식별 확인').waitFor({ timeout: 15000 });
await page.getByRole('button', { name: /요약 →/ }).click();
// Step 5 결과
await page.getByText('비식별 원문').waitFor({ timeout: 90000 });
// 문장 클릭 → span 하이라이트
await page.locator('.item').first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: OUT, fullPage: false });
await browser.close();
console.log('STEPFLOW_OK', OUT);
