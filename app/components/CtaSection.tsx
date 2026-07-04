import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="sec cta-sec">
      <div className="wrapx cta-in">
        <h2 className="cta-h2">지금 차트 하나<br />넣어보세요.</h2>
        <Link href="/app" className="btn-glass cta-btn">시작하기 →</Link>
      </div>
    </section>
  );
}
