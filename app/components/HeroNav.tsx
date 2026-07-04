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
