# gatherEMR MVP 구현 계획 (Opus 실행용, 2026-07-04)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (또는 subagent-driven-development). 명세 정본 = `docs/BLUEPRINT.md`, 니즈 정본 = `NEEDS.md`. 이 계획과 충돌 시 그 두 문서가 이긴다.
> **Goal:** 26분과 전부 작동하는 분과 렌즈 요약 MVP — 토스식 스텝플로우 + 비식별 게이트 + 스플릿뷰 exact-span. 디자인 투자 0.
> **Tech:** Next.js 16(App Router)+TS · Vitest · AI SDK v6 `generateObject`+zod · Supabase(paused — no-op 폴백) · env `.env.local` 존재.

## Global Constraints (전 태스크 공통)
- 분과 하드코딩 금지 — 모든 분과 로직은 `lib/specialties.ts` 레지스트리 경유.
- 모든 요약 문장: 청크 인용 + 인용 청크 내 quote exact-span 해석 실패 시 미표시.
- raw(비마스킹) 텍스트: 저장·로깅 금지. OpenAI엔 마스킹본만.
- 의학용어 임상 표기 유지(SOB, Troponin). UI 한국어.
- 완료 선언 전 `npm test`+`next build` 그린 + BLUEPRINT §9 게이트. **로컬호스트 생존을 완료 증거로 쓰지 말 것.**
- 커밋 author email: `goldentime119119@gmail.com` 차단 이력 있음 — 배포 연동 전 `git log -3 --format=%ae` 확인 규칙 적용.

---

## Task 0 — 상태 파악 & 부팅 (30분)
- [ ] `NEEDS.md` → `docs/BLUEPRINT.md` → `docs/research/specialty-needs/INDEX.md` 정독.
- [ ] `git log --oneline -8` + `git status`로 현재 트리 파악. 레퍼런스 구현(복원본+Fable 신규)이 working tree에 있음 — BLUEPRINT §5a 표와 대조.
- [ ] `npm ci`(이미 됐으면 스킵) → `npx vitest run` 실행해 **스테일 테스트 목록 실측**(enforce/slopLint/postProcess 계열이 구 스키마 기준으로 깨질 것 — 예상된 상태).
- 수용 기준: 어떤 테스트가 유효/스테일인지 목록 작성.

## Task 1 — 엔진 정합화 (신뢰 엔진 그린)
- [ ] 스테일 테스트를 **새 제네릭 스키마 기준으로 재작성**: `enforce.test.ts`(허위인용 드롭·빈 블록 제거·nested blocks), `slopLint.test.ts`(숫자없는 lab·시각없는 trend·pending 예외), 신규 `postProcess.test.ts`(인용 청크 내 quote 해석·중복 텍스트 시 인용 청크 우선·quote 없으면 드롭 — git 이력 9a5af40의 동명 테스트가 좋은 출발점).
- [ ] 신규 `lib/specialties.test.ts` — 레지스트리 무결성: 26개(4계열 분배: internal 8, surgical 9, diagnostic 6, emergency 3), 내과 subspecialties 9개, 전 항목 lens/blocks/cannotMiss/chips 길이>0, id 유일, `resolveTemplate('internal-medicine','cardio')`/'unknown' 동작.
- [ ] `npx vitest run` 전체 그린.
- 수용 기준: 전체 유닛 그린. 엔진 파일 자체는 원칙적으로 무수정(버그 발견 시만 수정 + 회귀 테스트).

## Task 2 — 정신건강의학과 렌즈 마감 (Opus 전용)
- [ ] `docs/research/specialty-needs/OPUS-HANDOFF.md` + `med2-내과계기타.md` 근거로 `lib/specialties.ts`의 psychiatry 항목 lens/blocks/cannotMiss/chips를 임상 리서치 결과대로 보강 (위험도 평가 블록 포함 — 차트 기록의 인용·정리로 한정, 생성·조언 아님).
- 수용 기준: psychiatry 항목이 다른 분과와 동일 수준의 깊이. 레지스트리 테스트 그린 유지.

