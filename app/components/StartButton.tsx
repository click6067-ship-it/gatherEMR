'use client';
import type { ReactNode } from 'react';

// Opens the fullscreen start drawer. Progressive enhancement: it's a real <a href="/app">,
// so without JS (or on modified/middle click) it just navigates to /app.
export function StartButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a
      href="/app"
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('gemr:open-start'));
      }}
    >
      {children}
    </a>
  );
}
