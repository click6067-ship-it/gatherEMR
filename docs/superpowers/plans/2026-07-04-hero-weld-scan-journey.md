# The Weld Scan Journey — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the gatherEMR landing hero into a pinned scroll-scrub cinematic (scroll drives video frames dark→light), ending in a refined glass dashboard, while the light body sections stay and gain a shared "laser scanline" motif + a glowing Get Started button.

**Architecture:** A tall `scrub-wrap` (300vh) pins a `100svh` stage; scroll progress (pure `scrubMath`) drives `video.currentTime` via LERP with a `!video.seeking` guard (no black frames). Copy beats + a paper-white wash + the reassembling `HeroDashboard` reveal across the last 15% of scroll. Mobile/reduced-motion fall back to autoplay-once + dashboard. Vanilla rAF only — no framer-motion.

**Tech Stack:** Next.js 16 (App Router, client components), plain CSS in `app/globals.css`, vanilla `requestAnimationFrame`, vitest for pure logic. IBM Plex Sans/Mono (existing). No new runtime dependencies.

## Global Constraints

- **No new npm dependencies** — vanilla rAF, no framer-motion, no lenis (deferred/optional per spec §4).
- **Fonts unchanged** — IBM Plex Sans (`--font-sans`) / IBM Plex Mono (`--font-mono`). Do NOT add Space Mono.
- **Palette:** dark hero tokens `--void #06080f`, `--arc #2f6bff`, `--arc-hi #4d8cff`, `--arc-core #eaf3ff`, `--glass-glow rgba(47,107,255,.5)`; light body palette + 4 accents unchanged; add NO other colors.
- **Z-index (exact):** video `z-1` < scrub content `z-10` < bottom progressive blur `z-30` < nav `z-50`.
- **NO dark overlay** on the video — no semi-transparent black div, `::after` tint, or gradient over the video. Only `background: var(--void)` on the wrapper (pre-load).
- **Signature = laser scanline** — reused as body section dividers.
- **Copy verbatim:** beat0 `차트는 길다.` · beat1 `봐야 할 것만, 남긴다.` · payoff reuses existing `12문장` count-up + 4 cards + `시작하기` button.
- **Video is placeholder** — use `/hero-poster.jpg` + `/hero-mood.webm` (existing) until the final linear mp4 arrives; final video is a later swap, not part of this plan.
- **Respect `prefers-reduced-motion`** in every animated element.
- Verify each task before moving on: `npm run build` must pass; visual tasks verified with dev server + `/vcheck` + `sloplint`.

---

### Task 1: Dark tokens + laser scanline signature (CSS)

**Files:**
- Modify: `app/globals.css` (append a new `/* ── Weld Scan ── */` block near the landing styles, after line ~264)

**Interfaces:**
- Produces: CSS custom props `--void --arc --arc-hi --arc-core --glass-glow` on `:root`; utility class `.scanline` (an `<hr>` styled as a glowing blue line).

- [ ] **Step 1: Add dark tokens to `:root`**

In `app/globals.css`, inside the existing `:root { … }` (after line 27, before the closing `}` at line 28), add:

```css
  /* ── Weld Scan (dark hero) tokens ── */
  --void: #06080f;
  --arc: #2f6bff;
  --arc-hi: #4d8cff;
  --arc-core: #eaf3ff;
  --glass-glow: rgba(47, 107, 255, .5);
```

- [ ] **Step 2: Add the `.scanline` signature divider**

Append to `app/globals.css`:

```css
/* ── signature: laser scanline (hero mechanic + body section divider) ── */
.scanline { position: relative; height: 1px; border: 0; margin: clamp(40px, 9vh, 96px) auto; width: min(1040px, 84vw);
  background: linear-gradient(90deg, transparent, var(--focus) 22%, var(--arc-hi) 50%, var(--focus) 78%, transparent); opacity: .55; }
.scanline::after { content: ''; position: absolute; inset: -2px 0; background: inherit; filter: blur(3px); opacity: .6; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .scanline::after { filter: none; } }
```

