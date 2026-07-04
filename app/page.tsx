'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { GROUPS, SPECIALTIES } from '@/lib/specialties';

/* Landing — "종이 위의 시네마" (DESIGN-V3-SPEC). 섹션당 카피 ≤2줄 + 시각 1개.
 * 모션: IO reveal만. 라이브러리 0. reduced-motion/no-JS 완독 가능. */

export default function Landing() {
  useEffect(() => {
    // IO reveal (.ld-io → .in)
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.35 },
    );
    document.querySelectorAll('.ld-io').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className="ld">
      {/* floating liquid-glass nav */}
      <nav className="gnav">
        <span className="brand">gatherEMR</span>
        <span className="links">
          <a href="#demo">데모</a>
          <a href="#specialties">26분과</a>
        </span>
        <Link href="/app" className="btn">차트 넣어보기</Link>
      </nav>

      {/* S0 — hero: 무드 영상 (종이 위의 빛) + 카피 */}
      <section className="ld-hero">
        <video className="ld-video" autoPlay muted loop playsInline poster="/hero-poster.jpg" aria-hidden="true">
          <source src="/hero-mood.webm" type="video/webm" />
        </video>
        <div className="ld-hero-copy">
          <h1 className="ink play">차트는 길다.<br />봐야 할 것은 짧다.</h1>
          <p>의대 교수를 위한 분과별 EMR 요약 — 문장마다 원문 근거.</p>
          <Link href="/app" className="btn ld-cta">차트 넣어보기 →</Link>
        </div>
        <div className="ld-scrollcue" aria-hidden="true">스크롤</div>
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
            <div key={gr.id} className="ld-group-card" style={{ ['--c' as string]: gr.color, ['--bg' as string]: gr.soft, ['--d' as string]: `${gi * 110}ms` } as React.CSSProperties}>
              <div className="ld-group-head">
                <span className="ld-group-name">{gr.label}</span>
                <span className="ld-group-count">{SPECIALTIES.filter((s) => s.group === gr.id).length}</span>
              </div>
              <div className="ld-group-chips">
                {SPECIALTIES.filter((s) => s.group === gr.id).map((s, i) => (
                  <Link key={s.id} href="/app" className="ld-chip" style={{ ['--d' as string]: `${gi * 110 + i * 35}ms` } as React.CSSProperties}>{s.name}</Link>
                ))}
              </div>
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
