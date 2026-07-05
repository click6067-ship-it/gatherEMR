import { StartButton } from './StartButton';

export function CtaSection() {
  return (
    <section className="sec cta-sec">
      <div className="wrapx cta-in reveal">
        <h2 className="cta-h2">지금 차트 하나<br />넣어보세요.</h2>
        <StartButton className="btn-glass cta-btn">시작하기 →</StartButton>
      </div>
    </section>
  );
}
