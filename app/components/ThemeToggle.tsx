'use client';
import { useEffect, useState } from 'react';

const SUN = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <line key={a} x1="12" y1="1.5" x2="12" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        transform={`rotate(${a} 12 12)`} />
    ))}
  </svg>
);
const MOON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.8"
      strokeLinejoin="round" />
  </svg>
);

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // sync the icon to the theme the no-flash inline script already applied (one-shot on mount)
    const cur = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(cur);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    try {
      localStorage.setItem('gemr-theme', next);
    } catch {}
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title="테마 전환"
    >
      {theme === 'dark' ? SUN : MOON}
    </button>
  );
}