- [ ] **Step 3: Verify build + render**

Add a temporary `<hr className="scanline" />` at the top of `<main className="ld">` in `app/page.tsx`, then:

Run: `npm run build`
Expected: build succeeds (no CSS/JSX errors).

Run: `npm run dev` and open the site; confirm a thin glowing blue line renders. Then **remove the temporary `<hr>`**.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(landing): dark weld-scan tokens + laser scanline signature"
```

---

### Task 2: Get Started glowing rotating border (CSS)

**Files:**
- Modify: `app/globals.css` (extend `.navpill.cta` rules ~line 206-215; add `.ld-cta` glow)

**Interfaces:**
- Produces: hover-only rotating conic light on the 2px border of `.navpill.cta` and `.ld-cta`; existing 4-color flowing background preserved.

- [ ] **Step 1: Add the rotating-border glow**

Append to `app/globals.css`:

```css
/* ── Get Started: rotating glow border on hover (border-only via mask) ── */
@property --cta-ang { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.navpill.cta, .ld-cta { position: relative; }
.navpill.cta::before, .ld-cta::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 2px; pointer-events: none; z-index: 2;
  background: conic-gradient(from var(--cta-ang), transparent 0turn, var(--arc-core) .10turn, var(--arc-hi) .18turn, transparent .34turn, transparent 1turn);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude;
  opacity: 0; transition: opacity .25s; }
.navpill.cta:hover::before, .ld-cta:hover::before { opacity: 1; animation: cta-orbit 1.8s linear infinite; }
.navpill.cta:hover, .ld-cta:hover { box-shadow: 0 0 0 1px rgba(77,140,255,.4), 0 10px 40px -6px rgba(47,107,255,.55); }
@keyframes cta-orbit { to { --cta-ang: 360deg; } }
@media (prefers-reduced-motion: reduce) { .navpill.cta:hover::before, .ld-cta:hover::before { animation: none; } }
```

Note: `.ld-cta` currently has no border/bg making the ring subtle — that's intended (light section). `.navpill.cta` keeps its flowing gradient bg (lines 207-215) untouched; the ring sits on top via `z-index:2` and its own `span` stays at `z-index:1`.

- [ ] **Step 2: Verify hover**

Run: `npm run dev`; hover the nav **GET STARTED** pill and the CTA-section **시작하기** button.
Expected: a light streak orbits the button's border on hover; leaving hover fades it out; no layout shift; the nav pill's 4-color background still flows.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(landing): rotating glow border on Get Started hover"
```

---

### Task 3: Pure scrub math + unit tests (TDD)

**Files:**
- Create: `app/components/scrubMath.ts`
- Test: `app/components/scrubMath.test.ts`

**Interfaces:**
- Produces:
  - `clamp(v: number, min: number, max: number): number`
  - `lerp(current: number, target: number, factor: number): number`
  - `sectionProgress(top: number, wrapHeight: number, viewportH: number): number` — `top` = wrapper `getBoundingClientRect().top`; returns 0..1 progress through the pinned scroll (0 before entering, 1 after scrubbed through), clamped.

- [ ] **Step 1: Write the failing tests**

Create `app/components/scrubMath.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { clamp, lerp, sectionProgress } from './scrubMath';

describe('clamp', () => {
  it('bounds within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('moves current toward target by factor', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(10, 10, 0.12)).toBe(10);
  });
});

describe('sectionProgress', () => {
  const H = 3000, V = 1000; // scrollable range = 2000
  it('is 0 before/at entry (top >= 0)', () => {
    expect(sectionProgress(500, H, V)).toBe(0);
    expect(sectionProgress(0, H, V)).toBe(0);
  });
  it('is 0.5 at mid scrub (top = -1000)', () => {
    expect(sectionProgress(-1000, H, V)).toBeCloseTo(0.5, 5);
  });
  it('is 1 at/after end (top <= -2000)', () => {
    expect(sectionProgress(-2000, H, V)).toBe(1);
    expect(sectionProgress(-9999, H, V)).toBe(1);
  });
  it('never divides by zero when wrapHeight == viewportH', () => {
    expect(sectionProgress(-10, 1000, 1000)).toBe(1);
    expect(sectionProgress(10, 1000, 1000)).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- scrubMath`
