import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');
const SP = process.env.SP;

const IM = ['소화기', '순환기', '호흡기', '내분비대사', '신장', '혈액종양', '감염', '알레르기', '류마티스'];
const OTHERS = ['신경과', '정신건강의학과', '소아청소년과', '피부과', '가정의학과', '재활의학과', '결핵과'];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif;background:#f7f8fa;padding:30px;width:680px;color:#16181d;--c:#2563eb;--bg:#eff4ff}
.title{font-size:16px;font-weight:800;margin-bottom:14px}
.sec{background:#fff;border:1px solid #e5e7eb;border-radius:14px}
.head{display:flex;align-items:center;gap:10px;padding:13px 16px}
.bar{width:5px;height:20px;border-radius:3px;background:var(--c)}
.nm{font-weight:800;font-size:15px}
.cn{background:var(--bg);color:var(--c);font-weight:800;font-size:12px;border-radius:999px;padding:2px 10px}
.chev{margin-left:auto;color:#9aa4b2;font-size:13px;transform:rotate(180deg)}
.body{display:flex;flex-wrap:wrap;gap:8px;padding:2px 16px 16px}
.chip{display:inline-flex;align-items:center;gap:4px;border:1.5px solid var(--c);color:#16181d;background:#fff;border-radius:999px;padding:7px 14px;font-size:13.5px;font-weight:600;cursor:pointer;position:relative}
.chip:hover{background:var(--bg)}
.chip .more{font-size:10px;color:var(--c);opacity:.7}
/* 내과 hover flyout */
.imchip .flyout{display:none;position:absolute;top:calc(100% + 8px);left:0;z-index:20;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 12px 30px -8px rgba(15,23,42,.22);padding:12px;width:520px}
.imchip:hover .flyout{display:flex;flex-wrap:wrap;gap:6px}
.flyout::before{content:'';position:absolute;top:-6px;left:22px;width:11px;height:11px;background:#fff;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;transform:rotate(45deg)}
.flyhdr{width:100%;font-size:11px;font-weight:700;color:#64748b;margin-bottom:2px}
.sub{border:1px solid #cbd5e1;background:#fff;color:#334155;font-size:12px;font-weight:600;border-radius:999px;padding:5px 11px;cursor:pointer}
.sub:hover{border-color:var(--c);background:var(--bg);color:var(--c)}
.sub.gen{border-color:var(--c);color:var(--c)}
</style></head><body>
<div class="title" id="t">내과 = 평소 닫힘(대칭) · 호버 시에만 세부</div>
<div class="sec"><div class="head"><span class="bar"></span><span class="nm">내과·진료계열</span><span class="cn">8</span><span class="chev">▾</span></div>
<div class="body">
  <span class="chip imchip" id="im">내과 <span class="more">▾9</span>
    <div class="flyout"><span class="flyhdr">내과 세부 — 클릭해 선택</span><span class="sub gen">내과 일반</span>${IM.map((n) => `<span class="sub">${n}내과</span>`).join('')}</div>
  </span>
  ${OTHERS.map((n) => `<span class="chip">${n}</span>`).join('')}
</div></div>
</body></html>`;

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 680, height: 260 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: 'networkidle' });
// 1) closed (symmetric)
await p.locator('#t').evaluate((e) => (e.textContent = '① 닫힘 — 내과가 다른 칩과 동일(대칭). 우측 ▾9만 힌트'));
await p.locator('body').screenshot({ path: `${SP}/hover-closed.png` });
// 2) hover 내과 → flyout
await p.locator('#t').evaluate((e) => (e.textContent = '② 내과 호버 — 세부 9개 flyout (평소엔 숨김)'));
await p.locator('#im').hover();
await p.waitForTimeout(250);
await p.locator('body').screenshot({ path: `${SP}/hover-open.png` });
await b.close();
console.log('rendered closed + hover');
