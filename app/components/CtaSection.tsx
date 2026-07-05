import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="sec cta-sec">
      <div className="wrapx cta-in reveal">
        <Link href="/app?demo=sample-cirrhosis" className="btn-glass cta-btn">샘플 데모 보기 →</Link>
        <p className="cta-note">실제 API 호출 없이 캐시된 요약으로 즉시 시연됩니다.</p>
      </div>
    </section>
  );
}
