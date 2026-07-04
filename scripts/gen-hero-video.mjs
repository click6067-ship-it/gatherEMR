import { createRequire } from 'module';
const require = createRequire('/home/click/.claude/tools/headless/package.json');
const { chromium } = require('playwright');
import { readdirSync, renameSync, rmSync, mkdirSync } from 'node:fs';

/* Self-rendered hero mood loop — "종이 위의 빛" (DESIGN-V3 hero = video only).
 * Abstract: warm ECG paper + faint grid + soft light sweep + drifting ink blooms + grain.
 * NO text, NO waveform → nothing medically falsifiable. Seamless 6s loop (all motion periodic).
 * Swappable later with a Seedance clip. */

const W = 1280, H = 720, LOOP = 6000;
const html = `<!doctype html><meta charset=utf-8><style>html,body{margin:0}canvas{display:block}</style>
<canvas id=c width=${W} height=${H}></canvas><script>
const c=document.getElementById('c'),x=c.getContext('2d');
// grain tile
const gt=document.createElement('canvas');gt.width=gt.height=140;const gx=gt.getContext('2d');
const nd=gx.createImageData(140,140);for(let i=0;i<nd.data.length;i+=4){const v=120+Math.random()*70;nd.data[i]=nd.data[i+1]=nd.data[i+2]=v;nd.data[i+3]=10;}gx.putImageData(nd,0,0);
const blooms=[{x:.28,y:.62,r:230,ph:0},{x:.7,y:.32,r:300,ph:2.1},{x:.52,y:.78,r:180,ph:4.0}];
function frame(now){
  const p=(now%${LOOP})/${LOOP}, a=p*Math.PI*2;
  // paper
  x.fillStyle='#faf8f3';x.fillRect(0,0,${W},${H});
  // faint ECG grid
  x.strokeStyle='rgba(201,138,148,.10)';x.lineWidth=1;
  for(let gx2=0;gx2<${W};gx2+=22){x.beginPath();x.moveTo(gx2,0);x.lineTo(gx2,${H});x.stroke();}
  for(let gy=0;gy<${H};gy+=22){x.beginPath();x.moveTo(0,gy);x.lineTo(${W},gy);x.stroke();}
  x.strokeStyle='rgba(201,138,148,.16)';x.lineWidth=1.4;
  for(let gx2=0;gx2<${W};gx2+=110){x.beginPath();x.moveTo(gx2,0);x.lineTo(gx2,${H});x.stroke();}
  for(let gy=0;gy<${H};gy+=110){x.beginPath();x.moveTo(0,gy);x.lineTo(${W},gy);x.stroke();}
  // ink blooms (breathing + drift)
  x.globalCompositeOperation='multiply';
  for(const b of blooms){
    const bx=b.x*${W}+Math.sin(a+b.ph)*40, by=b.y*${H}+Math.cos(a*.8+b.ph)*30;
    const rr=b.r*(0.82+0.18*Math.sin(a+b.ph));
    const g=x.createRadialGradient(bx,by,0,bx,by,rr);
    g.addColorStop(0,'rgba(23,25,28,.10)');g.addColorStop(.6,'rgba(23,25,28,.045)');g.addColorStop(1,'rgba(23,25,28,0)');
    x.fillStyle=g;x.beginPath();x.arc(bx,by,rr,0,7);x.fill();
  }
  x.globalCompositeOperation='source-over';
  // light sweep L->R
  const sx=(p*1.5-0.25)*${W};
  const lg=x.createLinearGradient(sx-360,0,sx+360,${H}*.5);
  lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,'rgba(255,253,247,.55)');lg.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=lg;x.fillRect(0,0,${W},${H});
  // vignette
  const vg=x.createRadialGradient(${W}/2,${H}/2,${H}*.35,${W}/2,${H}/2,${H}*.8);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(40,36,28,.14)');
  x.fillStyle=vg;x.fillRect(0,0,${W},${H});
  // grain
  x.globalAlpha=.6;x.drawImage(gt,(now/70)%140-140,(now/95)%140-140,${W}+280,${H}+280);x.globalAlpha=1;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
</script>`;

const outDir = 'public';
mkdirSync(outDir, { recursive: true });
const tmp = process.env.SP + '/vid';
rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader'] });
const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: tmp, size: { width: W, height: H } } });
const page = await context.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.screenshot({ path: outDir + '/hero-poster.jpg', quality: 82, type: 'jpeg' });
await page.waitForTimeout(LOOP + 250); // record ~1 loop
await page.close();
await context.close();
await browser.close();

const f = readdirSync(tmp).find((n) => n.endsWith('.webm'));
renameSync(tmp + '/' + f, outDir + '/hero-mood.webm');
console.log('hero-mood.webm + hero-poster.jpg written to public/');
