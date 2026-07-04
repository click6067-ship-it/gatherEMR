import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');
const SP = process.env.SP;

const G = [
  { id: 'internal', label: '내과·진료계열', c: '#2563eb', bg: '#eff4ff', specs: ['신경과', '정신건강의학과', '소아청소년과', '피부과', '가정의학과', '재활의학과', '결핵과'], im: ['소화기', '순환기', '호흡기', '내분비대사', '신장', '혈액종양', '감염', '알레르기', '류마티스'] },
  { id: 'surgical', label: '외과·수술계열', c: '#dc2626', bg: '#fef2f2', specs: ['외과', '정형외과', '신경외과', '흉부외과', '성형외과', '산부인과', '안과', '이비인후과', '비뇨의학과'] },
  { id: 'diagnostic', label: '진단·지원계열', c: '#7c3aed', bg: '#f5f3ff', specs: ['영상의학과', '방사선종양학과', '병리과', '진단검사의학과', '핵의학과', '마취통증의학과'] },
  { id: 'emergency', label: '응급·사회의학계열', c: '#059669', bg: '#ecfdf5', specs: ['응급의학과', '예방의학과', '직업환경의학과'] },
];
const cnt = (g) => g.specs.length + (g.im ? 1 : 0);

const sectionHtml = (g) => {
  const im = g.im
    ? `<div class="imrow"><button class="chip main" data-im="1" style="background:${g.c};border-color:${g.c}">내과 <span class="cvr">▾</span></button><div class="subs">${g.im.map((n) => `<span class="chip sub">${n}</span>`).join('')}</div></div>`
    : '';
  return `<div class="sec" data-c="${g.c}" style="--c:${g.c};--bg:${g.bg}">
    <button class="head"><span class="bar"></span><span class="nm">${g.label}</span><span class="cn">${cnt(g)}</span><span class="chev">▾</span></button>
    <div class="body">${im}${g.specs.map((n) => `<span class="chip">${n}</span>`).join('')}</div>
  </div>`;
};

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif;background:#f7f8fa;padding:32px;width:680px;color:#16181d}
.title{font-size:18px;font-weight:800;margin-bottom:2px}
.subtitle{font-size:12.5px;color:#6b7280;margin-bottom:18px}
.tree{display:flex;flex-direction:column;gap:10px}
.sec{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
.head{width:100%;display:flex;align-items:center;gap:10px;padding:14px 16px;background:none;border:none;cursor:pointer;font:inherit}
.bar{width:5px;height:20px;border-radius:3px;background:var(--c)}
.nm{font-weight:800;font-size:15px}
.cn{background:var(--bg);color:var(--c);font-weight:800;font-size:12px;border-radius:999px;padding:2px 10px}
.chev{margin-left:auto;color:#9aa4b2;transition:transform .2s;font-size:13px}
.sec.open .chev{transform:rotate(180deg)}
.body{display:none;flex-wrap:wrap;gap:8px;padding:0 16px 16px}
.sec.open .body{display:flex}
.chip{display:inline-flex;align-items:center;border:1.5px solid var(--c);color:#16181d;background:#fff;border-radius:999px;padding:7px 14px;font-size:13.5px;font-weight:600;cursor:pointer}
.chip:hover{background:var(--bg)}
.chip.main{color:#fff}
.imrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px;width:100%;background:var(--bg);border-radius:12px;padding:8px 10px;margin-bottom:2px}
.cvr{font-size:10px;opacity:.85}
.subs{display:none;flex-wrap:wrap;gap:6px}
.imrow.open .subs{display:flex}
.chip.sub{border:1px solid #cbd5e1;background:#fff;color:#334155;font-size:12px;font-weight:600;padding:5px 11px}
</style></head><body>
<div class="title">분과 선택 — 26개 전문과목</div>
<div class="subtitle">계열을 누르면 펼쳐집니다 · 내과는 9세부까지</div>
<div class="tree">${G.map(sectionHtml).join('')}</div>
<script>
document.querySelectorAll('.head').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
document.querySelectorAll('[data-im]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();b.parentElement.classList.toggle('open')}));
</script>
</body></html>`;

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 680, height: 300 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: 'networkidle' });

// State 1: collapsed
await p.locator('body').screenshot({ path: `${SP}/tree-collapsed.png` });
// State 2: 내과·진료 열고 내과 세부까지 펼침
await p.locator('.sec').first().locator('.head').click();
await p.locator('[data-im]').first().click();
await p.waitForTimeout(250);
await p.locator('body').screenshot({ path: `${SP}/tree-expanded.png` });
await b.close();
console.log('rendered collapsed + expanded');
