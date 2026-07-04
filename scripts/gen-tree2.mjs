import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');

const G = [
  { label: '내과·진료계열', c: '#2563eb', bg: '#eff4ff', specs: ['신경과', '정신건강의학과', '소아청소년과', '피부과', '가정의학과', '재활의학과', '결핵과'], im: ['소화기', '순환기', '호흡기', '내분비대사', '신장', '혈액종양', '감염', '알레르기', '류마티스'] },
  { label: '외과·수술계열', c: '#dc2626', bg: '#fef2f2', specs: ['외과', '정형외과', '신경외과', '흉부외과', '성형외과', '산부인과', '안과', '이비인후과', '비뇨의학과'] },
  { label: '진단·지원계열', c: '#7c3aed', bg: '#f5f3ff', specs: ['영상의학과', '방사선종양학과', '병리과', '진단검사의학과', '핵의학과', '마취통증의학과'] },
  { label: '응급·사회의학계열', c: '#059669', bg: '#ecfdf5', specs: ['응급의학과', '예방의학과', '직업환경의학과'] },
];
const count = (g) => g.specs.length + (g.im ? 1 : 0);

const chip = (n, c, bg) => `<span class="chip" style="border-color:${c};background:${bg}">${n}</span>`;
const sub = (n) => `<span class="sub">${n}</span>`;

// ─── Option A: 계열 보드 (내과 full-width + 3열) ───
const panelHead = (g) => `<div class="phead" style="background:${g.c}">${g.label}<span>${count(g)}</span></div>`;
const internalPanel = () => {
  const g = G[0];
  return `<div class="panel"><div class="phead" style="background:${g.c}">${g.label}<span>${count(g)}</span></div><div class="pbody">
    <div class="imwrap" style="border-color:${g.c}"><span class="chip main" style="background:${g.c}">내과</span><span class="imarrow">▸ 9세부</span><span class="subs">${g.im.map(sub).join('')}</span></div>
    ${g.specs.map((n) => chip(n, g.c, g.bg)).join('')}
  </div></div>`;
};
const plainPanel = (g) => `<div class="panel">${panelHead(g)}<div class="pbody">${g.specs.map((n) => chip(n, g.c, g.bg)).join('')}</div></div>`;
const boardHtml = `<div class="board">${internalPanel()}<div class="row3">${G.slice(1).map(plainPanel).join('')}</div></div>`;

// ─── Option B: 컴팩트 가로 트리 (root → 계열 → 칩 클러스터) ───
const branch = (g) => {
  const imNode = g.im ? `<span class="chip main" style="background:${g.c};border-color:${g.c}">내과<span class="imc"> · 9세부 ${g.im.map(sub).join('')}</span></span>` : '';
  return `<div class="branch"><div class="gnode" style="border-color:${g.c};background:${g.c}">${g.label}<b>${count(g)}</b></div><div class="cluster">${imNode}${g.specs.map((n) => chip(n, g.c, g.bg)).join('')}</div></div>`;
};
const treeHtml = `<div class="ctree"><div class="rootnode">26개<br>전문과목</div><div class="branches">${G.map(branch).join('')}</div></div>`;

const CSS = `
*{box-sizing:border-box;margin:0}
body{font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif;background:#fff;padding:34px;width:1080px;color:#16181d}
.title{font-size:20px;font-weight:800;margin-bottom:2px}
.subtitle{font-size:12.5px;color:#6b7280;margin-bottom:22px}
.chip{display:inline-flex;align-items:center;border:1.5px solid #94a3b8;border-radius:999px;padding:6px 13px;font-size:13.5px;font-weight:600;white-space:nowrap}
.chip.main{color:#fff}
.sub{display:inline-flex;border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:3px 9px;font-size:11.5px;font-weight:600;color:#334155;margin-left:5px}
/* Option A */
.board{display:flex;flex-direction:column;gap:14px}
.panel{border:1.5px solid #e5e7eb;border-radius:14px;overflow:hidden}
.phead{color:#fff;font-weight:800;font-size:15px;padding:9px 16px;display:flex;justify-content:space-between;align-items:center}
.phead span{background:rgba(255,255,255,.25);border-radius:999px;padding:1px 10px;font-size:12px}
.pbody{padding:14px 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;align-items:start}
.imwrap{display:inline-flex;align-items:center;flex-wrap:wrap;gap:2px;border:1.5px dashed;border-radius:12px;padding:6px 10px;background:#f8fafc}
.imarrow{font-size:11px;color:#64748b;font-weight:700;margin:0 4px}
/* Option B */
.ctree{display:flex;align-items:center}
.rootnode{background:#16181d;color:#fff;font-weight:800;font-size:15px;border-radius:12px;padding:12px 16px;text-align:center;line-height:1.25}
.branches{display:flex;flex-direction:column;gap:14px;margin-left:30px;position:relative}
.branches::before{content:'';position:absolute;left:-16px;top:18px;bottom:18px;width:2px;background:#cbd5e1}
.branches::after{content:'';position:absolute;left:-30px;top:50%;width:14px;height:2px;background:#cbd5e1}
.branch{display:flex;align-items:center;gap:14px;position:relative}
.branch::before{content:'';position:absolute;left:-16px;top:50%;width:16px;height:2px;background:#cbd5e1}
.gnode{color:#fff;font-weight:800;font-size:14px;border-radius:10px;padding:9px 13px;white-space:nowrap;display:flex;align-items:center;gap:7px;min-width:150px}
.gnode b{background:rgba(255,255,255,.25);border-radius:999px;padding:1px 8px;font-size:12px}
.cluster{display:flex;flex-wrap:wrap;gap:7px;max-width:660px;align-items:center}
.imc{font-size:11px;font-weight:600;opacity:.95}
`;

const page = (title, sub, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="title">${title}</div><div class="subtitle">${sub}</div>${body}</body></html>`;

const b = await chromium.launch({ headless: true });
for (const [name, title, subt, body] of [
  ['A', 'A안 — 계열 보드 (칩 랩)', '계열별 카드 · 내과 9세부는 점선 그룹으로 인라인', boardHtml],
  ['B', 'B안 — 컴팩트 가로 트리', 'root → 계열 → 칩 클러스터 (트리 계보 유지, 높이 1/3)', treeHtml],
]) {
  const p = await b.newPage({ viewport: { width: 1080, height: 400 }, deviceScaleFactor: 2 });
  await p.setContent(page(title, subt, body), { waitUntil: 'networkidle' });
  await p.locator('body').screenshot({ path: `${process.env.SP}/tree-${name}.png` });
  await p.close();
  console.log('rendered', name);
}
await b.close();
