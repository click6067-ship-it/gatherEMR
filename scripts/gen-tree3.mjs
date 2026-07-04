import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');
const SP = process.env.SP;

const C = '#2563eb', BG = '#eff4ff';
const IM_FULL = ['소화기내과', '순환기내과', '호흡기내과', '내분비대사내과', '신장내과', '혈액종양내과', '감염내과', '알레르기내과', '류마티스내과'];
const IM_SHORT = ['소화기', '순환기', '호흡기', '내분비대사', '신장', '혈액종양', '감염', '알레르기', '류마티스'];
const OTHERS = ['신경과', '정신건강의학과', '소아청소년과', '피부과', '가정의학과', '재활의학과', '결핵과'];

const chip = (n, cls = '') => `<span class="chip ${cls}">${n}</span>`;

// A안: 평탄화 — 내과(일반) + 9 풀네임 세부 + 7 others, 전부 동일 칩
const bodyA = `<div class="body open">
  ${chip('내과 (일반)')}
  ${IM_FULL.map((n) => chip(n)).join('')}
  ${OTHERS.map((n) => chip(n)).join('')}
</div>`;

// B안: 내과 ▾ 서브줄 — 내과만 확장, 나머지 플랫
const bodyB = `<div class="body open">
  <div class="imrow open"><span class="chip main">내과 <span class="cvr">▾</span></span><span class="subs">${IM_SHORT.map((n) => chip(n, 'sub')).join('')}</span></div>
  ${OTHERS.map((n) => chip(n)).join('')}
</div>`;

const CSS = `
*{box-sizing:border-box;margin:0}
body{font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif;background:#f7f8fa;padding:30px;width:680px;color:#16181d;--c:${C};--bg:${BG}}
.title{font-size:16px;font-weight:800;margin-bottom:14px}
.sec{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
.head{display:flex;align-items:center;gap:10px;padding:13px 16px}
.bar{width:5px;height:20px;border-radius:3px;background:var(--c)}
.nm{font-weight:800;font-size:15px}
.cn{background:var(--bg);color:var(--c);font-weight:800;font-size:12px;border-radius:999px;padding:2px 10px}
.chev{margin-left:auto;color:#9aa4b2;font-size:13px;transform:rotate(180deg)}
.body{display:flex;flex-wrap:wrap;gap:8px;padding:2px 16px 16px}
.chip{display:inline-flex;align-items:center;border:1.5px solid var(--c);color:#16181d;background:#fff;border-radius:999px;padding:7px 14px;font-size:13.5px;font-weight:600}
.chip.main{color:#fff;background:var(--c)}
.imrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px;width:100%;background:var(--bg);border-radius:12px;padding:8px 10px}
.cvr{font-size:10px;margin-left:2px}
.subs{display:flex;flex-wrap:wrap;gap:6px}
.chip.sub{border:1px solid #cbd5e1;background:#fff;color:#334155;font-size:12px;padding:5px 11px}
`;
const wrap = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="title">${title}</div><div class="sec"><div class="head"><span class="bar"></span><span class="nm">내과·진료계열</span><span class="cn">${title.includes('A') ? 17 : 8}</span><span class="chev">▾</span></div>${body}</div></body></html>`;

const b = await chromium.launch({ headless: true });
for (const [name, title, body] of [['A', 'A안 — 평탄화 (전부 플랫 칩 · 완전 대칭)', bodyA], ['B', 'B안 — 내과 ▾ 서브줄 (일관된 depth)', bodyB]]) {
  const p = await b.newPage({ viewport: { width: 680, height: 300 }, deviceScaleFactor: 2 });
  await p.setContent(wrap(title, body), { waitUntil: 'networkidle' });
  await p.locator('body').screenshot({ path: `${SP}/opt-${name}.png` });
  await p.close();
}
await b.close();
console.log('rendered A + B');
