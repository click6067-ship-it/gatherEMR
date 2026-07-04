# gatherEMR — 마스터 블루프린트 (rev5, 2026-07-04, Fable 설계)

> **역할 분담:** 이 문서 = Fable이 설계한 정본 아키텍처·명세. **구현은 Opus**가 `docs/IMPLEMENTATION-PLAN.md`를 따라 수행한다.
> **상위 문서:** `NEEDS.md`(사용자 니즈 정본 — 충돌 시 항상 NEEDS.md 승) · `docs/research/specialty-needs/`(26분과 근거).

---

## 0. 제품 정체성 (한 문장)

**어느 분과든** 의대교수가 차트를 붙여넣으면, **자기 분과를 드롭다운으로 고르고**, 그 분과의 눈으로 요약을 받고, **문장을 누르면 원본 그 위치로 점프해 직접 검증**하는 사이트.

## 1. 절대 원칙 (구현 중 매 결정의 기준)

1. **요약이 잘 작동하는 것이 전부.** 지금은 MVP — 디자인 투자 0 (디자인은 전 페이지 작동 확인 후 별도 finale).
2. **26분과 전부 균등하게 작동.** 특정 분과 하드코딩 금지. 분과 렌즈는 `lib/specialties.ts` 레지스트리에서만 온다.
3. **예상 적중률 100%.** 교수는 사용법을 모른다 — 스크롤만으로 맥락 파악, "누르면 이게 되겠지"가 전부 맞아야 함 (애플·토스 방식). 모든 진행은 **인터랙티브 스텝 플로우**(한 화면 한 선택, 오른쪽 슬라이드 전환).
4. **환각 = 구조로 차단.** 모든 요약 문장은 (a) 실제 청크 인용 + (b) 인용한 청크 안에서 quote가 exact-span으로 해석돼야만 표시. 실패 문장은 렌더링 자체가 안 됨.
5. **로그인 없음.** 익명 세션. 비식별본만 저장(무기한, Supabase). raw는 메모리에서 폐기.
6. **완료 선언 = 사용자 브라우저에서 확인된 것만.** 내부 curl/스크린샷은 보조 증거. 출시 전 `NEEDS.md 대비 체크리스트 검수` 필수 게이트.

## 2. 시스템 아키텍처

```
[브라우저 (익명 세션)]
  Step1 계열 → Step2 분과(내과면 Step2b 세부) → Step3 차트 입력(+포커스칩)
      │ POST /api/deid-preview  (raw text — 저장 안 함)
      ▼
[서버] detect(regex) → mask(███+날짜시프트) → chunkText(오프셋 보존)
      │ 반환: masked + identifiers + chunks
      ▼
  Step4 비식별 확인 화면 (항상 표시 — 사용자 승인 필수) + 동의 체크
      │ POST /api/summarize {maskedText, specialtyId, subId?, focus?}
      ▼
[서버] 재-비식별(방어) → 레이트리밋/비용가드 → resolveTemplate(레지스트리)
      → GPT-5.x generateObject(SummarySchema, 분과렌즈 프롬프트)
      → enforceCitations(허위인용 드롭) → resolveItems(인용 청크 내 exact-span)
      → slopLint(임상형) → [Supabase 저장: 비식별본만] → 반환
      ▼
  Step5 스플릿뷰 (좌: 분과 요약 / 우: 비식별 원문, 클릭→span 하이라이트+근거 팝오버)
```

- **스택:** Next.js 16 App Router + TypeScript · Vitest · Vercel · Supabase(Postgres) · OpenAI GPT-5.x via AI SDK v6 (`generateObject` + zod). 모델 id는 env `OPENAI_MODEL`(현재 `gpt-5.5`).
- **v1 입력 = 텍스트/텍스트-PDF.** 이미지·스캔 OCR은 다음 페이즈(NEEDS "뭐든 업로드"는 유효한 목표 — 아키텍처는 chunk 계층이 흡수).

## 3. 핵심 설계 결정 (왜 이 모양인가)

