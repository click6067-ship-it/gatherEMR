'use client';
import { useEffect, useRef } from 'react';

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) ref.current?.pause();
  }, []);
  return (
    <div className="herovid" aria-hidden="true">
      <video ref={ref} className="herovid-el" autoPlay loop muted playsInline poster="/hero-flipscan-poster.jpg">
        <source src="/hero-flipscan.mp4" type="video/mp4" />
      </video>
      <div className="herovid-dim" />
    </div>
  );
}
