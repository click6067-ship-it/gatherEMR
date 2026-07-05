import { StartButton } from './StartButton';

export function CtaSection() {
  return (
    <section className="sec cta-sec">
      <div className="wrapx cta-in reveal">
        <StartButton className="btn-glass cta-btn">시작하기 →</StartButton>
      </div>
    </section>
  );
}