| 결정 | 이유 |
|---|---|
| **제네릭 요약 스키마** (`oneLiner·cannotMiss·blocks[]·medChanges·gaps`) | 26분과가 하나의 zod 스키마 공유. 분과별 차이는 `blocks[].title`(동적)로. 리서치 공통패턴 반영: 추이>스냅샷 · cannot-miss 최상단 · 투약 변경 로그는 전 분과 공통. |
| **레지스트리 = 데이터, 엔진 = 코드** | 분과 추가·수정이 코드 수정 없이 레지스트리 항목 편집으로 끝나야 함. |
| **quote는 인용 청크 안에서만 해석** | 전역 검색은 중복 텍스트 오하이라이트 + 허위인용 생존 구멍 (codex review 검증됨). |
| **비식별 = 탐지(보조) + 사용자 확인(보장)** | 자동 탐지율 주장은 근거 없음. 전송 전 마스킹 미리보기를 **항상** 승인받는다. |
| **비용가드 예약-정산** | 동시 요청 초과 방지: 호출 전 $0.3 예약 → 실비 정산, 실패 시 반환. |

## 4. 데이터 모델 (Supabase — 비식별본만)

`supabase/migrations/0001_init.sql` (git 이력 9a5af40에 검증본 존재 — 복원 사용):
- `documents(id uuid PK, session_id, specialty, masked_text, status, created_at)`
- `chunks(document_id FK cascade, id 'cN', start_pos, end_pos, line, text)` — PK(document_id, id)
- `summaries(id, document_id FK, specialty, content jsonb, lint jsonb, model, created_at)`
- `spend_ledger(day date PK, usd numeric)`
- RLS: v1은 anon 키 + 허용 정책. `saveDocument`는 저장 전 `detect()` 재실행해 식별자 잔존 시 **거부**.
- ⚠️ **현재 Supabase 프로젝트(apmzsopeaudyteyvvfvz) PAUSED** — 사용자가 Resume 해야 라이브. 그전까지 저장은 no-op 폴백(요약은 동작).

## 5. 모듈 명세

### 5a. 레퍼런스 구현 존재 (Opus: 검증·테스트 갱신만, 재작성 금지)
전부 이전 빌드에서 **codex 적대 리뷰 + 24 유닛테스트 통과**했던 검증본이거나 그 직계:
| 파일 | 인터페이스 | 상태 |
|---|---|---|
| `lib/chunking.ts` | `chunkText(text): Chunk[]` — `Chunk{id,start,end,line,text}`, `slice(start,end)===text` 보장 | ✅ 검증본 |
| `lib/span.ts` | `resolveSpan(source, quote): {start,end}|null` — 정확→공백정규화 폴백 | ✅ 검증본 |
| `lib/deid/rules.ts` | 주민번호(하이픈±)·전화(공백±)·email·날짜(ISO/슬래시/한글)·MRN·이름(영문 풀네임) 탐지 | ✅ 검증본 |
| `lib/deid/index.ts` | `detect(text): Identifier[]` · `mask(text, ids, {shiftDays?})` — ███ + 간격보존 날짜시프트(무효날짜는 ███) | ✅ 검증본 |
| `lib/costGuard.ts` | `makeCostGuard(store, capUsd, now)` — canSpend/record/spentToday, 일 단위 리셋 | ✅ 검증본 |
| `lib/rateLimit.ts` | `rateLimit(key, limit, windowMs, now?)` 고정윈도 + `clientIp(req)` | ✅ 검증본 |
| `lib/session.ts` | `getSessionId()` — localStorage 익명 uuid | ✅ 검증본 |
| `lib/specialties.ts` | **핵심 IP.** `SPECIALTIES: Specialty[]` 26개(+내과 `subspecialties` 9) · `GROUPS` 4계열 · `resolveTemplate(specialtyId, subId?)` — 각 항목 `{id,name,lens[],blocks[],cannotMiss[],chips[]}` = 리서치 직결 | 🆕 Fable 작성(리서치 기반) — Opus 검수 |
| `lib/summary/schema.ts` | 제네릭 스키마(§3). `SummaryItem{text,quote:null허용,citations[],label:explicit/derived/uncertain}` — OpenAI strict라 optional 금지, nullable만 | 🆕 갱신됨 |
| `lib/summary/prompt.ts` | `buildSystemPrompt(template)` — 렌즈/블록/cannotMiss 주입 + 반환각·반슬롭 규칙 · `buildUserPrompt(chunks, focus?)` — `[cN]` 태깅 | 🆕 갱신됨 |
| `lib/summary/enforce.ts` | `enforceCitations(summary, chunks)` — 허위/무인용 드롭, 빈 블록 제거 | 🆕 갱신됨 |
| `lib/summary/slopLint.ts` | `slopLint(summary): LintFinding[]` — 숫자없는 lab·시각없는 trend, pending 예외 | 🆕 갱신됨 |
| `lib/summary/summarize.ts` | `summarize(maskedText, chunks, template, opts?)` → `{summary: ResolvedSummary, lint, usage}` · `postProcessSummary(raw, chunks)` 순수함수 · **maxOutputTokens 8000 + reasoningEffort 'low'** (2000이면 JSON 잘림 — 실측) | 🆕 갱신됨 |

