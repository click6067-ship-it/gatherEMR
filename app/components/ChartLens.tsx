'use client';

import { useRef } from 'react';

/* Reading lens — a highlight band follows the cursor over raw chart text,
 * lighting the line under it. Consistent "the source is scannable" interaction,
 * used wherever de-identified chart text is shown (전송 전 확인 등). */
export function ChartLens({ text, className = '' }: { text: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const lines = text.split('\n');

  function onMove(e: React.PointerEvent) {
    const el = box.current, bd = band.current;
    if (!el || !bd) return;
    const lr = el.getBoundingClientRect();
    const rows = Array.from(el.querySelectorAll<HTMLElement>('.lens-line'));
    let best = 0, bd2 = Infinity;
    rows.forEach((r, i) => {
      const rr = r.getBoundingClientRect();
      const c = rr.top + rr.height / 2 - lr.top + el.scrollTop;
      const d = Math.abs(e.clientY - lr.top + el.scrollTop - c);
      if (d < bd2) { bd2 = d; best = i; }
    });
    rows.forEach((r, i) => r.classList.toggle('lit', i === best));
    const rr = rows[best].getBoundingClientRect();
    bd.style.height = rr.height + 'px';
    bd.style.transform = `translateY(${rr.top - lr.top + el.scrollTop}px)`;
  }

  return (
    <div ref={box} className={`lens mono ${className}`} onPointerMove={onMove}>
      <div ref={band} className="band" aria-hidden="true" />
      {lines.map((l, i) => (
        <div key={i} className="lens-line">{l || ' '}</div>
      ))}
    </div>
  );
}
