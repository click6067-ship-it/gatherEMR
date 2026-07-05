'use client';
import { useEffect, useState } from 'react';
import { HeroNav } from './components/HeroNav';
import { HeroVideo } from './components/HeroVideo';
import { HeroCenter } from './components/HeroCenter';
import { SpecialtiesSection } from './components/SpecialtiesSection';
import { CtaSection } from './components/CtaSection';
import { SiteFooter } from './components/SiteFooter';
import { MuxBg } from './components/MuxBg';

// TEMPORARY compare build: two background treatments for the new Mux clip, toggled live.
//  - 'sections' : Mux plays behind the specialties + CTA block; hero keeps its flipscan.
//  - 'page'     : Mux is a full-page fixed background (hero included, flipscan replaced).
// Initialised from ?bg=sections|page so either is shareable / screenshot-able.
type BgMode = 'sections' | 'page';

export default function Landing() {
  const [mode, setMode] = useState<BgMode>('sections');

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('bg');
    if (q === 'page' || q === 'sections') setMode(q);
  }, []);

  function pick(m: BgMode) {
    setMode(m);
    const u = new URL(location.href);
    u.searchParams.set('bg', m);
    history.replaceState(null, '', u);
  }

  return (
    <main className={`landing bg-${mode}`} id="top">
      {mode === 'page' && (
        <div className="muxbg muxbg-page" aria-hidden="true">
          <MuxBg className="muxbg-el" />
          <div className="muxbg-dim" />
        </div>
      )}

      <section className="hero">
        {mode === 'sections' && <HeroVideo />}
        <HeroNav />
        <HeroCenter />
      </section>

      <hr className="scanline" />

      <div className="secwrap">
        {mode === 'sections' && (
          <div className="muxbg muxbg-sec" aria-hidden="true">
            <MuxBg className="muxbg-el" />
            <div className="muxbg-dim" />
          </div>
        )}
        <SpecialtiesSection />
        <hr className="scanline" />
        <CtaSection />
      </div>

      <SiteFooter />

      <div className="bgcompare" role="group" aria-label="배경 비교">
        <span className="bgcompare-label">배경</span>
        <button className={mode === 'sections' ? 'on' : ''} onClick={() => pick('sections')}>섹션만</button>
        <button className={mode === 'page' ? 'on' : ''} onClick={() => pick('page')}>전체</button>
      </div>
    </main>
  );
}