⚠️ **스테일 테스트**: `enforce.test.ts`·`slopLint.test.ts`는 구(응급의학 하드코딩) 스키마 기준 — 새 제네릭 스키마로 재작성 필요. `chunking/span/deid/costGuard/rateLimit` 테스트는 유효.

### 5b. Opus가 새로 구현
| 파일 | 명세 |
|---|---|
| `app/api/deid-preview/route.ts` | POST `{text}` → 레이트리밋(IP 30/분) → `detect`+`mask`+`chunkText` → `{identifiers, masked, chunks}`. raw 저장·로깅 금지. (검증본이 git 이력에 있음 — 재사용 가) |
| `app/api/summarize/route.ts` | POST `{maskedText, specialtyId, subId?, focus?}` → 레이트리밋(IP 8/분 + 글로벌 40/분) → **서버 재-비식별**(방어) → `resolveTemplate` (미존재 시 400) → 비용가드 예약($0.3)→호출→정산(gpt-5.5 $5/$30 per M) → Supabase 저장 시도(실패해도 응답은 성공) → `{summary, lint, chunks, documentId?}` |
| `app/api/documents/[id]/route.ts` | DELETE — 익명 삭제 링크(cascade). Supabase live 시만. |
| `lib/supabase.ts` | git 이력(9a5af40) 검증본 복원: `serverClient()·saveDocument()(식별자 잔존 거부 가드 포함)·getDocument()·deleteDocument()` |
| **UI (스텝 플로우)** | §6 명세. |

## 6. UI 명세 — 토스식 스텝 플로우 (기능만, 디자인 투자 0)

**전역 규칙:** 한 화면 = 한 결정. 선택 즉시 **오른쪽 슬라이드**로 다음 스텝(CSS transform, ~300ms). 상단에 진행 표시(`01 계열 → 02 분과 → 03 차트 → 04 확인 → 05 결과`)와 **뒤로가기**. 모든 클릭 가능한 것은 클릭 가능해 보이게, 아닌 것은 아니게. 스크롤만으로 지금 뭘 해야 하는지 즉시 이해.

- **Step 1 — 계열 선택:** 4개 큰 버튼(내과·진료 / 외과·수술 / 진단·지원 / 응급·사회의학). 설명 텍스트 최소.
- **Step 2 — 분과 선택:** 선택한 계열의 분과 목록(레지스트리에서 생성). **내과 선택 시 Step 2b**: 세부분과 9개 + "일반 내과" 옵션.
- **Step 3 — 차트 입력:** 큰 textarea("여기에 차트를 붙여넣으세요 — 식별정보는 다음 단계에서 가려집니다") + **분과별 포커스 칩**(레지스트리 `chips`, 탭=선택, 무선택 통과 가능) + 접힌 "직접 입력 한 줄" + **샘플 채우기 버튼**(§7) + 동의 체크 1개("비식별 교육·연구용 케이스이며 저장에 동의") + [비식별 확인 →].
- **Step 4 — 비식별 확인:** 마스킹된 전문 표시("N건을 가렸습니다. 남은 식별정보가 없는지 확인하세요"), [확인했습니다 · 요약 →] / [← 수정]. **탐지 0건이어도 이 화면은 항상 표시.**
- **Step 5 — 결과 스플릿뷰:**
  - 좌: `⚠️ cannotMiss`(있으면 최상단, 경고 스타일) → `한 줄 문제표상` → 분과 blocks(번호+제목) → `투약/치료 변경` → `불확실·누락`. 각 문장 앞 라벨 배지(`원문`/`추론`/`불확실` — 색+모양 구분).
  - 우: 비식별 원문(sticky, 내부 스크롤). **문장 클릭 → 해당 span `<mark>` 하이라이트 + scrollIntoView + 근거 카드**(주장 / 원문 인용 / 라벨 / 인용 청크 id).
  - 상단: [새 케이스](Step 1로 리셋) · lint 발견 시 참고 배너.
