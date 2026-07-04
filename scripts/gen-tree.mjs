import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');

const OUT = process.env.OUT ?? '/mnt/c/Users/click/Desktop/temp_1768367208152100.png';

const GROUPS = [
  { label: '내과·진료계열', color: '#2563eb', bg: '#eff4ff', specs: [
    { name: '내과', subs: ['소화기', '순환기', '호흡기', '내분비대사', '신장', '혈액종양', '감염', '알레르기', '류마티스'] },
    { name: '신경과' }, { name: '정신건강의학과' }, { name: '소아청소년과' }, { name: '피부과' }, { name: '가정의학과' }, { name: '재활의학과' }, { name: '결핵과' },
  ] },
  { label: '외과·수술계열', color: '#dc2626', bg: '#fef2f2', specs: [
    { name: '외과' }, { name: '정형외과' }, { name: '신경외과' }, { name: '흉부외과' }, { name: '성형외과' }, { name: '산부인과' }, { name: '안과' }, { name: '이비인후과' }, { name: '비뇨의학과' },
  ] },
  { label: '진단·지원계열', color: '#7c3aed', bg: '#f5f3ff', specs: [
    { name: '영상의학과' }, { name: '방사선종양학과' }, { name: '병리과' }, { name: '진단검사의학과' }, { name: '핵의학과' }, { name: '마취통증의학과' },
  ] },
  { label: '응급·사회의학계열', color: '#059669', bg: '#ecfdf5', specs: [
    { name: '응급의학과' }, { name: '예방의학과' }, { name: '직업환경의학과' },
  ] },
];

const specHtml = (s, color, bg) => {
  const sub = s.subs
    ? `<div class="children subs">${s.subs.map((n) => `<div class="child"><div class="node sub">${n}</div></div>`).join('')}</div>`
    : '';
  const flag = s.subs ? ' has-sub' : '';
  return `<div class="child"><div class="grow"><div class="node spec${flag}" style="border-color:${color};background:${bg}">${s.name}${s.subs ? ` <span class="cnt">${s.subs.length}세부</span>` : ''}</div>${sub}</div></div>`;
};

const groupHtml = (g) =>
  `<div class="child"><div class="grow"><div class="node group" style="border-color:${g.color};background:${g.color};color:#fff">${g.label} <span class="gcnt">${g.specs.length}</span></div><div class="children specs" style="--spine:${g.color}55">${g.specs.map((s) => specHtml(s, g.color, g.bg)).join('')}</div></div></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
* { box-sizing: border-box; margin: 0; }
body { font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background: #fff; padding: 40px; width: max-content; }
.title { font-size: 22px; font-weight: 800; color: #16181d; margin-bottom: 6px; }
.subtitle { font-size: 13px; color: #6b7280; margin-bottom: 26px; }
.row { display: flex; align-items: center; }
.grow { display: flex; align-items: center; }
.node { border: 2px solid #94a3b8; border-radius: 10px; padding: 8px 14px; background: #fff; font-weight: 700; white-space: nowrap; font-size: 15px; color: #16181d; }
.node.root { border-color: #16181d; background: #16181d; color: #fff; font-size: 16px; }
.node.spec { font-size: 14px; }
.node.sub { font-size: 12.5px; font-weight: 600; padding: 5px 10px; border-radius: 999px; border-color: #cbd5e1; background: #f8fafc; color: #334155; }
.cnt, .gcnt { font-size: 11px; font-weight: 700; opacity: .8; margin-left: 3px; }
.gcnt { background: rgba(255,255,255,.25); border-radius: 999px; padding: 1px 7px; }
.children { display: flex; flex-direction: column; gap: 9px; margin-left: 34px; position: relative; justify-content: center; }
.children::before { content: ''; position: absolute; left: -18px; top: 14px; bottom: 14px; width: 2px; background: var(--spine, #cbd5e1); }
.children::after { content: ''; position: absolute; left: -34px; top: 50%; width: 16px; height: 2px; background: #cbd5e1; }
.child { position: relative; }
.child::before { content: ''; position: absolute; left: -18px; top: 50%; width: 18px; height: 2px; background: var(--spine, #cbd5e1); }
.subs { margin-left: 26px; gap: 5px; }
.subs::before { left: -14px; }
.subs::after { display: none; }
.subs .child::before { left: -14px; width: 14px; }
</style></head><body>
<div class="title">gatherEMR — 분과 트리 (26개 전문과목 + 내과 9세부)</div>
<div class="subtitle">4계열 · 드롭다운으로 선택하면 그 분과 렌즈로 요약</div>
<div class="row">
  <div class="node root">26개<br>전문과목</div>
  <div class="children groups">${GROUPS.map(groupHtml).join('')}</div>
</div>
</body></html>`;

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.locator('body').screenshot({ path: OUT });
await b.close();
console.log('TREE_SAVED', OUT);
