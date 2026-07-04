# Dark Cinematic Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rip out the warm-glass presentation layer and rebuild the gatherEMR landing (and re-skin /app) as a dark cinematic look — autoplay blur/dim video hero + centered blue-arc shimmer hologram headline — while preserving all functionality (lib, api, /app flow logic).

**Architecture:** Full replacement of `app/globals.css` with a new dark design system; new landing composed of focused components (HeroVideo, HeroNav, ShinyText, HeroCenter, SpecialtiesSection, CtaSection, SiteFooter); old scrub components deleted. /app keeps its logic, gets new dark classes. Pure CSS (no Tailwind/Framer/Lucide); hologram = CSS keyframes; icons = inline SVG.

**Tech Stack:** Next.js 16 App Router, client components, plain CSS in `app/globals.css`, IBM Plex Sans/Mono (existing). No new npm dependencies.

## Global Constraints

- **No new npm dependencies** — no Tailwind, Framer Motion, or Lucide. Hologram via CSS `@keyframes`; icons via inline SVG.
- **Fonts:** IBM Plex Sans (`--font-sans`) / IBM Plex Mono (`--font-mono`). **Do NOT use Inter** (anti-slop).
- **Palette (exact):** `--bg #000000`, `--void #06080f`, `--arc #64CEFB`, `--arc-deep #2f6bff`, `--shine #ffffff`, body text `rgba(255,255,255,.8)` → hover `#fff`, line `rgba(255,255,255,.14)`. Add no other hues.
- **Preserve functionality:** do NOT change `lib/*`, `app/api/*`, or the logic/state/fetch in `app/app/page.tsx`, `SpecialtyPicker.tsx`, `ChartLens.tsx`. Re-skin markup/classes only.
- **Hero video:** `<video autoplay loop muted playsInline>` `object-cover`, background layer `z-0`, blur+dim, NO scroll-scrubbing. Src `/hero-flipscan.mp4`, poster `/hero-flipscan-poster.jpg`.
- **Headline (verbatim):** `진료차트를 요약하여 분과별 환자의 핵심만 파악합니다.` with the phrase `핵심만` wrapped in the shimmer (`.shiny`). Statement headline sizing (not giant slogan): text-4xl→~7xl, line-height 1.12.
- **CTA (verbatim):** `차트 넣어보기 →`, dark-glass style (`rgba(255,255,255,.07)` bg + `rgba(100,206,251,.35)` border + backdrop-blur), arrow translateX on hover.
- **Respect `prefers-reduced-motion`:** video freezes to poster, shimmer animation off.
- **z-index:** video `z-0` < dim overlay `z-1` < content `z-10` < nav `z-50`.
- Verify each task: `npm run build` passes; `npm run test` (lib tests) stays green; visual tasks confirmed with dev server + `/vcheck` + `sloplint`.

---

### Task 1: New dark design system foundation + remove scrub layer

**Files:**
- Replace: `app/globals.css` (entire file → new dark foundation)
- Delete: `app/components/ScrubHero.tsx`, `app/components/LiquidVideoCanvas.tsx`, `app/components/HeroDashboard.tsx`, `app/components/scrubMath.ts`, `app/components/scrubMath.test.ts`
- Modify: `app/page.tsx` (temporary minimal shell so the build passes; full landing lands in Tasks 2–4)

**Interfaces:**
- Produces: CSS custom props `--bg --void --arc --arc-deep --shine --txt --line --r-pill --r-card`; base reset + typography; utility classes `.wrapx` (max-w-7xl container), `.shiny` (hologram text), `.scanline` (divider), `.btn-glass` (dark-glass button).

- [ ] **Step 1: Replace `app/globals.css` with the new foundation**

