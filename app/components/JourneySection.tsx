const MILESTONES = [
  { h: '골든타임 팀', p: '의학·데이터·UX·AI가 한 팀에서. 의료 현장의 니즈와 기술 구현을 붙였습니다.' },
  { h: '분과별 니즈 리서치', p: '각 분과가 차트에서 가장 먼저 보는 것을 조사해 레지스트리(lens·blocks·cannot-miss)로 정본화했습니다.' },
  { h: '비식별 · 인용 강제 엔진', p: '업로드 전 식별정보를 마스킹하고, 요약의 모든 문장을 원문 근거에 묶는 요약 엔진을 구현했습니다.' },
  { h: '25개 분과 · 멀티포맷 입력', p: '25개 전문과목을 균등하게 지원하고, 텍스트·PDF·이미지·HWP·DOCX를 OCR로 받습니다.' },
  { h: '샘플 데모 공개', p: '합성 케이스로 실제 요약 결과를 바로 눌러볼 수 있게 열었습니다.' },
];

export function JourneySection() {
  return (
    <section id="journey" className="sec">
      <div className="wrapx">
        <h2 className="sec-h2 reveal">그동안의 발자취</h2>
        <ol className="journey">
          {MILESTONES.map((m, i) => (
            <li key={m.h} className="journey-item reveal" style={{ ['--ri' as string]: i } as React.CSSProperties}>
              <span className="journey-dot" aria-hidden="true" />
              <div className="journey-body">
                <h3>{m.h}</h3>
                <p>{m.p}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
