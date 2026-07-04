import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');

/* Displacement map for capsule-lens refraction (Aave/PallavAg technique).
 * R = x-displacement, G = y-displacement, 128 = neutral. Edge-only dome bend:
 * center stays clear (text-safe), outer rim refracts inward. Consumed by
 * feDisplacementMap via backdrop-filter:url() — Chromium-only enhancement. */

const W = 512, H = 128, EDGE = 26; // edge bend zone px (map space)

const html = `<!doctype html><meta charset=utf-8><style>html,body{margin:0}</style>
<canvas id=c width=${W} height=${H}></canvas><script>
const c=document.getElementById('c'),x=c.getContext('2d');
const img=x.createImageData(${W},${H});
const r=${H}/2, cy=${H}/2;
function sdf(px,py){ // signed distance INSIDE capsule (>0 = inside)
  const cxL=r, cxR=${W}-r;
  if(px<cxL){ return r-Math.hypot(px-cxL,py-cy); }
  if(px>cxR){ return r-Math.hypot(px-cxR,py-cy); }
  return r-Math.abs(py-cy);
}
function normal(px,py){ // outward normal (points away from center line)
  const cxL=r, cxR=${W}-r;
  let nx=0,ny=0;
  if(px<cxL){ nx=px-cxL; ny=py-cy; }
  else if(px>cxR){ nx=px-cxR; ny=py-cy; }
  else { nx=0; ny=py-cy; }
  const m=Math.hypot(nx,ny)||1; return [nx/m,ny/m];
}
for(let py=0;py<${H};py++)for(let px=0;px<${W};px++){
  const i=(py*${W}+px)*4;
  const d=sdf(px+.5,py+.5);
  let dx=0,dy=0;
  if(d>0&&d<${EDGE}){
    const t=1-d/${EDGE};             // 0 center-edgezone .. 1 rim
    const mag=t*t;                    // dome falloff (Snell-ish)
    const [nx,ny]=normal(px+.5,py+.5);
    dx=-nx*mag; dy=-ny*mag;           // bend inward
  }
  img.data[i]=Math.round(128+dx*127);
  img.data[i+1]=Math.round(128+dy*127);
  img.data[i+2]=0; img.data[i+3]=255;
}
x.putImageData(img,0,0);
</script>`;

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.locator('#c').screenshot({ path: 'public/glass-map.png' });
await b.close();
console.log('public/glass-map.png written');
