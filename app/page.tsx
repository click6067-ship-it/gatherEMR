'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GROUPS, SPECIALTIES } from '@/lib/specialties';
import { ScrubHero } from '@/app/components/ScrubHero';

/* Landing — Bio-Age Dashboard 구도 × gatherEMR 색 (사용자 확정 벤치마킹).
 * 히어로 = 영상 위 하단 정렬 잉크-유리 대시보드: 주인공 카드(카운트업) +
 * 타임라인 티커 + 보조 카드 4장(hover 확장 1장). 모션 = 스프링 이징 + 스태거. */

export default function Landing() {
  const [drop, setDrop] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.35 },
    );
    document.querySelectorAll('.ld-io').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = drop ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrop(null);
    addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', onKey); };
  }, [drop]);

  function launch(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setDrop({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }

  return (
    <main className="ld">
      {/* persistent MENU fab — 드로어 열림/닫힘 무관 같은 자리. 닫힘=primary·열림=ghost(눌린) */}
      <button
        className={`menu-fab${drop ? ' open' : ''}`}
        aria-expanded={!!drop}
        onClick={(e) => (drop ? setDrop(null) : launch(e))}
      >
        <span className={drop ? 'x' : 'bars'} aria-hidden="true" />
        {drop ? 'CLOSE' : 'MENU'}
      </button>

      {/* top nav — EVR 구도: 중앙 goldentime · 우 ABOUT US/GET STARTED */}
      <nav className="gnav">
        <span className="gnav-brand">goldentime</span>
        <span className="gnav-right">
          <a href="#specialties" className="navpill">ABOUT US</a>
          <Link href="/app" className="navpill cta"><span>GET STARTED</span></Link>
        </span>
      </nav>

      {/* 확산 → 분과 전환 오버레이 (화이트 드로어) */}
      {drop && (
        <div className="drop-overlay" style={{ ['--ox' as string]: `${drop.x}px`, ['--oy' as string]: `${drop.y}px` } as React.CSSProperties}>
          <div className="drop-blob b2" aria-hidden="true" />
          <div className="drop-blob b1" aria-hidden="true" />
          <div className="drop-panel" role="dialog" aria-label="메뉴">
            <div className="drop-head">
              <span className="drop-brand">goldentime</span>
            </div>
            <nav className="drop-rows">
              <Link href="/app" className="drop-row" style={{ ['--dd' as string]: '380ms' } as React.CSSProperties}><span>시작하기</span><span className="drop-arr">→</span></Link>
              <a href="#specialties" className="drop-row" onClick={() => setDrop(null)} style={{ ['--dd' as string]: '540ms' } as React.CSSProperties}><span>25개 분과</span><span className="drop-arr">→</span></a>
            </nav>
            <div className="drop-groups">
              <span className="drop-sub">분과 바로 선택</span>
              {GROUPS.map((gr, gi) => (
                <div key={gr.id} className="drop-group" style={{ ['--c' as string]: gr.color, ['--dd' as string]: `${640 + gi * 80}ms` } as React.CSSProperties}>
                  <span className="drop-group-name">{gr.label}</span>
                  <span className="drop-chips">
                    {SPECIALTIES.filter((s) => s.group === gr.id).map((s) => (
                      <Link key={s.id} href={`/app?s=${s.id}`} className="drop-chip">{s.name}</Link>
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <footer className="drop-foot"><span>GATHEREMR — 비식별 EMR 분과별 요약</span><span>© 2026</span></footer>
          </div>
        </div>
      )}

      {/* S0 — hero: 핀 스크럽 — 영상 스크럽 + 카피 비트 + 페이오프 대시보드 */}
      <ScrubHero />

      {/* S3 — 25분과 */}
      <section id="specialties" className="ld-s3 ld-io">
        <h2 className="ld-h2 ld-h2-lead ink">25개 분과별로, 그 분과가 가장 먼저 보는 주제 중심으로 정리합니다.</h2>
        <div className="ld-groups">
          {GROUPS.map((gr, gi) => (
            <div key={gr.id} className="ld-group" style={{ ['--c' as string]: gr.color, ['--d' as string]: `${gi * 120}ms` } as React.CSSProperties}>
              <span className="ld-group-name">{gr.label}</span>
              <span className="ld-group-chips">
                {SPECIALTIES.filter((s) => s.group === gr.id).map((s, i) => (
                  <Link key={s.id} href="/app" className="ld-chip" style={{ ['--d' as string]: `${gi * 120 + i * 40}ms` } as React.CSSProperties}>{s.name}</Link>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <hr className="scanline" />

      {/* S5 — CTA */}
      <section className="ld-s5 ld-io">
        <div className="sheet ld-cta-sheet">
          <h2 className="ld-h2 ink">지금 차트 하나<br />넣어보세요.</h2>
          <Link href="/app" className="btn ld-cta">시작하기 →</Link>
        </div>
        <footer className="ld-foot">
          <span>교육·연구 참고용 — 진료 판단을 대체하지 않으며, 식별정보가 있는 차트는 업로드 전 확인 단계에서 가려집니다.</span>
          <span>© 2026 gatherEMR</span>
        </footer>
      </section>
    </main>
  );
}
