import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');
const SP = process.env.SP;

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 760, height: 620 }, deviceScaleFactor: 2 });
await p.goto(process.env.BASE ?? 'http://localhost:4400/app', { waitUntil: 'load' });
// hover 내과·진료계열 → opens smoothly
await p.getByText('내과·진료계열').hover();
await p.waitForTimeout(450);
// click 내과 chip (.chip.im, not the header) → 세부 inline
await p.locator('.chip.im').click();
await p.waitForTimeout(350);
await p.screenshot({ path: `${SP}/picker.png` });
await b.close();
console.log('picker shot');
