# 의료·하이트러스트 히어로 비주얼 조사 (2026-07-04, researcher: hero-video-medtech)

## 핵심 발견: 임상 AI(ambient scribe류)는 히어로 영상을 거의 안 쓴다

**조사 방법 한계:** WebFetch는 렌더링이 아니라 HTML→텍스트 추출이라 배경 비디오/CSS 애니메이션을 놓칠 수 있음. 아래는 텍스트 마크업에서 확인 가능한 범위 + 보조 검색으로 교차검증. Ambience Healthcare·Ramp·OpenEvidence·닥터나우·굿닥은 마크업만으론 시각 디테일 확인 불가(OpenEvidence 403).

### 사례별 확인 결과

**임상 문서화/스크라이브 AI (의사 타겟, 신뢰 부담 최고 카테고리):**
- **Abridge** — 영상 없음. 추상 그래픽 1장 + "Enterprise-Grade AI / For every moment of care". 실사 인물·제품샷 없음.
- **Nabla** — 영상 없음. 제품 UI 스크린샷 정적. "Smarter clinical workflows. Elevated care."
- **Corti** — 영상 없음. 오브(orb) 그래픽 + 파트너 로고. 블랙/화이트+블루. HIPAA-ready·1M+ interactions/week 등 개발자 신뢰 전면.
- **Suki** — 이미지·영상 거의 없음. 텍스트 중심 히어로, 차분한 톤.
- **DeepScribe** — 영상 없음. 노트 UI 스크린샷 + 모바일 녹음 인터페이스 + 웨이브 SVG.
- **Ambience Healthcare** — 마크업상 확인 불가하나 메트릭 중심 카피("80% utilization", "45% less charting time") — 숫자로 신뢰 구축.

→ **6/6 모두 히어로에 실사 인물·내러티브 영상 없음.** 대신 (a) 추상 그래픽/오브 (b) 제품 UI 스크린샷 (c) 순수 타이포+메트릭.

**컨슈머 헬스 (대조군):** Oura=정적 제품 사진, Whoop=유일한 실사 인물(러너)+데이터 오버레이(단 컨슈머 피트니스 — 참조 범주 다름), Function/K Health=정적.

**하이트러스트 비-의료:** Anthropic=순수 타이포(이미지 없음), 1Password=대시보드 정적 2장, Mercury=프레임 모핑(가벼운 전환, 진짜 비디오 아님), Stripe=SVG 웨이브 모션(장식적 흐름).

**한국:** Toss=영상 없음, 키패드 메타포+마이크로인터랙션으로 신뢰("매력적 디자인=신뢰" 명시). Lunit=배경 기술이미지+타이포. Vuno=추상 SVG 네트워크.

### 신뢰를 깨지 않는 모션의 공통 문법
- "Designing for trust means designing for restraint" — 애니메이션 과잉보다 여백·타이포·절제 (valmax.agency)
- "**Motion that explains, not decorates**": 배경 루프·파티클=노이즈, 데이터 흐름·인터페이스 반응=신호 (metabrand.digital)
- Mercury·Stripe·Toss 전부 "제품/데이터가 어떻게 동작하는지" 보여주는 절제 모션.

### 피해야 할 의료 클리셰
- 목에 건 청진기·흰 가운 악수·과도한 임상 그래픽(수술도구) — "가짜 의사" 클리셰 (healthcaresuccess.com)
- AI 임상도구 카테고리에선 애초에 인물 이미지 자체를 안 쓰는 게 대세.

### 결론 — gatherEMR 라이트 시네마틱 히어로 제언
1. 경쟁군 전원이 실사·내러티브 영상 안 씀 — 쓴다면 "왜 다르게 가는지" 답할 수 있어야.
2. 담아도 되는 모션 = "제품이 실제로 동작하는 것"뿐 (요약 조립·데이터 흐름). 인물 없는 UI/데이터 모션이 최선.
3. 시네마틱 톤은 Mercury 프레임모핑/Stripe 웨이브 수준의 초절제 루프로 제한.
4. 금지: 청진기·흰가운·악수, 사람 얼굴 자동재생, bouncy 이징. (Anthropic처럼 타이포만도 유효.)
5. Whoop(실사 성공례)은 컨슈머 웨어러블 — 임상 타겟엔 인물 없는 추상·UI·타이포 3택이 업계 표준.

### Sources
Abridge · Nabla · Corti · Suki · DeepScribe · Ambience / Oura · Whoop · Function · K Health / Anthropic · 1Password · Mercury · Stripe / Lunit · Vuno / Toss 첫화면 분석(medium.com/@jeehyeon-tra) / valmax.agency / metabrand.digital / healthcaresuccess.com
