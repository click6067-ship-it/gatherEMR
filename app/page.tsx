'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { GROUPS, SPECIALTIES } from '@/lib/specialties';
import { HeroCanvas } from './components/HeroCanvas';

/* Landing — "종이 위의 시네마" (DESIGN-V3-SPEC). 섹션당 카피 ≤2줄 + 시각 1개.
 * 모션: IO reveal + S1 scroll-progress만. 라이브러리 0. reduced-motion/no-JS 완독 가능. */

const FRAGMENTS = [
  '[Nursing 18:51] "가슴이 꽉 막힌 느낌" onset 1hr',
  '[EKG 19:10] sinus tach 102 · nonspecific ST-T',
  'home meds: warfarin? 당뇨약 — patient unsure',
  '[Lab 20:46] Troponin-I 2.1 ↑ · INR 1.7',
  '[ED 19:08] pain 3/10 after rest · allergy n/d',
  'Cr 1.8 · eGFR 38 · K 5.1 — repeat pending',
];

export default function Landing() {
  const s1ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // IO reveal (.ld-io → .in)
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.35 },
    );
    document.querySelectorAll('.ld-io').forEach((el) => io.observe(el));

    // S1 scroll progress → CSS var --p (fragments scatter+blur)
    const el = s1ref.current;
    let raf = 0;
    const tick = () => {
      if (el) {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight || 1)));
        el.style.setProperty('--p', String(p));
      }
      raf = requestAnimationFrame(tick);
    };
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(tick);
    else el?.style.setProperty('--p', '0.85');
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <main className="ld">
      {/* S0 — hero: 차트가 요약으로 증류되는 6초 */}
      <section className="ld-hero">
        <HeroCanvas />
        <div className="ld-hero-copy">
          <h1>차트는 길다.<br />봐야 할 것은 짧다.</h1>
          <p>의대 교수를 위한 분과별 EMR 요약 — 문장마다 원문 근거.</p>
          <Link href="/app" className="btn ld-cta">차트 넣어보기 →</Link>
        </div>
        <div className="ld-scrollcue" aria-hidden="true">스크롤</div>
      </section>

      {/* S1 — 문제: 기록의 부피 (질감으로만) */}
      <section className="ld-s1" ref={s1ref}>
        <div className="ld-s1-stick">
          <div className="ld-frags" aria-hidden="true">
            {FRAGMENTS.map((f, i) => (
              <div key={i} className="ld-frag mono" style={{ ['--i' as string]: i } as React.CSSProperties}>{f}</div>
            ))}
          </div>
          <h2 className="ld-h2">3일치 기록,<br />15분의 외래.</h2>
        </div>
      </section>

      {/* S2 — 해법 = 데모: 문장 → 원문 연결선 */}
      <section className="ld-s2 ld-io">
        <h2 className="ld-h2">분과를 고르면,<br />그 분과의 눈으로.</h2>
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
      </section>

      {/* S3 — 26분과 */}
      <section className="ld-s3 ld-io">
        <h2 className="ld-h2">26개 전문과목,<br />각자의 렌즈.</h2>
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

      {/* S4 — 신뢰 */}
      <section className="ld-s4 ld-io">
        <h2 className="ld-h2">비식별본만 저장.<br />근거 없는 문장은 표시하지 않습니다.</h2>
        <div className="ld-trust">
          <div className="ld-mask mono">환자명: <span className="ld-mask-flip"><span>홍길동</span><span>███</span></span> · 등록번호: <span className="ld-mask-flip"><span>00123456</span><span>████████</span></span></div>
          <div className="ld-badges">
            <span className="badge explicit">원문</span>
            <span className="badge derived">추론</span>
            <span className="badge uncertain">불확실</span>
          </div>
        </div>
      </section>

      {/* S5 — CTA */}
      <section className="ld-s5 ld-io">
        <h2 className="ld-h2">지금 차트 하나<br />넣어보세요.</h2>
        <Link href="/app" className="btn ld-cta">시작하기 →</Link>
        <footer className="ld-foot">
          <span>교육·연구 참고용 — 진료 판단을 대체하지 않으며, 식별정보가 있는 차트는 업로드 전 확인 단계에서 가려집니다.</span>
          <span>© 2026 gatherEMR</span>
        </footer>
      </section>
    </main>
  );
}
