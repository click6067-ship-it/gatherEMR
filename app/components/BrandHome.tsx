import Link from 'next/link';

// Persistent home-brand: fixed top-left on EVERY page (landing, /app, …), aligned to
// the same 80rem container edge so its position never shifts between routes. Acts as a
// home button — clicking returns to the landing.
export function BrandHome() {
  return (
    <div className="brandhome">
      <div className="brandhome-in">
        <Link href="/" className="nav-logo" aria-label="gatherEMR 홈">
          <span className="nav-mark" aria-hidden="true"><i /></span>
          <span className="nav-brand">gatherEMR</span>
        </Link>
      </div>
    </div>
  );
}
