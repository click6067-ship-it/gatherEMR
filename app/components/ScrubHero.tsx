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
  const [scrub, setScrub] = useState(true);

  useEffect(() => {
    const mobile = matchMedia('(max-width: 767px)').matches || (typeof window !== 'undefined' && 'ontouchstart' in window);
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (mobile || rm) setScrub(false);
  }, []);

  useEffect(() => {
    if (!scrub) return;
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
  }, [scrub]);

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
