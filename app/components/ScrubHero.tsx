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
