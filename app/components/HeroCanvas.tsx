'use client';

import { useEffect, useRef } from 'react';

/* S0 hero — "차트가 요약으로 증류되는 6초" live code render (DESIGN-V3-SPEC §S0).
 * Light cinematic: paper grain + soft light sweep + micro drift (film treatment).
 * Seamless 6s loop; reacts to scroll (dim + ECG bend); reduced-motion → static frame.
 * No assets, no libraries — the "video" is the product working. */

const CHART_LINES = [
  '[Triage 18:42]  ███ · 67/M',
  'CC: chest discomfort, SOB',
  'BP 168/94 · HR 104 · SpO2 91% RA',
  'Pain 7/10 · sweating(+) · radiation(+)',
  '[Nursing 18:51] "가슴이 꽉 막힌 느낌"',
  'home meds: warfarin? 당뇨약 — unsure',
  '[ED 19:08] pain 3/10 after rest',
  '[EKG 19:10] sinus tach · no STEMI',
  '[Lab 19:22] Troponin-I 0.8',
  'Cr 1.8 · eGFR 38 · K 5.1 · INR 1.7',
  '[Lab 20:46] Troponin-I 2.1 ↑',
  'repeat Troponin 21:10 — pending',
  '', '', '', // section gap so the wrap reads as a document break, not a glitch
];
const HILITE = new Set([5, 8, 10]); // warfarin unsure · troponin 0.8 · troponin 2.1
const SUMMARY = [
  { text: 'Troponin 0.8 → 2.1 (19:22→20:46)', warn: true },
  { text: 'r/o NSTEMI — EKG no STEMI criteria', warn: false },
  { text: 'warfarin 복용 불명 · INR 1.7', warn: false },
];

const DUR = 6000;
const ease = (x: number) => x * x * (3 - 2 * x); // smoothstep
const win = (t: number, a: number, b: number, c: number, d: number) => {
  // 0→1 during [a,b], hold, 1→0 during [c,d]
  if (t < a || t > d) return 0;
  if (t < b) return ease((t - a) / (b - a));
  if (t < c) return 1;
  return 1 - ease((t - c) / (d - c));
};