```css
/* gatherEMR — Dark Cinematic. 블랙 보이드 + 블루 아크 홀로그램. IBM Plex(=NOT Inter). */
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #000000; --void: #06080f;
  --arc: #64CEFB; --arc-deep: #2f6bff; --shine: #ffffff;
  --txt: rgba(255,255,255,.8); --txt-dim: rgba(255,255,255,.55);
  --line: rgba(255,255,255,.14);
  --r-pill: 999px; --r-card: 18px;
}
html, body { max-width: 100vw; }
body {
  min-height: 100vh; background: var(--bg); color: #fff;
  font-family: var(--font-sans), 'Apple SD Gothic Neo', Pretendard, 'Noto Sans KR', sans-serif;
  line-height: 1.6; word-break: keep-all; letter-spacing: -.01em;
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
}
.mono { font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-ligatures: none; }
button { font-family: inherit; cursor: pointer; color: inherit; }
a { color: inherit; text-decoration: none; }

/* max-w-7xl container */
.wrapx { max-width: 80rem; margin: 0 auto; padding: 0 clamp(20px, 4vw, 40px); }

/* ── signature: blue-arc shimmer hologram ── */
.shiny { color: transparent; -webkit-background-clip: text; background-clip: text;
  background-image: linear-gradient(100deg, var(--arc) 42%, var(--shine) 50%, var(--arc) 58%);
  background-size: 250% 100%; animation: shine 3s linear infinite; }
@keyframes shine { to { background-position: -250% 0; } }

/* ── signature: laser scanline divider ── */
.scanline { position: relative; height: 1px; border: 0; margin: clamp(48px,10vh,110px) auto; width: min(80rem, 84vw);
  background: linear-gradient(90deg, transparent, var(--arc-deep) 22%, var(--arc) 50%, var(--arc-deep) 78%, transparent); opacity: .5; }
.scanline::after { content:''; position:absolute; inset:-2px 0; background:inherit; filter:blur(3px); opacity:.6; pointer-events:none; }

/* ── dark-glass button ── */
.btn-glass { display: inline-flex; align-items: center; gap: 10px; font: inherit; font-size: 15px; font-weight: 500;
  color: #fff; border: 1px solid rgba(100,206,251,.35); background: rgba(255,255,255,.07);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border-radius: var(--r-pill);
  padding: 12px 24px; transition: background .2s, border-color .2s, transform .06s; }
.btn-glass:hover { background: rgba(255,255,255,.13); border-color: rgba(100,206,251,.6); }
.btn-glass:active { transform: translateY(1px); }
.btn-glass .arw { transition: transform .2s; }
.btn-glass:hover .arw { transform: translateX(4px); }

@media (prefers-reduced-motion: reduce) {
  .shiny { animation: none; background-position: 0 0; }
  .scanline::after { filter: none; }
}
```

- [ ] **Step 2: Delete the scrub-layer components**

```bash
git rm app/components/ScrubHero.tsx app/components/LiquidVideoCanvas.tsx app/components/HeroDashboard.tsx app/components/scrubMath.ts app/components/scrubMath.test.ts
```

- [ ] **Step 3: Reduce `app/page.tsx` to a temporary shell**

Replace the ENTIRE contents of `app/page.tsx` with:

```tsx
export default function Landing() {
  return <main className="landing" />;
}
```

(The real hero/sections are added in Tasks 2–4. This makes the build pass now that the scrub imports are gone.)

- [ ] **Step 4: Verify build + tests**

Run: `npm run build`
Expected: succeeds (no missing-import errors; scrub components gone; page.tsx references nothing deleted).