Expected: FAIL — `scrubMath.ts` module not found / exports undefined.

- [ ] **Step 3: Implement `scrubMath.ts`**

Create `app/components/scrubMath.ts`:

```ts
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(v, max));
}

export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

/** Progress 0..1 through a pinned scrub section.
 *  top = wrapper.getBoundingClientRect().top; range = wrapHeight - viewportH. */
export function sectionProgress(top: number, wrapHeight: number, viewportH: number): number {
  const range = wrapHeight - viewportH;
  if (range <= 0) return top <= 0 ? 1 : 0;
  return clamp(-top / range, 0, 1);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- scrubMath`
Expected: PASS (all 4 describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add app/components/scrubMath.ts app/components/scrubMath.test.ts
git commit -m "feat(landing): scrub math helpers with unit tests"
```

---

### Task 4: Extract HeroDashboard component (refactor, no visual change)

**Files:**
- Create: `app/components/HeroDashboard.tsx`
- Modify: `app/page.tsx` (move `useCountUp`, `TICKS`, the `.ld-dash` markup + `snapOpen` state out of `Landing`)

**Interfaces:**
- Produces: `export function HeroDashboard(): JSX.Element` — self-contained; owns its own `useCountUp(12)` and `snapOpen` state. Renders the existing `.ld-dash` block verbatim (main count-up card + timeline ticker + 4 info cards).
- Consumes: `GROUPS/SPECIALTIES` not needed here; imports `Link` from `next/link`.

- [ ] **Step 1: Create `HeroDashboard.tsx`**

Create `app/components/HeroDashboard.tsx` with `'use client';`, moving `useCountUp` (page.tsx:12-24), `TICKS` (page.tsx:26), and the `.ld-dash` JSX (page.tsx:113-171) plus the `snapOpen` state (page.tsx:30):

```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function useCountUp(target: number, duration = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let i = 0; const steps = 40;
    const t = setInterval(() => { i++; setV(Math.round((target * i) / steps)); if (i >= steps) clearInterval(t); }, duration / steps);
    return () => clearInterval(t);
  }, [target, duration]);
  return v;
}
const TICKS = Array.from({ length: 61 }, (_, i) => i);

