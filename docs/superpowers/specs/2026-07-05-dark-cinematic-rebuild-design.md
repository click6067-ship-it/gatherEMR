# 랜딩 백지 재건 — "Dark Cinematic (DesignPro-referenced)" (2026-07-05 확정 설계)

> 기존 프레젠테이션 레이어(웜-글래스 시스템 전체)를 **들어내고**, DesignPro 레퍼런스 구조를
> gatherEMR 콘텐츠에 이식한 **다크 시네마틱** 룩으로 백지 재건. **기능(lib·api·/app 플로우)은 보존.**
> 근거: DesignPro 스펙(구조/홀로그램) + 확정 Flip Scan 영상(`public/hero-flipscan.mp4`) +
> 사용자 3답(블러+디밍 배경 · 랜딩 전체 다크 · 블루 아크 시머).

## 1. 목표 / 배경
- 기존 디자인(웜뉴트럴 글래스 + 스크롤 스크럽 히어로) 위에 얹는 반복이 옛 룩을 계속 끌고 옴(중앙값 회귀=슬롭).
- 사용자 결정: **"기능만 남고 전부 다시."** 프레젠테이션 레이어를 통째 재건해 완전히 새 룩으로.
- 스크롤 스크럽 **폐기** → 영상은 **autoplay 루프 배경(강블러+디밍)**, 중앙에 **블루 아크 시머 홀로그램 헤드라인**.

## 2. 유지 vs 재건 경계 (사용자 승인)
| | 대상 |
|---|---|
| ✅ **유지(손 안 댐)** | `lib/*`(specialties 레지스트리·summary·extract·de-id·session), `app/api/*`(extract·summarize·deid-preview·documents), **/app 플로우 로직**(stage 상태·fetch), `SpecialtyPicker`·`ChartLens`의 **동작 로직** |
| 🔥 **재건(백지)** | `app/globals.css` **전체 교체**(웜-글래스·모든 `.ld-*`/`.appshell` 등 삭제), `app/page.tsx`(랜딩 새로), 랜딩 컴포넌트(`ScrubHero`·`LiquidVideoCanvas`·`HeroDashboard`·드로어 → 신규 컴포넌트로 대체), **/app 마크업 스킨**(클래스·CSS 새로, 로직 유지) |
- 제품은 재건 내내 작동. 옛 디자인은 git 히스토리 보존(프로덕션 롤백 가능).
- **/app 재결정:** Q2("/app 하이브리드 유지")는 "전부 다시"로 **대체** → /app도 새 다크 디자인 스킨(로직 그대로).

## 3. 디자인 토큰 (신규 — 웜뉴트럴 완전 폐기)
### 색 (4–6, daltonized 절제)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#000000` | 풀스크린 블랙 |
| `--void` | `#06080f` | 섹션 보이드(블랙 위 미세 톤) |
| `--arc` | `#64CEFB` | 홀로그램 베이스 블루(시머) |
| `--arc-deep` | `#2f6bff` | 딥 블루 액센트(영상 아크와 매칭) |
| `--shine` | `#ffffff` | 시머 광선 · 헤드라인 화이트 |
| `--txt` | `rgba(255,255,255,.8)` | 바디 텍스트(white/80) · hover→#fff |

- 라인 컬러: `rgba(255,255,255,.14)`(nav pill·카드 보더, DesignPro gray-700 대응).

### 타이포 (3종 · **Inter 금지**=anti-slop 1순위 슬롭)
- **IBM Plex Sans**(이미 로드): 바디·nav·헤드라인. 헤드라인=weight 500, `letter-spacing:-0.04em`(tracking-tighter), `line-height:0.85`.
- **IBM Plex Mono**: 수치·eyebrow(uppercase·tracking).
- (선택 후속) 헤드라인만 디스플레이 페이스로 교체 여지 — v1은 Plex.

### 시그니처
1. **블루 아크 시머 홀로그램**(헤드라인 강조 라인) — CSS `background:linear-gradient` 스윕 + `background-clip:text` + 투명 텍스트.
2. **레이저 스캔라인**(섹션 구분·미세 디바이더) — 기존 시그니처 계승, 다크 위 블루 글로우.
- "제품명 바꿔도 재사용 가능=실패" 테스트: EMR 차트 영상 + 25분과 렌즈 + 근거표기 = gatherEMR 고유. DesignPro 클론 아님.

## 4. 스택 (레퍼런스 이식 결정)
- Next.js 16 App Router + **순수 CSS**(전면 교체된 `globals.css`). Tailwind 미도입.
- 홀로그램 시머 = **CSS `@keyframes`**(Framer Motion 불필요).
- 아이콘 = **인라인 SVG**(Lucide 불필요).
- **신규 npm 의존성 0.**

## 5. 히어로 구조 (DesignPro 이식 → gatherEMR)
풀스크린 `height:100svh`, `--bg` 블랙. 레이어: 영상 `z-0` < 딤/그라디언트 `z-1` < 콘텐츠 `z-10`.

### 5.1 배경 영상
- `<video autoplay loop muted playsinline>` `position:absolute; inset:0; object-fit:cover; z-0`.
- **강블러+디밍**: `filter: blur(14px) brightness(.45) saturate(1.1)` + 상단 `radial/linear` 다크 그라디언트 오버레이(`z-1`)로 중앙 텍스트 대비 확보. `src=/hero-flipscan.mp4`, poster=`/hero-flipscan-poster.jpg`.
- reduced-motion: 영상 정지(포스터) 유지.

