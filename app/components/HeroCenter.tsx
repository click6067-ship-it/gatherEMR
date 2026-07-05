import { ShinyText } from './ShinyText';
import { StartButton } from './StartButton';

const ARROW = (
  <svg className="arw" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function HeroCenter() {
  return (
    <div className="wrapx hero-in">
      <div className="hero-top">
        <p className="hero-lead">EMR차트에서, 당신 분과가 가장 먼저 봐야 할 것만 — 근거 인용과 함께 남깁니다.</p>
        <p className="hero-stat">4,200자 → 핵심 12문장 · 근거 없는 문장 0</p>
      </div>
      <div className="hero-center">
        <p className="hero-eyebrow mono">교육·연구용 비식별 EMR 요약</p>
        <h1 className="hero-h1">진료차트를 요약하여 분과별 환자의 <ShinyText>핵심만</ShinyText> 파악합니다.</h1>
        <StartButton className="btn-glass hero-cta">차트 넣어보기 {ARROW}</StartButton>
      </div>
    </div>
  );
}