export function HeroDashboard() {
  const sentences = useCountUp(12);
  const [snapOpen, setSnapOpen] = useState(false);
  return (
    <div className="ld-dash">
      {/* PASTE the exact contents of page.tsx lines 114-170 (ld-dash-left + ld-dash-right) here, unchanged */}
    </div>
  );
}
```

Paste the existing `ld-dash-left` and `ld-dash-right` markup (page.tsx:114-170) verbatim into the `.ld-dash` div.

- [ ] **Step 2: Remove the moved code from `page.tsx`**

In `app/page.tsx`: delete `useCountUp` (12-24), `TICKS` (26), `const sentences = useCountUp(12)` (29), `const [snapOpen, setSnapOpen]` (30). The `.ld-hero` section will be replaced in Task 8 — for now, temporarily render `<HeroDashboard />` inside the existing `.ld-hero` (replacing the inline `.ld-dash`) so the page still builds. Add `import { HeroDashboard } from '@/app/components/HeroDashboard';`.

- [ ] **Step 3: Verify no visual regression**

Run: `npm run build` → succeeds.
Run: `npm run dev`; the hero dashboard looks **identical** to before (count-up to 12, ticker scrolls, 4 cards, snap card expands on hover).

- [ ] **Step 4: Commit**

```bash
git add app/components/HeroDashboard.tsx app/page.tsx
git commit -m "refactor(landing): extract HeroDashboard component (no visual change)"
```

---

### Task 5: LiquidVideoCanvas — scroll-driven video with `!seeking` guard

**Files:**
- Create: `app/components/LiquidVideoCanvas.tsx`
- Modify: `app/globals.css` (add `.lvc-video` + entrance)

**Interfaces:**
- Consumes: `lerp` from `./scrubMath`.
- Produces: `export function LiquidVideoCanvas({ progressRef, poster, srcWebm, srcMp4 }): JSX.Element` where `progressRef: React.MutableRefObject<number>` (0..1, read every frame). Renders a `<video className="lvc-video">` (muted, playsInline, preload=auto, NO autoplay, NO loop) and seeks `currentTime = progress * duration`.

- [ ] **Step 1: Create `LiquidVideoCanvas.tsx`**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { lerp } from './scrubMath';

export function LiquidVideoCanvas({ progressRef, poster, srcWebm, srcMp4 }: {
  progressRef: React.MutableRefObject<number>;
  poster: string; srcWebm: string; srcMp4?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current; if (!video) return;
    let raf = 0, smoothed = 0, isSeeking = false, errors = 0;
    let nextSeekTime: number | null = null;

    const seek = (t: number) => { isSeeking = true; try { video.currentTime = t; } catch { isSeeking = false; } };
    const onSeeked = () => {
      isSeeking = false;
      if (nextSeekTime !== null && !video.seeking) { const t = nextSeekTime; nextSeekTime = null; seek(t); }
    };
    const onError = () => { errors++; };
    const onCanPlay = () => video.classList.add('ready');
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.addEventListener('canplay', onCanPlay);
    const safety = setTimeout(() => video.classList.add('ready'), 3500);

    const tick = () => {
      const dur = video.duration || 0;
      if (dur > 0 && errors < 3) {
        const target = progressRef.current * dur;
        smoothed = lerp(smoothed, target, 0.12);
        const clamped = Math.max(0, Math.min(smoothed, dur - 0.05));
        if (!isSeeking && !video.seeking) seek(clamped);   // ⭐ the guard
        else nextSeekTime = clamped;                        // queue for after 'seeked'
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(safety);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [progressRef]);

  return (
    <video ref={videoRef} className="lvc-video" muted playsInline preload="auto" poster={poster} aria-hidden="true">
      {srcMp4 && <source src={srcMp4} type="video/mp4" />}
      <source src={srcWebm} type="video/webm" />
    </video>
  );
}
```

- [ ] **Step 2: Add video CSS (no dark overlay; entrance)**

Append to `app/globals.css`:

```css
/* ── LiquidVideoCanvas — fills the pinned stage, natural brightness (NO overlay) ── */
.lvc-video { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover;
  opacity: 0; transform: scale(1.12); transition: opacity 1.4s cubic-bezier(.16,1,.3,1), transform 1.4s cubic-bezier(.16,1,.3,1); }
.lvc-video.ready { opacity: 1; transform: scale(1); }
@media (prefers-reduced-motion: reduce) { .lvc-video { transition: none; transform: none; opacity: 1; } }
```

- [ ] **Step 3: Verify build + isolated seek**

Run: `npm run build` → succeeds.
Temporary smoke test: in `page.tsx`, render `<div style={{height:'300vh'}}><div style={{position:'sticky',top:0,height:'100svh'}}><LiquidVideoCanvas progressRef={testRef} poster="/hero-poster.jpg" srcWebm="/hero-mood.webm" /></div></div>` with a `testRef` updated on scroll (or just confirm it mounts + shows the poster then first frame). Confirm **no console errors** and the video shows (natural brightness, no dark tint). Remove the smoke test after. (Full scrub wiring is Task 6.)

