'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/* count-up (Bio-Age pattern: 1.8s, 40 steps) */
function useCountUp(target: number, duration = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let i = 0; const steps = 40;
    const t = setInterval(() => {
      i++; setV(Math.round((target * i) / steps));
      if (i >= steps) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
  }, [target, duration]);
  return v;
}

const TICKS = Array.from({ length: 61 }, (_, i) => i);

export function HeroDashboard() {
  const sentences = useCountUp(12);
  const [snapOpen, setSnapOpen] = useState(false);

  return (
    <div className="ld-dash">
      {/* 좌: 주인공 카드 */}
      <div className="ld-dash-left">
        <div className="ld-main-card ink-glass hv" style={{ ['--hd' as string]: '300ms' } as React.CSSProperties}>
          <div className="ld-main-spin" aria-hidden="true" />
          <div className="ld-main-body">
            <p className="ld-main-kicker hv" style={{ ['--hd' as string]: '600ms' } as React.CSSProperties}>차트는 길다. 봐야 할 것은</p>
            <div className="ld-main-num hv" style={{ ['--hd' as string]: '800ms' } as React.CSSProperties}>
              <span className="mono num">{sentences}</span>
              <span className="unit">문장</span>
            </div>
            <p className="ld-main-sub">3일치 기록 4,200자 → 분과의 눈으로 요약</p>
          </div>
        </div>
        <div className="ld-badge-row hv" style={{ ['--hd' as string]: '1000ms' } as React.CSSProperties}>
          <span className="ld-pill">근거 없는 문장 0</span>
        </div>
        {/* 타임라인 티커 — 차트의 시계가 흐른다 */}
        <div className="ld-ticker hv" style={{ ['--hd' as string]: '1100ms' } as React.CSSProperties} aria-hidden="true">
          <div className="ld-ticker-track">
            {[0, 1].map((set) => (
              <div key={set} className="ld-ticker-set">
                {TICKS.map((i) => (
                  <span key={i} className={`tick${i % 10 === 0 ? ' t10' : i % 5 === 0 ? ' t5' : ''}`} />
                ))}
              </div>
            ))}
          </div>
          <span className="ld-ticker-center" />
          <div className="ld-ticker-times mono"><span>18:42</span><span>19:08</span><span>19:22</span><span>20:46</span><span>21:10</span></div>
        </div>
      </div>

      {/* 우: 보조 카드 4 */}
      <div className="ld-dash-right">
        <Link href="/app" className="ld-info ink-glass hv" style={{ ['--hd' as string]: '500ms' } as React.CSSProperties}>
          <span className="ld-info-title">모든 형식으로</span>
          <span className="ld-info-foot"><span className="mono dim">PDF · 이미지 · HWP · DOCX</span><span className="ld-arrow">→</span></span>
        </Link>
        <Link href="/app" className="ld-info ink-glass hv" style={{ ['--hd' as string]: '650ms' } as React.CSSProperties}>
          <span className="ld-info-title">전송 전 비식별</span>
          <span className="ld-info-foot"><span className="mono dim">홍길동 → ███</span><span className="ld-arrow">→</span></span>
        </Link>
        <button
          className={`ld-info ld-snap${snapOpen ? ' open' : ''}`}
          onMouseEnter={() => setSnapOpen(true)} onMouseLeave={() => setSnapOpen(false)}
          onClick={() => setSnapOpen((o) => !o)}
          style={{ ['--hd' as string]: '800ms' } as React.CSSProperties}
        >
          <span className="ld-info-title">근거 연결</span>
          <span className="ld-snap-body">모든 문장은 원문 인용과 위치를 가집니다. 근거를 찾지 못한 문장은 화면에 나타나지 않습니다 — 확인은 언제나 당신의 눈으로.</span>
          <span className="ld-info-foot"><span className="dim">문장 → 원문 점프</span><span className="ld-arrow">{snapOpen ? '↓' : '↑'}</span></span>
        </button>
        <Link href="/app" className="ld-info ink-glass hv" style={{ ['--hd' as string]: '950ms' } as React.CSSProperties}>
          <span className="ld-info-title">25개 분과 렌즈</span>
          <span className="ld-info-foot"><span className="dim">내과 9세부 포함</span><span className="ld-arrow">→</span></span>
        </Link>
      </div>
    </div>
  );
}
