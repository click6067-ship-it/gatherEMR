'use client';
import { useEffect } from 'react';

// Site-wide scroll reveal: any element with `.reveal` floats up + un-blurs as it enters
// the viewport. A MutationObserver re-scans the DOM so content mounted later (e.g. the
// /app stage transitions) is caught too. prefers-reduced-motion → reveal instantly.
export function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    const scan = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