/** Physiologically plausible P-QRS-T beat, x in [0,1] → y offset (px, up = negative). */
function ecgY(x: number, amp: number): number {
  const g = (c: number, w: number, h: number) => h * Math.exp(-((x - c) ** 2) / (2 * w * w));
  return -(
    g(0.18, 0.025, 0.12 * amp) + // P
    -g(0.30, 0.008, 0.16 * amp) + // Q
    g(0.34, 0.012, 1.0 * amp) + // R
    -g(0.38, 0.010, 0.28 * amp) + // S
    g(0.58, 0.045, 0.22 * amp) // T
  );
}

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const style = getComputedStyle(document.documentElement);
    const MONO = `${style.getPropertyValue('--font-mono') || 'ui-monospace'}, ui-monospace, monospace`;
    const SANS = `${style.getPropertyValue('--font-sans') || 'sans-serif'}, sans-serif`;
    const INK = '#17191c', MUTED = '#6b7178', LINE = '#ddd9d0', BLUE = '#2563eb', RED = '#c4342b', MARK = '#ffe9a8';

    // pre-render grain tile (film treatment)
    const grain = document.createElement('canvas');
    grain.width = grain.height = 128;
    const g = grain.getContext('2d')!;
    const noise = g.createImageData(128, 128);
    for (let i = 0; i < noise.data.length; i += 4) {
      const v = 110 + Math.random() * 60;
      noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = v;
      noise.data[i + 3] = 14;
    }
    g.putImageData(noise, 0, 0);

    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, scrollP = 0;

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now: number) {
      const t = ((now % DUR) / DUR) * 6; // 0..6s
      ctx!.clearRect(0, 0, w, h);

      const narrow = w < 760;
      const dim = narrow ? 0.5 : 1; // scene sits behind copy on mobile → quieter
      // micro camera drift
      const dx = Math.sin(now / 9000) * 3, dy = Math.cos(now / 11000) * 2;
      ctx!.save();
      ctx!.translate(dx, dy);

      /* ── chart column (flowing up, continuous) ── */
      const colX = narrow ? w * 0.08 : w * 0.5;
      const colW = narrow ? w * 0.84 : w * 0.26;
      const lh = Math.max(24, h * 0.042);
      const fs = Math.min(14, lh * 0.52);
      ctx!.font = `${fs}px ${MONO}`;
      const total = CHART_LINES.length * lh;
      const flow = ((now / 14000) * lh * 2) % lh; // slow continuous drift
      const hiA = win(t, 1.4, 2.1, 4.9, 5.7);
      const top = h * 0.2;
      for (let r = -1; r < CHART_LINES.length + 1; r++) {
        const i = ((r % CHART_LINES.length) + CHART_LINES.length) % CHART_LINES.length;
        const y = top + r * lh - flow;
        if (y < h * 0.08 || y > h * 0.86) continue;
        const edge = Math.min(1, (y - h * 0.08) / (h * 0.1), (h * 0.86 - y) / (h * 0.1));
        const isHi = HILITE.has(i);
        if (isHi && hiA > 0.01) {
          const tw = ctx!.measureText(CHART_LINES[i]).width;
          ctx!.globalAlpha = 0.85 * hiA * edge * dim;
          ctx!.fillStyle = MARK;
          ctx!.fillRect(colX - 3, y - fs * 0.85, Math.min(tw, colW) + 6, fs * 1.5);
        }
        ctx!.globalAlpha = (isHi ? 0.28 + 0.6 * hiA : 0.28) * edge * dim;
        ctx!.fillStyle = isHi && hiA > 0.3 ? INK : MUTED;
        ctx!.fillText(CHART_LINES[i], colX, y, colW);
      }

      /* ── summary panel (distilled, right) ── */
      const sumA = win(t, 2.7, 3.4, 5.0, 5.8);
      if (sumA > 0.01 && !narrow) {
        const px = w * 0.76, pw = w * 0.2, py = h * 0.3;
        ctx!.globalAlpha = sumA * dim;
        ctx!.font = `600 ${fs * 0.82}px ${SANS}`;
        ctx!.fillStyle = MUTED;
        ctx!.fillText('요약 — 근거 연결', px, py - lh * 0.9);
        SUMMARY.forEach((s, i) => {
          const iy = py + i * lh * 1.5;
          const ia = Math.min(1, Math.max(0, sumA * 3 - i * 0.55));
          if (ia <= 0) return;
          ctx!.globalAlpha = ia * dim;
          ctx!.fillStyle = s.warn ? RED : BLUE;
          ctx!.fillRect(px - 10, iy - fs * 0.8, 3, fs * 1.5);
          ctx!.fillStyle = INK;
          ctx!.font = `${fs * 0.92}px ${MONO}`;
          ctx!.fillText(s.text, px, iy, pw);
        });
        /* connector: summary bar 1 → 'Troponin 2.1' source line */
        const conA = win(t, 3.5, 4.3, 5.0, 5.7);
        if (conA > 0.01) {
          const srcY = top + 10 * lh - flow; // line index 10
          if (srcY > h * 0.1 && srcY < h * 0.84) {
            const x1 = colX + Math.min(ctx!.measureText(CHART_LINES[10]).width, colW) + 12;
            const y1 = srcY - fs * 0.3, x2 = px - 14, y2 = py - fs * 0.3;
            ctx!.globalAlpha = 0.8 * conA * dim;
            ctx!.strokeStyle = RED; ctx!.lineWidth = 1.4;
            ctx!.setLineDash([w]); ctx!.lineDashOffset = (1 - conA) * w * 0.4;
            ctx!.beginPath();
            ctx!.moveTo(x1, y1);
            ctx!.bezierCurveTo(x1 + (x2 - x1) * 0.5, y1, x1 + (x2 - x1) * 0.5, y2, x2, y2);
            ctx!.stroke();
            ctx!.setLineDash([]);
            ctx!.beginPath(); ctx!.arc(x1, y1, 2.5, 0, 7); ctx!.fillStyle = RED; ctx!.fill();
          }
        }
      }

      /* ── ECG ink line (bottom, draws across 6s; bends down with scroll) ── */
      const ecgA = Math.min(win(t, 0.05, 0.35, 5.5, 5.95) + 0.001, 1);
      const baseY = h * 0.9, amp = h * 0.05;
      const head = (t / 6) * (w + 40) - 20;
      ctx!.globalAlpha = 0.9 * ecgA;
      ctx!.strokeStyle = INK; ctx!.lineWidth = 1.6;
      ctx!.lineJoin = 'round';
      ctx!.beginPath();
      const beatW = Math.max(180, w / 6);
      for (let x = 0; x <= Math.min(head, w); x += 2) {
        const y = baseY + ecgY((x % beatW) / beatW, amp) + scrollP * (x / w) * h * 0.14;
        x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      ctx!.restore();

      /* ── film: light sweep + grain + scroll dim ── */
      const sx = ((now / 12000) % 1.4 - 0.2) * w;
      const grad = ctx!.createLinearGradient(sx - w * 0.3, 0, sx + w * 0.3, h * 0.4);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, 'rgba(255,253,246,0.5)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx!.globalAlpha = 1; ctx!.fillStyle = grad; ctx!.fillRect(0, 0, w, h);
      ctx!.globalAlpha = 0.5;
      ctx!.drawImage(grain, (now / 90) % 128 - 128, (now / 130) % 128 - 128, w + 256, h + 256);
      if (scrollP > 0) {
        ctx!.globalAlpha = scrollP * 0.5;
        ctx!.fillStyle = '#fbfaf7'; ctx!.fillRect(0, 0, w, h);
      }
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      if (visible) draw(now);
      raf = requestAnimationFrame(loop);
    }

    const onScroll = () => { scrollP = Math.min(1, Math.max(0, scrollY / (h || 1))); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    resize();
    addEventListener('resize', resize);
    addEventListener('scroll', onScroll, { passive: true });

    if (reduced) {
      draw(3800); // static distilled frame
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener('resize', resize);
      removeEventListener('scroll', onScroll);
    };
  }, []);

  return <canvas ref={ref} className="ld-canvas" aria-hidden="true" />;
}