- **에러:** 429 → "요청이 많습니다/오늘 사용량 상한" 한국어 안내. 5xx → 재시도 버튼.
- **모바일:** 반응형 필수(스플릿뷰는 세로 스택 + "원문 보기" 토글). 가로 오버플로 0.

## 7. 샘플 케이스 (Step 3 "샘플 채우기")

MVP는 **1개**: messy 흉통 케이스(모순·누락 내장 — 이전 세션 검증 픽스처, git 이력 `scripts/smoke-api.mjs` 참조). 붙여넣기 없이 전체 플로우 체험용. (다양한 타입 샘플·show-don't-tell 랜딩은 디자인 finale에서.)

## 8. 안전장치 (공개 도구)

- 레이트리밋: deid 30/분/IP · summarize 8/분/IP + 40/분 글로벌.
- 비용: **일일 $20 서킷브레이커**(spend_ledger; Supabase 다운 시 인메모리 폴백) · 문서당 입력 20k토큰 상한(초과 시 앞부분 절단+안내) · 출력 8k.
- 입력: 500KB/문서 상한. 로그에 원문·PII 금지.
- 문서별 삭제 링크(결과 화면 하단, documentId 있을 때).

## 9. 검증 계획 (Opus 완료 게이트)

1. **유닛:** 기존 유효 테스트 그린 + 새 스키마용 enforce/slopLint/postProcess 테스트 + **레지스트리 무결성 테스트**(26개·4계열 전부 존재, 각 항목 lens/blocks/cannotMiss/chips 비어있지 않음, id 유일, resolveTemplate 동작).
2. **분과 차별화 스모크(핵심):** 같은 messy 흉통 차트를 **서로 다른 계열 3분과**(예: 응급의학·순환기내과·마취통증의학)로 라이브 요약 → 블록 제목·내용이 각 분과 렌즈대로 실제로 달라짐을 확인·기록.
3. **E2E:** dev 서버로 Step1→5 전체 플로우 구동(Playwright, headless tools 위치: `~/.claude/tools/headless`) + 스크린샷.
4. **빌드:** `next build` 그린.
5. **NEEDS.md 체크리스트 검수:** NEEDS §1~4 각 항목 대비 구현 여부 표로 작성 — 하나라도 미충족이면 완료 선언 금지.
6. **최종 완료 = 사용자가 자기 브라우저에서 확인.** 배포(Vercel) 후 URL 제공 → 사용자 확인 응답을 받아야 종결. 로컬호스트는 완료 증거가 아니다.

## 10. 미해결·후속 (구현 차단 아님)

- Supabase Resume(사용자) → 저장·삭제 라이브 배선.
- 정신건강의학과 요약 프롬프트 세부 = **Opus가 구현 중 직접 마감** (`docs/research/specialty-needs/OPUS-HANDOFF.md` + `med2-내과계기타.md` 근거. 드롭다운·레지스트리엔 이미 존재).
- 이미지·스캔 OCR(업스테이지/Azure 컨테이너) = 다음 페이즈.
- **디자인 finale** = 전 페이지 작동 확인 후: 실물 레퍼런스 수집→사용자 승인→시네마틱 영상/이미지 에셋→문구 전면 재작성→사용자 2축(AI말투/획일화) 검수.
- Vercel 프로젝트는 삭제됨 — 배포 시 새로 `vercel link --project gatheremr` + env 세팅(.env.local 참조).
