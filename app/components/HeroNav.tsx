'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const ARROW = (
  <svg className="arw" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function openStart(e: React.MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent('gemr:open-start', { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }),
  );
}

export function HeroNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="wrapx nav-in">
        {/* logo lives in the global <BrandHome/> (persistent across pages) */}
        <nav className="nav-pill" aria-label="주요">
          <a href="#specialties" className="nav-link">25개 분과</a>
          <Link href="/about" className="nav-link">About us</Link>
          <a href="/app" className="nav-link nav-cta" onClick={openStart}>시작하기 {ARROW}</a>
          <ThemeToggle inpill />
        </nav>
        <button className="nav-burger" aria-label="메뉴" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span />
        </button>
      </div>
      {open && (
        <div className="nav-menu">
          <a href="#specialties" onClick={() => setOpen(false)}>25개 분과</a>
          <Link href="/about" onClick={() => setOpen(false)}>About us</Link>
          <a href="/app" onClick={(e) => { openStart(e); setOpen(false); }}>시작하기 →</a>
        </div>
      )}
    </header>
  );
}