## Task 3 — API 라우트
- [ ] `app/api/deid-preview/route.ts` — BLUEPRINT §5b. (git 이력 9a5af40 검증본 + 레이트리밋 30/분/IP.)
- [ ] `app/api/summarize/route.ts` — BLUEPRINT §5b 전체: 레이트리밋(8/분/IP+40/분 글로벌) → 서버 재-비식별 → `resolveTemplate`(400 처리) → 비용가드 예약/정산 → `summarize(masked, chunks, template, {focus})` → Supabase 저장 시도(§4: paused면 try/catch no-op, documentId 없이 성공 응답) → `{summary, lint, chunks, documentId?}`.
- [ ] `lib/supabase.ts` git 이력 복원(식별자 잔존 거부 가드 유지) + `app/api/documents/[id]/route.ts` DELETE.
- [ ] 통합 테스트: 모킹된 모델 응답 픽스처로 summarize 라우트 검증(허위인용 드롭·429·400 경로).
- 수용 기준: 유닛+통합 그린.

## Task 4 — 스텝 플로우 UI (BLUEPRINT §6 그대로)
- [ ] `app/page.tsx`(+필요시 `app/components/`) — Step1 계열(4버튼) → Step2 분과(계열별 목록, 내과→Step2b 세부 9+일반) → Step3 입력(textarea+칩+접힌 한줄+샘플 채우기+동의 체크) → Step4 비식별 확인(항상 표시) → Step5 스플릿뷰.
- [ ] 오른쪽 슬라이드 전환 + 진행 표시 + 뒤로가기. 스타일은 기능적 최소(시스템 폰트·기본 팔레트) — **디자인 작업 금지.**
- [ ] 스플릿뷰: cannotMiss 최상단 경고 → oneLiner → blocks(번호+제목) → medChanges → gaps. 라벨 배지 3종(색+모양). 문장 클릭 → 우측 span `<mark>`+scrollIntoView+근거 카드(주장/원문 인용/라벨/청크 id). 모바일 세로 스택.
- [ ] 샘플 = messy 흉통 픽스처 1개(git 이력 `scripts/smoke-api.mjs`의 SAMPLE).
- 수용 기준: `next build` 그린 + Playwright로 Step1→5 전체 구동 스크린샷.

## Task 5 — 검증 게이트 (BLUEPRINT §9)
- [ ] **분과 차별화 스모크:** 같은 messy 흉통 차트를 응급의학·순환기내과·마취통증의학 3분과로 라이브 요약 → 블록 제목·내용이 분과 렌즈대로 달라짐을 산출물 파일로 기록(`docs/verify/`).
- [ ] E2E(Playwright) + `npm test` + `next build` 전부 그린.
- [ ] **NEEDS.md 체크리스트 표** 작성(§1~4 항목별 구현 여부·증거) → `docs/verify/needs-checklist.md`. 미충족 항목 있으면 여기서 멈추고 보고.
- [ ] codex review (엔진·API 변경분) — 지적 중 correctness만 반영.

## Task 6 — 배포 & 사용자 확인 (완료의 정의)
- [ ] `vercel link --yes --project gatheremr` → env 5종 세팅(.env.local) → `vercel deploy --prod`.
- [ ] 배포 URL에서 스모크(홈 200 + 요약 1회) 후 **사용자에게 URL 제시 → "본인 브라우저에서 확인됨" 응답을 받아야 완료.** (공개 전환/Protection은 사용자 의사 확인 후.)
- [ ] 마무리: 커밋 정리, `~/main/council/2026-07-04_gatherEMR/plan.md`에 결과 1줄 追記, 메모리 갱신(gatheremr-project-state).

## 명시적 비범위 (하지 말 것)
디자인·시네마틱·랜딩 리치화(finale 별도) · 이미지 OCR · 로그인 · 다국어 · 26분과 gold 평가셋(작동 우선, 품질 평가는 다음 단계).