Run: `npm run test`
Expected: lib/vitest tests still pass (the deleted `scrubMath.test.ts` is gone; remaining suites green).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/page.tsx
git commit -m "feat(rebuild): new dark design-system foundation; remove scrub layer"
```

---

### Task 2: ShinyText + HeroNav components

**Files:**
- Create: `app/components/ShinyText.tsx`, `app/components/HeroNav.tsx`
- Modify: `app/globals.css` (append nav CSS)

**Interfaces:**
- Consumes: `.shiny`, `.wrapx`, `.btn-glass` from Task 1.
- Produces: `ShinyText({ children }: { children: React.ReactNode })` → `<span className="shiny">`. `HeroNav()` → fixed top nav (logo + pill links + mobile hamburger toggling a simple menu).

- [ ] **Step 1: Create `ShinyText.tsx`**

```tsx
export function ShinyText({ children }: { children: React.ReactNode }) {
  return <span className="shiny">{children}</span>;
}
```

- [ ] **Step 2: Create `HeroNav.tsx`**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

const ARROW = (
  <svg className="arw" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function HeroNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="wrapx nav-in">
        <a href="#top" className="nav-logo">
          <span className="nav-mark" aria-hidden="true"><i /></span>
          <span className="nav-brand">gatherEMR</span>
        </a>
        <nav className="nav-pill" aria-label="주요">
          <a href="#specialties" className="nav-link">25개 분과</a>
          <Link href="/app" className="nav-link nav-cta">시작하기 {ARROW}</Link>
        </nav>
        <button className="nav-burger" aria-label="메뉴" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span />
        </button>
      </div>
      {open && (
        <div className="nav-menu">
          <a href="#specialties" onClick={() => setOpen(false)}>25개 분과</a>
          <Link href="/app" onClick={() => setOpen(false)}>시작하기 →</Link>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Append nav CSS to `app/globals.css`**

```css
/* ── Hero nav ── */
.nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50; padding-top: 18px; }
.nav-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.nav-logo { display: inline-flex; align-items: center; gap: 10px; }
.nav-mark { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #fff; display: grid; place-items: center; }
.nav-mark i { width: 9px; height: 9px; border-radius: 50%; background: #fff; display: block; }
.nav-brand { font-weight: 600; font-size: 16px; letter-spacing: -.02em; }
.nav-pill { display: flex; align-items: center; gap: 4px; border: 1px solid var(--line); border-radius: var(--r-pill);
  background: rgba(255,255,255,.04); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); padding: 6px 8px; }
.nav-link { display: inline-flex; align-items: center; gap: 7px; color: var(--txt); font-size: 14px; padding: 8px 16px; border-radius: var(--r-pill); transition: color .15s, background .15s; }
.nav-link:hover { color: #fff; }
.nav-cta { color: #fff; background: rgba(100,206,251,.16); }
.nav-cta:hover { background: rgba(100,206,251,.28); }
.nav-cta .arw { transition: transform .2s; }
.nav-cta:hover .arw { transform: translateX(3px); }
.nav-burger { display: none; flex-direction: column; gap: 5px; padding: 10px; background: none; border: 0; }
.nav-burger span { width: 22px; height: 2px; background: #fff; border-radius: 2px; }
.nav-menu { display: flex; flex-direction: column; gap: 6px; margin: 12px clamp(20px,4vw,40px) 0; padding: 14px; border: 1px solid var(--line); border-radius: var(--r-card); background: rgba(6,8,15,.9); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.nav-menu a { color: var(--txt); font-size: 16px; padding: 10px 8px; }
.nav-menu a:hover { color: #fff; }
@media (max-width: 1023px) { .nav-pill { display: none; } .nav-burger { display: flex; } }
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds. (Components compile; not yet rendered on the page — wired in Task 3.)

- [ ] **Step 5: Commit**

```bash
git add app/components/ShinyText.tsx app/components/HeroNav.tsx app/globals.css
git commit -m "feat(rebuild): ShinyText + HeroNav (logo, pill links, mobile menu)"
```

---

### Task 3: HeroVideo + HeroCenter — assemble the hero

**Files:**
- Create: `app/components/HeroVideo.tsx`, `app/components/HeroCenter.tsx`
- Modify: `app/page.tsx` (render nav + hero), `app/globals.css` (append hero CSS)

**Interfaces:**
- Consumes: `HeroNav`, `ShinyText`, `.wrapx`, `.btn-glass`, `.shiny`.
- Produces: `HeroVideo()` (fixed blur/dim autoplay bg video). `HeroCenter()` (top two-column value/stat + eyebrow + statement headline + CTA).

- [ ] **Step 1: Create `HeroVideo.tsx`**

```tsx
export function HeroVideo() {
  return (
    <div className="herovid" aria-hidden="true">
      <video className="herovid-el" autoPlay loop muted playsInline poster="/hero-flipscan-poster.jpg">
        <source src="/hero-flipscan.mp4" type="video/mp4" />
      </video>
      <div className="herovid-dim" />
    </div>
  );
}
```

- [ ] **Step 2: Create `HeroCenter.tsx`**

```tsx
import Link from 'next/link';
import { ShinyText } from './ShinyText';

const ARROW = (
  <svg className="arw" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function HeroCenter() {
  return (
    <div className="wrapx hero-in">
      <div className="hero-top">
        <p className="hero-lead">긴 응급 차트에서, 당신 분과가 가장 먼저 봐야 할 것만 — 근거 인용과 함께 남깁니다.</p>
        <p className="hero-stat">4,200자 → 핵심 12문장 · 근거 없는 문장 0</p>
      </div>
      <div className="hero-center">
        <p className="hero-eyebrow mono">교육·연구용 비식별 EMR 요약</p>
        <h1 className="hero-h1">진료차트를 요약하여 분과별 환자의 <ShinyText>핵심만</ShinyText> 파악합니다.</h1>
        <Link href="/app" className="btn-glass hero-cta">차트 넣어보기 {ARROW}</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire the hero into `app/page.tsx`**

```tsx
import { HeroNav } from './components/HeroNav';
import { HeroVideo } from './components/HeroVideo';
import { HeroCenter } from './components/HeroCenter';

export default function Landing() {
  return (
    <main className="landing" id="top">
      <section className="hero">
        <HeroVideo />
        <HeroNav />
        <HeroCenter />
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Append hero CSS to `app/globals.css`**

```css
/* ── Hero ── */
.hero { position: relative; min-height: 100svh; display: flex; overflow: clip; background: var(--bg); }
.herovid { position: absolute; inset: 0; z-index: 0; }
.herovid-el { width: 100%; height: 100%; object-fit: cover; filter: blur(14px) brightness(.45) saturate(1.1); transform: scale(1.08); }
.herovid-dim { position: absolute; inset: 0; background:
  radial-gradient(120% 90% at 50% 42%, transparent 0%, rgba(0,0,0,.55) 70%),
  linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.35) 40%, rgba(0,0,0,.75)); }
@media (prefers-reduced-motion: reduce) { .herovid-el { filter: blur(14px) brightness(.45); } }

.hero-in { position: relative; z-index: 10; width: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 128px 0 clamp(48px,8vh,88px); min-height: 100svh; }
.hero-top { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.hero-lead { color: var(--txt); max-width: 34ch; font-size: 14px; }
.hero-stat { color: var(--txt); text-align: right; font-size: 14px; margin-left: auto; }
@media (min-width: 768px) { .hero-lead, .hero-stat { font-size: 16px; } }
.hero-center { max-width: 20ch; }
.hero-eyebrow { text-transform: uppercase; letter-spacing: .16em; color: var(--txt); font-size: 12px; margin-bottom: 18px; }
@media (min-width: 768px) { .hero-eyebrow { font-size: 14px; } }
.hero-h1 { font-weight: 500; letter-spacing: -.03em; line-height: 1.12; color: #fff;
  font-size: clamp(30px, 6vw, 72px); max-width: 22ch; }
.hero-cta { margin-top: 34px; padding: 14px 30px; font-size: 16px; }
@media (max-width: 640px) { .hero-top { flex-direction: column; } .hero-stat { text-align: left; margin-left: 0; } }
```

- [ ] **Step 5: Verify build + visual**

Run: `npm run build` → succeeds.
(Controller will run `/vcheck` on the dev server: confirm blurred/dimmed video bg, centered statement headline with "핵심만" shimmering blue→white, dark-glass CTA, nav. No horizontal overflow.)

- [ ] **Step 6: Commit**

```bash
git add app/components/HeroVideo.tsx app/components/HeroCenter.tsx app/page.tsx app/globals.css
git commit -m "feat(rebuild): dark hero — blur/dim video bg + hologram headline + glass CTA"
```

---

### Task 4: Sections below the hero — specialties, CTA, footer

**Files:**
- Create: `app/components/SpecialtiesSection.tsx`, `app/components/CtaSection.tsx`, `app/components/SiteFooter.tsx`
- Modify: `app/page.tsx` (render them), `app/globals.css` (append sections CSS)

**Interfaces:**
- Consumes: `GROUPS`, `SPECIALTIES` from `@/lib/specialties`; `.wrapx`, `.scanline`, `.btn-glass`.
- Produces: three section components rendered after the hero.

- [ ] **Step 1: Create `SpecialtiesSection.tsx`**

```tsx
import Link from 'next/link';
import { GROUPS, SPECIALTIES } from '@/lib/specialties';

export function SpecialtiesSection() {
  return (
    <section id="specialties" className="sec">
      <div className="wrapx">
        <h2 className="sec-h2">25개 분과별로, 그 분과가 가장 먼저 보는 주제 중심으로 정리합니다.</h2>
        <div className="grp-list">
          {GROUPS.map((gr) => (
            <div key={gr.id} className="grp" style={{ ['--c' as string]: gr.color } as React.CSSProperties}>
              <span className="grp-name">{gr.label}</span>
              <span className="grp-chips">
                {SPECIALTIES.filter((s) => s.group === gr.id).map((s) => (
                  <Link key={s.id} href="/app" className="grp-chip">{s.name}</Link>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `CtaSection.tsx`**

```tsx
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="sec cta-sec">
      <div className="wrapx cta-in">
        <h2 className="cta-h2">지금 차트 하나<br />넣어보세요.</h2>
        <Link href="/app" className="btn-glass cta-btn">시작하기 →</Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `SiteFooter.tsx`**

```tsx
export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrapx">
        <span>교육·연구 참고용 — 진료 판단을 대체하지 않으며, 식별정보가 있는 차트는 업로드 전 확인 단계에서 가려집니다.</span>
        <span>© 2026 gatherEMR</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Render sections in `app/page.tsx`**

Add imports and place after the hero `</section>`:

```tsx
import { SpecialtiesSection } from './components/SpecialtiesSection';
import { CtaSection } from './components/CtaSection';
import { SiteFooter } from './components/SiteFooter';
```

```tsx
      <hr className="scanline" />
      <SpecialtiesSection />
      <hr className="scanline" />
      <CtaSection />
      <SiteFooter />
```

- [ ] **Step 5: Append sections CSS to `app/globals.css`**

```css
/* ── sections (dark) ── */
.sec { padding: clamp(40px,8vh,96px) 0; }
.sec-h2 { font-size: clamp(20px,2.6vw,30px); font-weight: 500; line-height: 1.42; letter-spacing: -.02em; color: #fff; margin-bottom: 40px; max-width: 30ch; }
.grp-list { display: flex; flex-direction: column; gap: 22px; }
.grp { display: flex; gap: 18px; align-items: baseline; flex-wrap: wrap; }
.grp-name { flex: 0 0 150px; font-weight: 600; font-size: 14px; color: var(--c); }
.grp-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.grp-chip { color: var(--txt); font-size: 14px; border: 1px solid var(--line); background: rgba(255,255,255,.03); border-radius: var(--r-pill); padding: 9px 16px; transition: color .15s, border-color .15s, background .15s; }
.grp-chip:hover { color: #fff; border-color: color-mix(in srgb, var(--c) 60%, var(--line)); background: color-mix(in srgb, var(--c) 12%, transparent); }
.cta-sec { text-align: center; }
.cta-in { display: flex; flex-direction: column; align-items: center; gap: 26px; }
.cta-h2 { font-size: clamp(28px,5vw,52px); font-weight: 500; letter-spacing: -.03em; line-height: 1.05; color: #fff; }
.cta-btn { font-size: 16px; padding: 14px 30px; }
.site-foot { border-top: 1px solid var(--line); padding: 34px 0; margin-top: 40px; }
.site-foot .wrapx { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--txt-dim); }
@media (max-width: 760px) { .grp-name { flex-basis: 100%; } }
```

- [ ] **Step 6: Verify build + visual**

Run: `npm run build` → succeeds.
(Controller `/vcheck`: dark sections, scanline dividers, specialty chips with per-group accent, CTA, footer. No overflow.)

- [ ] **Step 7: Commit**

```bash
git add app/components/SpecialtiesSection.tsx app/components/CtaSection.tsx app/components/SiteFooter.tsx app/page.tsx app/globals.css
git commit -m "feat(rebuild): dark specialties / CTA / footer sections"
```

---

### Task 5: Re-skin /app for the dark system (logic preserved)

**Files:**
- Modify: `app/app/page.tsx` (class names / wrapper only — NOT logic/state/fetch), `app/globals.css` (append /app dark skin)
- Modify: `app/components/SpecialtyPicker.tsx`, `app/components/ChartLens.tsx` (class-level skin only if needed — keep behavior)

**Interfaces:**
- Consumes: new tokens. Produces: dark, readable /app screens using the SAME class names the JSX already uses (`.wrap`, `.sheet`, `.choice`, `.picker`, `.sec-head`, `.chip`, `.pane`, `.item`, `.badge`, `.ta`, `.btn`, etc.), restyled for dark.

- [ ] **Step 1: Wrap /app in the dark shell**

In `app/app/page.tsx`, change the root `<main className="appshell">` (existing) so it stays, and confirm the wrapper. If it currently reads `<main className="appshell">`, keep it. (No logic changes anywhere in this file.)

- [ ] **Step 2: Append the /app dark skin to `app/globals.css`**

Provide dark styles for every class the /app JSX uses. Paste this block:

```css
/* ── /app dark skin (logic unchanged; readable dark cards) ── */
.appshell { min-height: 100vh; background:
  radial-gradient(1100px 640px at 50% -8%, rgba(47,107,255,.14), transparent 62%), var(--void); }
.appshell .wrap { max-width: 1120px; margin: 0 auto; padding: 96px 22px 40px; position: relative; z-index: 1; }
.appshell .top { position: sticky; top: 12px; z-index: 40; }
.appshell .brand { font-weight: 700; letter-spacing: -.03em; font-size: 16px; color: #fff; }
.appshell .crumb { color: var(--txt-dim); font-size: 12.5px; }
.appshell .crumb b { color: #fff; }
/* content cards */
.appshell .sheet, .appshell .pane, .appshell .picker .sec, .appshell .preview-box, .appshell textarea.ta {
  background: rgba(255,255,255,.05); border: 1px solid var(--line); border-radius: var(--r-card);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); color: rgba(255,255,255,.9); }
.appshell .sheet { padding: clamp(24px,4.5vw,40px); margin-top: 22px; }
.appshell h1.q { font-size: clamp(26px,4vw,34px); font-weight: 600; letter-spacing: -.03em; color: #fff; margin-bottom: 8px; }
.appshell p.sub { color: var(--txt); font-size: 15px; margin-bottom: 22px; }
.appshell .back { background: none; border: 0; color: var(--txt-dim); font-size: 13px; padding-bottom: 14px; }
.appshell .back:hover { color: #fff; }
.appshell textarea.ta { width: 100%; height: 230px; padding: 14px; font-size: 13.5px; line-height: 1.65; resize: vertical; }
.appshell textarea.ta:focus { outline: none; border-color: var(--arc); }
.appshell .btn { padding: 14px 26px; border-radius: var(--r-pill); border: 0; background: #fff; color: #000; font-weight: 600; font-size: 14px; }
.appshell .btn:hover:not(:disabled) { opacity: .9; }
.appshell .btn:disabled { opacity: .4; }
.appshell .btn.ghost { background: rgba(255,255,255,.07); color: #fff; border: 1px solid var(--line); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.appshell .chip, .appshell .sec-body .chip { border: 1px solid var(--line); background: rgba(255,255,255,.04); color: var(--txt); border-radius: var(--r-pill); padding: 10px 16px; font-size: 14px; }
.appshell .chip.on, .appshell .sec-body .chip.on, .appshell .chip:hover { border-color: var(--arc); color: #fff; background: rgba(100,206,251,.12); }
.appshell .picker { display: flex; flex-direction: column; gap: 10px; }
.appshell .sec-head { width: 100%; display: flex; align-items: center; gap: 12px; padding: 18px 20px; background: none; border: 0; }
.appshell .sec-head .bar { width: 4px; height: 22px; border-radius: 3px; background: var(--c); }
.appshell .sec-head .nm { font-weight: 700; font-size: 17px; color: #fff; }
.appshell .sec-head .cn { background: color-mix(in srgb, var(--c) 22%, transparent); color: var(--c); font-weight: 600; font-size: 12px; border-radius: var(--r-pill); padding: 2px 10px; }
.appshell .sec-head .chev { margin-left: auto; color: var(--txt-dim); font-size: 12px; transition: transform .28s; }
.appshell .picker .sec.open .chev { transform: rotate(180deg); color: var(--c); }
.appshell .sec-body { display: flex; flex-wrap: wrap; gap: 9px; padding: 2px 20px 20px; }
.appshell .im-subs { width: 100%; display: flex; flex-wrap: wrap; gap: 6px; background: rgba(255,255,255,.04); border-radius: 12px; padding: 11px 12px; }
.appshell .im-subs .sub { border: 1px solid var(--line); background: transparent; color: var(--txt); font-size: 12px; border-radius: var(--r-pill); padding: 6px 12px; }
.appshell .im-subs .sub:hover { border-color: var(--arc); color: #fff; }
.appshell .im-label { width: 100%; font-size: 11px; font-weight: 600; color: var(--txt-dim); }
/* result split */
.appshell .split { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
.appshell .pane { padding: 24px; max-height: 76vh; overflow: auto; }
.appshell .pane.right { position: sticky; top: 86px; }
.appshell .pane h3 { font-size: 11px; color: var(--txt-dim); letter-spacing: .08em; text-transform: uppercase; font-weight: 600; margin-bottom: 10px; }
.appshell .pane .orig { white-space: pre-wrap; font-size: 12.5px; line-height: 1.75; color: rgba(255,255,255,.75); }
.appshell .result-head { color: var(--txt); }
.appshell .result-head b { color: #fff; }
.appshell .blk-title { font-size: 11px; font-weight: 600; letter-spacing: .07em; color: var(--txt-dim); text-transform: uppercase; margin: 16px 0 5px; }
.appshell .item { display: block; width: 100%; text-align: left; border: 0; background: none; border-left: 2px solid transparent; padding: 6px 11px; border-radius: 8px; margin-bottom: 2px; font-size: 14px; color: rgba(255,255,255,.9); }
.appshell .item:hover { background: rgba(255,255,255,.05); }
.appshell .item.on { background: rgba(100,206,251,.12); border-left-color: var(--arc); }
.appshell mark { background: rgba(100,206,251,.28); color: #fff; border-radius: 2px; padding: 0 1px; }
/* badges */
.appshell .badge { font-size: 10.5px; font-weight: 600; padding: 1px 7px; border-radius: var(--r-pill); }
.appshell .badge.explicit { color: #7ef0c2; background: rgba(10,125,85,.25); }
.appshell .badge.derived { color: #ffd27a; background: rgba(138,90,0,.28); }
.appshell .badge.uncertain { color: #ff9a90; background: rgba(196,52,43,.28); }
.appshell .warn { border: 1px solid rgba(196,52,43,.4); background: rgba(196,52,43,.12); border-radius: 12px; padding: 10px 12px; margin-bottom: 12px; }
.appshell .warn .blk-title { color: #ff9a90; margin-top: 0; }
.appshell .alert { color: #ff9a90; background: rgba(196,52,43,.15); border: 1px solid rgba(196,52,43,.4); border-radius: 8px; padding: 9px 13px; margin: 14px 0; font-size: 13px; }
.appshell .lintbar { font-size: 12px; color: #ffd27a; background: rgba(138,90,0,.18); border: 1px solid rgba(138,90,0,.4); border-radius: 8px; padding: 7px 11px; margin-bottom: 12px; }
.appshell .consent { display: flex; gap: 9px; align-items: flex-start; font-size: 13px; color: var(--txt-dim); margin: 14px 0; }
.appshell .ev { margin-top: 14px; border-top: 1px solid var(--line); padding-top: 12px; font-size: 13px; color: var(--txt); }
.appshell .ev b { color: var(--txt-dim); }
.appshell .hint-lens { font-size: 12px; color: var(--txt-dim); margin-top: 8px; }
.appshell details.oneline summary { cursor: pointer; color: var(--arc); font-size: 13px; margin: 8px 0; }
.appshell details.oneline input { width: 100%; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; font-size: 13px; background: rgba(255,255,255,.05); color: #fff; }
@media (max-width: 760px) { .appshell .split { grid-template-columns: 1fr; } .appshell .pane.right { position: static; } }
```

- [ ] **Step 3: Verify build + /app functional integrity**

Run: `npm run build` → succeeds.
Run: `npm run test` → lib tests green.
(Controller drives /app in the browser: pick a specialty → 샘플 채우기 → 비식별 확인 → 요약. Confirm the FLOW still works end-to-end — logic untouched — and reads well on dark. `/vcheck http://localhost:PORT/app`.)

- [ ] **Step 4: Commit**

```bash
git add app/app/page.tsx app/globals.css app/components/SpecialtyPicker.tsx app/components/ChartLens.tsx
git commit -m "feat(rebuild): dark skin for /app (logic preserved)"
```

---

### Task 6: Verification pass

**Files:** none (verification). Fix-forward into the relevant task's files if a check fails.

- [ ] **Step 1: Build + tests**

Run: `npm run build` → succeeds. `npm run test` → green.

- [ ] **Step 2: Anti-slop lint**

Start dev server, then: `node ~/.claude/tools/headless/sloplint.mjs http://localhost:PORT/`
Expected: no default-convergence flags (no Inter, no purple, no uniform-radius slop). Rework any true positive.

- [ ] **Step 3: Visual (desktop + mobile), landing + /app**

`/vcheck http://localhost:PORT/` and `/vcheck http://localhost:PORT/app`
Expected: no horizontal overflow, no console errors; hologram shimmer animates on "핵심만"; video is blurred/dimmed with legible centered headline; /app dark cards readable.

- [ ] **Step 4: Reduced-motion + functional**

Emulate `prefers-reduced-motion: reduce`: video static (poster), shimmer static. Drive /app pick→input→preview→result to confirm no functional regression.

- [ ] **Step 5: Commit (if fixes made)**

```bash
git add -A
git commit -m "fix(rebuild): dark cinematic verification fixes"
```

---

## Self-Review

**Spec coverage:** §2 keep/rebuild boundary → T1 (delete scrub, replace globals.css) + T5 (/app skin, logic preserved); §3 tokens/fonts/signature → T1; §4 stack (no deps, CSS shimmer, inline SVG) → T1–T3; §5.1 video blur/dim → T3; §5.2 nav → T2; §5.3 two-column → T3; §5.4 headline+CTA → T3; §5.5 ShinyText → T1(css)+T2(component)+T3(usage); §6 sections → T4; §7 /app re-skin → T5; §10 verification → T6. All mapped.

**Placeholders:** none — every step has real CSS/TSX. `PORT` in T6 is an environment value the controller fills (dev server port), not a code placeholder.

**Type consistency:** `ShinyText({children})` defined T2, used T3. Class names (`.wrapx`, `.shiny`, `.scanline`, `.btn-glass`, `.hero*`, `.nav*`, `.sec*`, `.grp*`, `.appshell *`) consistent across CSS and TSX. `HeroNav`/`HeroVideo`/`HeroCenter`/`SpecialtiesSection`/`CtaSection`/`SiteFooter` component names consistent between creation and page.tsx imports.
