'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GROUPS, SPECIALTIES } from '@/lib/specialties';

/* Landing — Bio-Age Dashboard 구도 × gatherEMR 색 (사용자 확정 벤치마킹).
 * 히어로 = 영상 위 하단 정렬 잉크-유리 대시보드: 주인공 카드(카운트업) +
 * 타임라인 티커 + 보조 카드 4장(hover 확장 1장). 모션 = 스프링 이징 + 스태거. */

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

export default function Landing() {
  const sentences = useCountUp(12);
  const [snapOpen, setSnapOpen] = useState(false);
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
      {/* floating ink-glass nav — 좌측 물방울 런처 */}
      <nav className="gnav">
        <button className="droplet" onClick={launch}>시작하기</button>
        <span className="brand">gatherEMR</span>
        <span className="links">
          <a href="#demo">데모</a>
          <a href="#specialties">26분과</a>
        </span>
      </nav>

      {/* 물방울 확산 → 분과 전환 오버레이 */}
      {drop && (
        <div className="drop-overlay" style={{ ['--ox' as string]: `${drop.x}px`, ['--oy' as string]: `${drop.y}px` } as React.CSSProperties}>
          <div className="drop-blob b2" aria-hidden="true" />
          <div className="drop-blob b1" aria-hidden="true" />
          <div className="drop-panel" role="dialog" aria-label="분과 선택">
            <button className="drop-close" onClick={() => setDrop(null)}>✕ 닫기</button>
            <h2 className="drop-title">어느 분과세요?</h2>
            <div className="drop-groups">
              {GROUPS.map((gr, gi) => (
                <div key={gr.id} className="drop-group" style={{ ['--c' as string]: gr.color, ['--dd' as string]: `${420 + gi * 90}ms` } as React.CSSProperties}>
                  <span className="drop-group-name">{gr.label}</span>
                  <span className="drop-chips">
                    {SPECIALTIES.filter((s) => s.group === gr.id).map((s) => (
                      <Link key={s.id} href={`/app?s=${s.id}`} className="drop-chip">{s.name}</Link>
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/app" className="drop-direct">분과는 이따 고를게요 — 바로 시작 →</Link>
          </div>
        </div>
      )}

      {/* S0 — hero: 영상 위 잉크-유리 대시보드 (Bio-Age 구도) */}
      <section className="ld-hero">
        <video className="ld-video" autoPlay muted loop playsInline poster="/hero-poster.jpg" aria-hidden="true">
          <source src="/hero-mood.webm" type="video/webm" />
        </video>

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
              <span className="ld-info-title">26개 분과 렌즈</span>
              <span className="ld-info-foot"><span className="dim">내과 9세부 포함</span><span className="ld-arrow">→</span></span>
            </Link>
          </div>
        </div>
      </section>

      {/* S2 — 해법 = 데모: 문장 → 원문 연결선 */}
      <section id="demo" className="ld-s2 ld-io">
        <h2 className="ld-h2 ink">분과를 고르면,<br />그 분과의 눈으로.</h2>
        <div className="sheet ld-demo-sheet">
        <div className="ld-demo">
          <div className="ld-demo-pane">
            <div className="ld-demo-label">순환기내과 요약</div>
            <div className="ld-demo-item on"><span className="badge derived">추론</span> Troponin 0.8 → 2.1 상승, r/o NSTEMI</div>
            <div className="ld-demo-item"><span className="badge uncertain">불확실</span> warfarin 복용 여부 불명 (INR 1.7)</div>
            <div className="ld-demo-item"><span className="badge explicit">원문</span> EKG no STEMI criteria, QTc 458</div>
          </div>
          <svg className="ld-wire" viewBox="0 0 120 80" aria-hidden="true">
            <path d="M4,18 C 50,18 70,52 116,52" fill="none" />
            <circle cx="116" cy="52" r="3" />
          </svg>
          <div className="ld-demo-pane mono ld-demo-src">
            <div className="ld-demo-label">비식별 원문</div>
            [Lab 19:22] Troponin-I 0.8{'\n'}
            <mark>[Lab 20:46] Troponin-I 2.1</mark>{'\n'}
            Cr 1.8 · eGFR 38 · K 5.1 · INR 1.7
          </div>
        </div>
        <p className="ld-sub">문장을 누르면 원문의 그 자리로 — 확인은 언제나 당신의 눈으로.</p>
        </div>
      </section>

      {/* S3 — 26분과 */}
      <section id="specialties" className="ld-s3 ld-io">
        <h2 className="ld-h2 ink">26개 전문과목,<br />각자의 렌즈.</h2>
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
