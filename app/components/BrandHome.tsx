'use client';
import Link from 'next/link';

// Persistent home-brand: fixed top-left on EVERY page, aligned to the same 80rem
// container edge. Acts as the primary home button — clicking returns to the landing
// and closes the start drawer if it's open.
export function BrandHome() {
  return (
    <div className="brandhome">
      <div className="brandhome-in">
        <Link
          href="/"
          className="nav-logo"
          aria-label="gatherEMR 홈"
          onClick={() => window.dispatchEvent(new CustomEvent('gemr:close-start'))}
        >
          <span className="nav-brand">gatherEMR</span>
        </Link>
      </div>
    </div>
  );
}
