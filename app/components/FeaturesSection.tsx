const FEATURES = [
  {
    h: '원본과 요약을 나란히',
    p: '요약 문장을 누르면 오른쪽 원문 위치로 바로 이동합니다. 원본 대조로 신뢰성을 눈으로 검증합니다.',
  },
  {
    h: '분과별 관점 요약',
    p: '같은 차트라도 분과마다 먼저 봐야 할 것이 다릅니다. 25개 분과 각각의 렌즈로 핵심부터 정리합니다.',
  },
  {
    h: '시계열 추이 중심',
    p: '스냅샷이 아니라 값의 방향과 속도로(예: Cr 0.8→2.1). 여러 차수 기록에서 의미 있는 추이만 남깁니다.',
  },
  {
    h: '문장마다 원문 근거',
    p: '모든 요약 항목에 원문 인용을 강제합니다. 근거로 뒷받침되지 않는 문장은 표시하지 않아 환각을 차단합니다.',
  },
];

const STEPS = [
  { n: '01', h: '넣기', p: '텍스트·PDF·이미지·HWP·DOCX를 그대로. 별도 전처리 없이 원본을 붙여넣거나 첨부합니다.' },
  { n: '02', h: '비식별 확인', p: '이름·등록번호·주소 같은 식별정보를 가리고, 비식별본만 전송합니다. 전송 전 사용자가 직접 확인합니다.' },
  { n: '03', h: '분과 요약', p: '고른 분과 관점으로 놓치면 안 될 것·핵심 블록·투약 변경·불확실 항목을 근거와 함께 정리합니다.' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="sec">
      <div className="wrapx">
        <h2 className="sec-h2 reveal">긴 EMR에서 진짜 봐야 할 것만, 정확하게.</h2>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div key={f.h} className="feat-card reveal">
              <h3>{f.h}</h3>
              <p>{f.p}</p>
            </div>
          ))}
        </div>

        <p className="feat-eyebrow mono reveal">작동 원리</p>
        <div className="step-row">
          {STEPS.map((s, i) => (
            <div key={s.n} className="step-item reveal" style={{ ['--ri' as string]: i } as React.CSSProperties}>
              <span className="step-n mono">{s.n}</span>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