- [ ] **Step 4: Commit**

```bash
git add app/components/LiquidVideoCanvas.tsx app/globals.css
git commit -m "feat(landing): LiquidVideoCanvas scroll-seek with !seeking guard"
```

---

### Task 6: ScrubHero (desktop) — pin, progress, copy beats, wash, payoff

**Files:**
- Create: `app/components/ScrubHero.tsx`
- Modify: `app/globals.css` (scrub-wrap / stage / copy / wash / payoff)

**Interfaces:**
- Consumes: `sectionProgress` from `./scrubMath`; `LiquidVideoCanvas`; `HeroDashboard`.
- Produces: `export function ScrubHero(): JSX.Element`. Desktop path only in this task (fallback added in Task 7). Owns `wrapRef`, a `progressRef` (passed to canvas), and React state `beat: 0|1|2` and `payoff: number (0..1)`.

- [ ] **Step 1: Create `ScrubHero.tsx` (desktop path)**

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { sectionProgress } from './scrubMath';
import { LiquidVideoCanvas } from './LiquidVideoCanvas';
import { HeroDashboard } from './HeroDashboard';

export function ScrubHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [beat, setBeat] = useState<0 | 1 | 2>(0);
  const [payoff, setPayoff] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    let raf = 0;
    const tick = () => {
      const p = sectionProgress(wrap.getBoundingClientRect().top, wrap.offsetHeight, window.innerHeight);
      progressRef.current = p;
      setBeat(p < 0.33 ? 0 : p < 0.75 ? 1 : 2);
      setPayoff(p < 0.85 ? 0 : (p - 0.85) / 0.15);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="scrub-wrap" ref={wrapRef}>
      <div className="scrub-stage">
        <LiquidVideoCanvas progressRef={progressRef} poster="/hero-poster.jpg" srcWebm="/hero-mood.webm" />
        <div className="scrub-wash" style={{ opacity: payoff }} aria-hidden="true" />
        <div className="scrub-copy" data-beat={beat}>
          <p className="scrub-line l0">차트는 길다.</p>
          <p className="scrub-line l1">봐야 할 것만, 남긴다.</p>
        </div>
        <div className="scrub-payoff" style={{ opacity: payoff, transform: `translateY(${(1 - payoff) * 28}px)` }}>
          <HeroDashboard />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add scrub CSS**

Append to `app/globals.css`:

```css
/* ── ScrubHero — pinned scrub stage ── */
.scrub-wrap { position: relative; height: 300vh; background: var(--void); }
.scrub-stage { position: sticky; top: 0; height: 100svh; min-height: 640px; overflow: clip; background: var(--void); }
/* dark→light wash (paper wash fades in over last 15%) — this is NOT a dark overlay */
.scrub-wash { position: absolute; inset: 0; z-index: 5; pointer-events: none;
  background: linear-gradient(180deg, transparent 30%, var(--paper) 92%); }
/* copy beats */
.scrub-copy { position: absolute; z-index: 10; left: max(24px, 6vw); bottom: 12vh; color: #f5f4ef; }
.scrub-line { font-size: clamp(30px, 5vw, 60px); font-weight: 300; letter-spacing: -.035em; line-height: 1.05;
  opacity: 0; transform: translateY(14px); transition: opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1); }
.scrub-copy[data-beat="0"] .l0 { opacity: 1; transform: none; }
.scrub-copy[data-beat="1"] .l1 { opacity: 1; transform: none; }
.scrub-copy[data-beat="2"] .scrub-line { opacity: 0; }        /* copy clears for the payoff */
/* payoff dashboard */
.scrub-payoff { position: absolute; z-index: 10; inset: 0; display: flex; align-items: flex-end;
  padding: 96px max(20px, 4vw) max(24px, 4vh); transition: opacity .4s ease, transform .4s cubic-bezier(.16,1,.3,1); }
.scrub-payoff .ld-dash { width: 100%; }
@media (prefers-reduced-motion: reduce) { .scrub-line { transition: none; } }
```

Note: `.scrub-payoff` starts at `opacity:0` via the inline style; when scrubbed past 85% the inline `opacity`/`transform` reveal it. The `.ld-dash` glass cards keep their existing `.ink-glass` styling (readable over the brightening scene).

- [ ] **Step 3: Wire into page temporarily & verify scrub**

In `app/page.tsx`, replace the `<section className="ld-hero">…</section>` (lines 107-172) with `<ScrubHero />` and import it. (Full page integration is finalized in Task 8.)

Run: `npm run dev`. Scroll slowly through the hero:
Expected: video frame advances with scroll (paper→glass), reverses on scroll up, **no black frames/stutter**; "차트는 길다" → "봐야 할 것만, 남긴다" swap at beats; near the bottom the scene washes to paper and the glass dashboard rises in.

- [ ] **Step 4: Commit**

```bash
git add app/components/ScrubHero.tsx app/globals.css app/page.tsx
git commit -m "feat(landing): ScrubHero pinned scrub with copy beats + dashboard payoff"
```

---

### Task 7: Mobile & reduced-motion fallback

**Files:**
- Modify: `app/components/ScrubHero.tsx`
- Modify: `app/globals.css` (`.scrub-fallback`)

**Interfaces:**
- Produces: same `ScrubHero` export; when `matchMedia('(max-width:767px)')`, touch, or `prefers-reduced-motion` matches, renders a non-scrub fallback (autoplay-once loop video + `HeroDashboard` directly).

- [ ] **Step 1: Add fallback branch to `ScrubHero`**

At the top of `ScrubHero`, add state + detection; return the fallback before the scrub markup:

```tsx
  const [scrub, setScrub] = useState(true);
  useEffect(() => {
    const mobile = matchMedia('(max-width: 767px)').matches || (typeof window !== 'undefined' && 'ontouchstart' in window);
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (mobile || rm) setScrub(false);
  }, []);
```

Guard the scroll `useEffect` with `if (!scrub) return;` (add `scrub` to its dep array). Then before the desktop `return`:

```tsx
  if (!scrub) {
    return (
      <section className="scrub-fallback">
        <video className="lvc-video ready" autoPlay muted loop playsInline poster="/hero-poster.jpg" aria-hidden="true">
          <source src="/hero-mood.webm" type="video/webm" />
        </video>
        <div className="scrub-fallback-inner"><HeroDashboard /></div>
      </section>
    );
  }
```

- [ ] **Step 2: Add fallback CSS**

Append to `app/globals.css`:

```css
/* ── ScrubHero fallback (mobile / reduced-motion): autoplay + dashboard, no scrub ── */
.scrub-fallback { position: relative; min-height: 100svh; display: flex; align-items: flex-end; overflow: clip; background: var(--void); }
.scrub-fallback-inner { position: relative; z-index: 10; width: 100%; padding: 96px max(20px, 4vw) max(24px, 4vh); }
```

- [ ] **Step 3: Verify fallback**

Run: `npm run dev`.
- Resize to <768px (or use devtools mobile): hero shows the video autoplaying + the dashboard visible, **page scrolls normally** (no 300vh pin).
- Toggle OS "reduce motion" (or emulate `prefers-reduced-motion: reduce` in devtools): same fallback, no scrub, no entrance animation.

- [ ] **Step 4: Commit**

```bash
git add app/components/ScrubHero.tsx app/globals.css
git commit -m "feat(landing): mobile + reduced-motion fallback for ScrubHero"
```

---

### Task 8: Page integration + body motif threading

**Files:**
- Modify: `app/page.tsx` (finalize hero swap; add scanline dividers; blue-arc glow on demo wire)
- Modify: `app/globals.css` (arc glow on `.ld-wire`)

**Interfaces:**
- Consumes: `ScrubHero`. Produces: final landing structure — `ScrubHero` then light body (`#demo`, `#specialties`, CTA) separated by `.scanline` dividers.

- [ ] **Step 1: Finalize page structure**

In `app/page.tsx`, confirm the hero is `<ScrubHero />` (from Task 6/7) and the nav/drawer/menu-fab remain unchanged above it. Between the body sections insert scanline dividers:

- After `</section>` of `#demo` (page.tsx ~198): add `<hr className="scanline" />`
- After `</section>` of `#specialties` (~215): add `<hr className="scanline" />`

Keep S2/S3/S5 markup otherwise unchanged.

- [ ] **Step 2: Add blue-arc glow to the demo connector wire**

In `app/globals.css`, modify `.ld-wire path` (line 344) to add a soft arc glow via `filter` (keep the existing red stroke; add drop-shadow):

```css
.ld-wire path { stroke: var(--red); stroke-width: 1.6; stroke-dasharray: 160; stroke-dashoffset: 160;
  filter: drop-shadow(0 0 3px rgba(47,107,255,.5)); }
```

- [ ] **Step 3: Verify full page**

Run: `npm run build` → succeeds.
Run: `npm run dev`; scroll top→bottom:
Expected: scrub hero → dashboard payoff → paper wash → light demo (scanline divider) → 25 specialties (scanline divider) → CTA with glow button. No horizontal overflow. No console errors.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat(landing): integrate ScrubHero + scanline dividers + arc glow on demo wire"
```

---

### Task 9: Verification pass (sloplint, vcheck, scrub QA)

**Files:** none (verification only). Fix-forward into the relevant task's files if a check fails.

- [ ] **Step 1: Build + unit tests**

Run: `npm run build` → succeeds.
Run: `npm run test` → all pass (scrubMath).

- [ ] **Step 2: Deterministic anti-slop lint**

Start dev server (`npm run dev`), then:
Run: `node ~/.claude/tools/headless/sloplint.mjs http://localhost:3000`
Expected: no default-convergence flags (Inter/purple/template signals). If flagged, confirm each is an intentional, reference-backed choice or rework.

- [ ] **Step 3: Visual verification (desktop + mobile)**

Run: `/vcheck http://localhost:3000`
Expected: desktop + mobile screenshots render; no horizontal overflow; no console/page errors. On mobile, the fallback hero (autoplay + dashboard) shows, not a broken pin.

- [ ] **Step 4: Manual scrub QA (the `!seeking` guard payoff)**

In desktop browser, scroll the hero up and down repeatedly at varying speeds.
Expected: no black frames, no stutter, frame tracks scroll; copy beats swap; payoff dashboard reveals/hides smoothly; reduced-motion + <768px both fall back correctly.

- [ ] **Step 5: Commit (if any fixes were made)**

```bash
git add -A
git commit -m "fix(landing): weld-scan journey verification fixes"
```

---

## Self-Review

**Spec coverage:** §3 tokens+scanline → T1; §6 glow button → T2; §4 scrub math/seek guard → T3+T5; payoff dashboard reuse → T4; pinned scrub + copy beats + wash + payoff → T6; mobile/RM fallback → T7; body motif threading → T8; verification (sloplint/vcheck/scrub QA) → T9. §7 deliverable (final video) is explicitly out-of-scope (placeholder). All spec sections mapped.

**Placeholders:** none — every code step has real code; the only "paste verbatim" is T4 Step 1 (existing markup move), with exact source line refs.

**Type consistency:** `progressRef: MutableRefObject<number>` produced by ScrubHero (T6) matches LiquidVideoCanvas prop (T5). `sectionProgress(top, wrapHeight, viewportH)` signature consistent T3↔T6. `lerp` signature consistent T3↔T5. `.lvc-video`, `.scrub-*`, `.scanline`, `.navpill.cta::before` class names consistent across CSS and TSX.