### 5.2 Nav (상단, DesignPro 대응)
- `max-w-7xl` 중앙, 좌: **로고**(원형 화이트 보더 2px + 내부 채운 화이트 원) + `gatherEMR` 텍스트.
- 우: **rounded pill**(보더 `rgba(255,255,255,.14)`) 안에 링크 — gatherEMR용으로 축약: `작동 원리 · 25개 분과 · 시작하기(→)`. white/80 → hover #fff, `text-sm`.
- 모바일(<lg): 햄버거 아이콘(인라인 SVG). 기존 드로어 로직 재사용 가능(스킨 새로).

### 5.3 상단 2컬럼(nav 아래, DesignPro 대응)
- 좌: 밸류 프롭 문단 — *"긴 응급 차트에서, 당신 분과가 가장 먼저 봐야 할 것만 — 근거 인용과 함께 남깁니다."*
- 우(lg+ 우측정렬): 스탯 — *"4,200자 → 핵심 12문장 · 근거 없는 문장 0"*
- 둘 다 white/80, `text-sm`(mobile)/`text-base`(desktop).

### 5.4 중앙 히어로
- eyebrow(uppercase·mono·tracking, white/80, `text-xs`/`text-sm`): *"교육·연구용 비식별 EMR 요약"*.
- **헤드라인**(확정): *"진료차트를 요약하여 분과별 환자의 핵심만 파악합니다."* — 완결 문장형이라 초대형 슬로건이 아닌 **스테이트먼트 헤드라인**: `text-4xl`(mobile)→`text-6xl~7xl`(xl), `line-height:1.12`, `letter-spacing:-0.03em`, weight 500. 화이트 텍스트에 **"핵심만"** 한 구절만 블루 아크 시머 홀로그램(`.shiny`).
- **CTA**(확정 = 다크 글래스): *"차트 넣어보기 →"* (인라인 arrow SVG). rounded-full, `background:rgba(255,255,255,.07)` + 보더 `rgba(100,206,251,.35)` + `backdrop-filter:blur(10px)`, hover 시 배경 살짝 밝아짐 + arrow `translateX`.

### 5.5 ShinyText(홀로그램) 스펙 — CSS
- 베이스 `--arc(#64CEFB)`, 광선 `--shine(#fff)`, 주기 3s, 스프레드 ~100deg 대응.
- 구현:
  ```css
  .shiny { color: transparent; -webkit-background-clip: text; background-clip: text;
    background-image: linear-gradient(100deg, var(--arc) 40%, var(--shine) 50%, var(--arc) 60%);
    background-size: 250% 100%; animation: shine 3s linear infinite; }
  @keyframes shine { to { background-position: -250% 0; } }
  @media (prefers-reduced-motion: reduce){ .shiny{ animation:none; background-position:0 0; } }
  ```
- 컴포넌트 `ShinyText({children})` — 순수 CSS 클래스 래퍼(로직 없음).

## 6. 히어로 아래 섹션 (다크 재구성)
- **25개 분과** — 다크 위 블루 스파인/칩. 헤드라인(한 줄 리드, 3라운드에서 확정한 문구 계승): *"25개 분과별로, 그 분과가 가장 먼저 보는 주제 중심으로 정리합니다."* 스캔라인 디바이더.
- **CTA 섹션** — 다크, 홀로그램 강조 + 화이트 버튼.
- **푸터** — 다크, 교육·연구 고지 + © .
- (기존 데모 섹션은 이미 삭제됨 — 유지.)

## 7. /app 스킨 재건 (로직 보존)
- `app/app/page.tsx`: **JSX 로직/상태/fetch 그대로**, 마크업 클래스만 새 다크 시스템으로.
- 다크 캔버스 + **가독성 확보된 콘텐츠 카드**(다크에서 텍스트 대비 — 카드 배경은 짙은 유리 `rgba(255,255,255,.06~.1)` + 블루 보더, 텍스트 white/85·mono원문 대비). 요약/원문 대조 가독성 최우선.
- `SpecialtyPicker`·`ChartLens`: 클래스만 새 스킨(동작 유지).

## 8. 컴포넌트 구조 (재건)
- `app/page.tsx`(랜딩 셸) → `HeroVideo`(배경영상+딤) · `HeroNav`(로고+pill+햄버거) · `HeroCenter`(eyebrow+헤드라인+CTA) · `ShinyText`(CSS 래퍼) · `SpecialtiesSection` · `CtaSection` · `SiteFooter`.
- 각 단일 책임. 기존 `ScrubHero/LiquidVideoCanvas/HeroDashboard/scrubMath` **삭제**(스크럽 폐기).
- `app/globals.css` → 새 다크 토큰·리셋·컴포넌트 스타일로 전면 교체.

## 9. 비범위 (YAGNI)
- 스크롤 스크럽·대시보드 재조립 페이오프(폐기).
- Tailwind/Framer/Lucide 도입(순수 CSS로 이식).
- Inter 폰트(anti-slop 회피).
- lib/·api·/app **로직** 변경(기능 보존).
- 백엔드/데이터모델 변경.

## 10. 검증
- `node ~/.claude/tools/headless/sloplint.mjs <url>` — 다크·블루라 slop 신호(Inter/보라/획일 radius) 회피 확인.
- `/vcheck` 데스크톱+모바일(가로오버플로·콘솔에러·홀로그램 렌더).
- 영상 배경 위 **중앙 헤드라인 가독성** 육안 확인(블러/딤 강도 튜닝).
- reduced-motion(영상 정지·시머 정지) 경로.
- /app 기능 회귀 없음: pick→input→preview→result E2E 동작(로직 미변경 확인).

## 11. 열린 항목 (구현 중 튜닝)
- 블러/디밍 강도(가독성 vs 영상 존재감).
- nav 링크 세트 최종.
- 시머 강조 구절이 "핵심만"만인지 "분과별 환자의 핵심만"인지(구현 중 육안).
