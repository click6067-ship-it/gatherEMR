'use client';
import { useEffect, useRef } from 'react';
import { lerp } from './scrubMath';

export function LiquidVideoCanvas({ progressRef, poster, srcWebm, srcMp4 }: {
  progressRef: React.MutableRefObject<number>;
  poster: string; srcWebm?: string; srcMp4?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current; if (!video) return;
    // interim poster-only (no video source yet): no 'canplay' will fire, so reveal the still immediately
    if (!srcWebm && !srcMp4) requestAnimationFrame(() => video.classList.add('ready'));
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
  }, [progressRef, srcWebm, srcMp4]);

  return (
    <video ref={videoRef} className="lvc-video" muted playsInline preload="auto" poster={poster} aria-hidden="true">
      {srcMp4 && <source src={srcMp4} type="video/mp4" />}
      {srcWebm && <source src={srcWebm} type="video/webm" />}
    </video>
  );
}
