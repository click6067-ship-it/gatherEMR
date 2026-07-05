import type { Metadata } from 'next';
import Link from 'next/link';
import { ShinyText } from '../components/ShinyText';

export const metadata: Metadata = {
  title: 'About — gatherEMR',
  description: '비식별 EMR을 분과 관점으로 요약하는 교육·연구용 도구. 문장마다 원문 근거로 환각을 차단합니다.',
};

const CARDS = [
  {
    h: '비식별 전용',
    p: '업로드 전 확인 단계에서 이름·등록번호·연락처 같은 식별자를 가리고, 비식별본만 처리·저장합니다. 식별 원문은 서버로 보내지 않습니다.',
  },
  {
    h: '문장마다 원문 근거',
    p: '요약의 모든 문장은 원문 인용 위치와 연결됩니다. 근거로 뒷받침되지 않는 문장은 남기지 않아, 그럴듯한 환각을 구조적으로 차단합니다.',
  },
  {
    h: '25개 분과 관점',
    p: '같은 차트라도 분과마다 가장 먼저 봐야 할 것이 다릅니다. 분과별 렌즈로 놓치면 안 될 것부터 정리합니다.',
  },
  {
    h: '교육·연구 목적',
    p: '진료 판단을 대체하지 않습니다. 케이스 학습·리뷰·연구를 돕기 위한 참고용 요약 도구입니다.',
  },
];

export default function About() {
  return (
    <main className="aboutpage">
      <div className="about-in">
        <p className="about-eyebrow mono">About gatherEMR</p>
        <h1 className="about-h1">
          진료차트에서 <ShinyText>핵심만</ShinyText>, 근거와 함께.
        </h1>
        <p className="about-lead">
          gatherEMR은 의대 교수·전공의의 교육과 연구를 위해, 길고 복잡한 응급 EMR 차트를 분과 관점으로
          요약하는 도구입니다. 비식별을 전제로, 요약의 모든 문장을 원문 근거에 묶어 신뢰할 수 있게 만듭니다.
        </p>
        <div className="about-grid">
          {CARDS.map((c) => (
            <section key={c.h} className="about-card reveal">
              <h3>{c.h}</h3>
              <p>{c.p}</p>
            </section>
          ))}
        </div>
        <div className="about-cta">
          <Link href="/app" className="btn-glass">차트 넣어보기 →</Link>
        </div>
      </div>
    </main>
  );
}
