# 어워드급 사이트 히어로 영상 패턴 조사 (2026-07-04, researcher: hero-video-awwwards)

## 패턴 분류

| 유형 | 내용 | 어울리는 성격 | 사례 |
|---|---|---|---|
| (a) 제품 시네마틱 시연 | 실제 UI/기능을 부드러운 캠 무브·컷으로 | 신뢰·기능 증명형 SaaS | Runway, Notion, Webflow |
| (b) 추상 매크로/제너러티브 | 잉크·유체·그라디언트 노이즈 | 미니멀·프리미엄 테크 | Stripe, Vercel, Linear (영상 파일 아닌 WebGL/CSS) |
| (c) 실사 촬영 | 인물·건축·풍경 슬로우팬 | 대형기업/부동산/여행 | Cadigal, Visit Jamaica |
| (d) 3D/WebGL 렌더 | 실시간 렌더 오브젝트 | 크리에이티브 툴·게임 | (일반 패턴) |
| (e) 브랜드 필름 | 극영화 톤 미니무비 | 대형 브랜드 캠페인 | Apple iPhone 17 (광고 필름에 가까움) |

**중요 발견**: Stripe/Vercel/Linear급 "어워드 미학"은 영상 파일이 아니라 **WebGL/CSS 코드 생성 모션**(Stripe minigl, Vercel 프리즘 그라디언트, Linear 노이즈 오버레이). 용량·성능·무한루프 이점.

## 구체 사례
1. **Runway** — 자사 AI 영상생성 실작동 스니펫, 밝은 톤. 기능을 보여줘 신뢰.
2. **Notion** — 플랫폼 사용 스니펫, 밝고 클린. 워크플로 투영 유도.
3. **Webflow** — "코드 없이 만드는 과정" 설명형, 밝은 톤.
4. **Stripe** — 파스텔 WebGL 그라디언트 (영상 아님).
5. **Vercel** — 프리즘 CSS 그라디언트 + 그레인 (영상 아님).
6. **Linear** — 다크 + 추상 노이즈 그라디언트 (영상 아님).
7. **Apple iPhone 17** — 시네마틱 캠페인 필름 (웹 히어로보단 광고).
8. **Aesop/Hermès** — 영상 대신 정적·손그림 (2025-26: 수공예 질감 = AI 과잉 시대 럭셔리 시그널).

⚠️ 신뢰도: sitesplaced.com발 "SaaS Noir·Velorah·Logoisum" 등은 템플릿 갤러리명 — 실존 수상 사이트 근거 없음, 패턴 참고용만.

## 라이트 톤 시네마틱
- Runway/Notion/Webflow = 검증된 "밝은 톤 + 시네마틱 제품 시연" 최선 사례.
- 공식: (1) 오버사이즈 타이포+여백 (2) 슬로우팬/텍스처 클로즈업의 절제 모션 (3) 무음 루프.
- 밝은 배경 텍스트 가독성: 영상 35% 어둡게 그레이딩 or 오버레이 관행.

## 기술 관행
- 필수: `muted autoplay loop playsinline` (playsinline 없으면 iOS 전체화면).
- 포맷: MP4(H.264)/WebM, 데스크톱 ≤4MB·모바일 ≤2MB, CRF 23-28.
- LCP: `<video poster>`는 반응형 미지원 → CSS Grid로 `<picture>` 겹치는 기법. 실측 LCP 3.7s→1.9s, CLS 0.14→0.00 (aarontgrogg.com 2026-01). poster=첫 프레임.
- IntersectionObserver로 뷰포트 진입 시 다운로드 (42% 개선 사례).
- 모바일 셀룰러: 오토플레이 끄고 정적 대체.

## 안티패턴 (2025-26 "촌스러움")
- 범용 스톡 풋티지 (사무실/악수/라이프스타일) — authenticity 반작용으로 기피.
- 과편집 "완벽한" 광고톤 — "perfect edit → honest one" 이동.
- 내용과 무관한 장식 배경 영상 — "subtle, atmospheric, purposeful"로 이동.

## gatherEMR 시사점
1. 영상보다 코드 생성 모션이 안전 — 어워드 미학의 실체가 그것. 의료는 LCP 신뢰성 중요.
2. 영상 쓴다면 제품 시연형(Runway/Notion 패턴) > 실사 인물형.
3. 밝은 배경 + 시네마틱 가능 — 다크가 기본값 아님.
4. 영상 최소화도 손해 아님 — 2026 트렌드 자체가 subtle로 이동.
5. 기술 체크리스트 필수: poster-first LCP, 4속성, 모바일 정적 폴백.

## Sources
awwwards.com/websites/sites_of_the_year · reallygooddesigns.com(2026 trends·healthcare examples) · paperstreet.com(top hero sections) · victorflow.com · marketermilk.com · setproduct.com(Vercel) · kevinhufnagl.com(Stripe gradient) · contentgrip/designrush(Apple) · fastcompany.com(Hermès) · desireedesign.co.uk(Aesop) · envato hub(2026 motion trends) · sitesplaced.com(신뢰도 낮음) · aarontgrogg.com(LCP 실측) · web.dev(video perf) · cloudinary(autoplay)
