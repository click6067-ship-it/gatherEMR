'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SpecialtyPicker, type Picked } from './SpecialtyPicker';
import { MuxBg } from './MuxBg';

// Fullscreen "start" drawer: opened by any StartButton / nav CTA (via the gemr:open-start
// event), spreads open to fill the screen and shows the specialty picker. Choosing a
// specialty deep-links into /app (?s=&sub=), reusing the app's existing entry flow.
export function StartDrawer() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent).detail as { x?: number; y?: number } | undefined;
      setOrigin(
        d && typeof d.x === 'number' && typeof d.y === 'number'
          ? { x: d.x, y: d.y }
          : { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      );
      setOpen(true);
    };
    window.addEventListener('gemr:open-start', onOpen);
    return () => window.removeEventListener('gemr:open-start', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function onPick(p: Picked) {
    const params = new URLSearchParams({ s: p.specialty.id });
    if (p.sub) params.set('sub', p.sub.id);
    setOpen(false);
    router.push(`/app?${params.toString()}`);
  }

  return (
    <div
      className={`startdrawer${open ? ' open' : ''}`}
      aria-hidden={!open}
      style={{ ['--ox' as string]: `${origin.x}px`, ['--oy' as string]: `${origin.y}px` } as React.CSSProperties}
    >
      <div className="startdrawer-scrim" onClick={() => setOpen(false)} />
      {open && (
        <div className="startdrawer-bg" aria-hidden="true">
          <MuxBg className="startdrawer-video" />
          <div className="startdrawer-bgdim" />
        </div>
      )}
      <span className="startdrawer-blob echo" aria-hidden="true" />
      <span className="startdrawer-blob ink" aria-hidden="true" />
      <div className="startdrawer-panel appshell" role="dialog" aria-modal="true" aria-label="분과 선택">
        <button className="startdrawer-x" onClick={() => setOpen(false)} aria-label="닫기">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="startdrawer-in">
          <p className="startdrawer-eyebrow mono">차트 넣어보기</p>
          <h2 className="startdrawer-h2">어느 분과세요?</h2>
          <p className="startdrawer-sub">분과를 고르면 그 분과 관점으로 차트를 요약합니다.</p>
          {open && <SpecialtyPicker onPick={onPick} />}
        </div>
      </div>
    </div>
  );
}
