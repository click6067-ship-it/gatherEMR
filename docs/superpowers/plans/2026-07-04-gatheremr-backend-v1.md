# gatherEMR Backend v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v1 text pipeline — upload → chunk → active de-identification (preview+confirm) → GPT-5.x specialty (Emergency Medicine) summary with per-sentence citations & labels → split-view API with exact-span grounding — behind a no-login anonymous public app, storing only de-identified data.

**Architecture:** Next.js (App Router) on Vercel. Pure, framework-free core logic in `lib/` (chunking, de-id detection/masking, exact-span mapping, EM summary schema + citation enforcement, clinical slop-lint) — all TDD-able without any external service. Integration layers (Supabase persistence, OpenAI summarization, cost guard, rate limiting) wrap the pure core. Raw upload is processed in-memory and discarded; only de-identified artifacts persist.

**Tech Stack:** Next.js App Router + TypeScript, Vitest (unit), Supabase (Postgres + Storage), OpenAI GPT-5.x via Vercel AI SDK (structured output), Zod (schema), no external de-id service (regex + human-in-the-loop).

## Global Constraints
- No login. Anonymous session id (browser-generated, `crypto.randomUUID()`), stored in `localStorage`.
- **De-identification is mandatory before any 3rd-party (OpenAI) send AND before any persistence.** Raw identifiable text is processed in-memory and discarded — never written to Supabase.
- De-id v1 = **rule-based regex detection + user preview/confirm gate**. The user always sees the de-identified text and confirms before send (detection is an assist, not the guarantee).
- **Every summary sentence must cite ≥1 source chunk id, else it is dropped.** No uncited sentences reach the UI.
- Each summary sentence carries a label: `explicit` (直接 quote/paraphrase of one span) / `derived` (inference across ≥2 spans) / `uncertain`.
- Citations are **exact character spans** into the (de-identified) source, not whole-chunk pointers. A sentence whose span cannot be resolved is not shown.
- **Daily OpenAI+OCR spend circuit breaker = $20.** Per-document caps: 20k input tokens / 2k output tokens. Over cap → sample-mode only.
- v1 input = plain text + text-PDF (direct extract) only. NO image/scan OCR (Phase 2).
- v1 specialty = Emergency Medicine only (deep). Other 25 specialties selectable but "정밀화 진행 중" (general template later).
- Korean UI; medical terms kept in native clinical form (SOB, Troponin, r/o ACS) — do NOT over-translate.
- Model id via env `OPENAI_MODEL` (e.g. `gpt-5.5`); confirm actual availability at execution.
- Design is frozen: `mockups-v2/` is the UI target. Wire to it in Phase 5; do not redesign.

---

## File Structure

- `lib/session.ts` — anonymous session id helper.
- `lib/chunking.ts` — `chunkText(text): Chunk[]` where `Chunk = {id, start, end, text, line}`.
- `lib/deid/rules.ts` — regex recognizers (주민등록번호, 전화, email, 날짜, MRN-like, 이름 라벨 패턴).
- `lib/deid/index.ts` — `detect(text): Identifier[]`, `mask(text, decisions): {text, map}`, date-shift.
- `lib/summary/schema.ts` — Zod schema for the EM summary (12 blocks, sentence+citation+label).
- `lib/summary/emTemplate.ts` — EM system prompt + block order.
- `lib/summary/summarize.ts` — OpenAI call (structured output) + post-validation (citation enforcement, label check).
- `lib/summary/slopLint.ts` — clinical lint rules over a produced summary.
- `lib/span.ts` — `resolveSpan(sourceText, quote): {start,end}|null` exact-span matcher.
- `lib/costGuard.ts` — daily spend counter + circuit breaker (Supabase-backed in Phase 3; in-memory-testable interface).
- `lib/supabase.ts` — server client + typed helpers.
- `app/api/deid-preview/route.ts` — POST text → detected identifiers + proposed masked text.
- `app/api/summarize/route.ts` — POST confirmed masked text + specialty + focus → summary + spans; persists de-identified artifacts.
- `app/api/documents/[id]/route.ts` — DELETE (anonymous delete link).
- `app/(routes)` — landing / upload / result pages wired from `mockups-v2/`.
- Tests: `*.test.ts` colocated (Vitest).

Build order is phased. **Phases 0–1 need no credentials and are fully TDD-able now.** Phases 2–4 need Supabase + OpenAI keys. Phase 5 wires the frozen UI.

---

## Phase 0 — Scaffold

### Task 0.1: Next.js + TypeScript + Vitest scaffold
**Files:** Create `package.json`, `tsconfig.json`, `next.config.mjs`, `vitest.config.ts`, `app/layout.tsx`, `app/page.tsx`, `.env.example`, `.gitignore`.

- [ ] Step 1: `npx create-next-app@latest . --typescript --app --eslint --no-tailwind --use-npm --yes` (into the existing dir; keep `mockups/`, `mockups-v2/`, `docs/`).
- [ ] Step 2: `npm i -D vitest @vitest/coverage-v8` and add `"test": "vitest run"` to package.json scripts.
- [ ] Step 3: `npm i zod @supabase/supabase-js ai @ai-sdk/openai` (AI SDK + OpenAI provider).
- [ ] Step 4: Create `.env.example` with `NEXT_PUBLIC_SUPABASE_URL=`, `SUPABASE_SERVICE_ROLE_KEY=`, `OPENAI_API_KEY=`, `OPENAI_MODEL=gpt-5.5`, `DAILY_SPEND_CAP_USD=20`.
- [ ] Step 5: Add a trivial `lib/health.test.ts` (`expect(1+1).toBe(2)`), run `npm test`, expect PASS.
- [ ] Step 6: Commit `feat: scaffold next.js app + vitest + deps`.

---

## Phase 1 — Pure core logic (no credentials; TDD)

### Task 1.1: Chunking
**Interfaces:** Produces `type Chunk = { id: string; start: number; end: number; line: number; text: string }` and `chunkText(text: string): Chunk[]`.
- [ ] Failing test `lib/chunking.test.ts`: given a 3-line clinical note, returns chunks with correct `start`/`end` char offsets that slice back to the original substring (`text.slice(c.start,c.end) === c.text`), stable ids.
- [ ] Run → FAIL. Implement line/sentence-boundary chunker preserving offsets. Run → PASS. Commit.

### Task 1.2: De-id detection (regex recognizers)
**Interfaces:** Produces `type Identifier = { kind: 'rrn'|'phone'|'email'|'date'|'mrn'|'name'; start: number; end: number; text: string }` and `detect(text: string): Identifier[]`.
- [ ] Failing test: RRN `900101-1234567`, 전화 `010-1234-5678`, email, `2026-06-18`, MRN-like `MRN: 00123456` are each detected with correct spans; a normal clinical sentence yields none of these false-positively for rrn/phone.
- [ ] Run → FAIL. Implement recognizers in `lib/deid/rules.ts`. Run → PASS. Commit.

### Task 1.3: De-id masking + date-shift
**Interfaces:** Consumes `Identifier[]`; produces `mask(text, identifiers, opts): { masked: string; shiftDays: number }` (identifiers → `███`, dates shifted by a consistent random offset that preserves intervals).
- [ ] Failing test: masking replaces each identifier span with a block; two dates 3 days apart remain 3 days apart after shift; masked text contains no original RRN.
- [ ] Run → FAIL. Implement. Run → PASS. Commit.

### Task 1.4: Exact-span resolver
**Interfaces:** Produces `resolveSpan(sourceText: string, quote: string): {start:number; end:number} | null` (finds the quote's exact char span; returns null if not found / ambiguous).
- [ ] Failing test: a quote present verbatim resolves to correct offsets; a paraphrase not present returns null; whitespace-normalized match still resolves.
- [ ] Run → FAIL. Implement. Run → PASS. Commit.

### Task 1.5: EM summary schema + citation enforcement
**Interfaces:** Produces Zod `SummarySchema` — 12 ordered blocks (`acuity, oneLiner, riskModifiers, immediateThreats, pending, hpi, vitals, keyLabs, ddx{working,cannotMiss,ruledOut}, txResponse, disposition, gaps`); each item = `{ text: string; citations: string[]; label: 'explicit'|'derived'|'uncertain' }`. Produces `enforceCitations(summary, chunks): Summary` (drops any item with empty `citations` or citations not resolvable to a span).
- [ ] Failing test: an item with `citations: []` is dropped; an item citing a nonexistent chunk id is dropped; a valid item survives; block order is preserved.
- [ ] Run → FAIL. Implement schema + enforcement (uses Task 1.4 to verify each citation resolves). Run → PASS. Commit.

### Task 1.6: Clinical slop-lint
**Interfaces:** Produces `slopLint(summary): LintFinding[]` — rules: lab mention without a number, trend without a time, treatment-response missing before OR after, abnormal-only labs with a known normal critical omitted, mixed timepoints.
- [ ] Failing test: "Troponin 상승" (no number) flags; "Troponin 0.8→2.1 (19:22→20:46)" passes; a trend with no time flags.
- [ ] Run → FAIL. Implement rules. Run → PASS. Commit.

---

## Phase 2 — Data layer (needs Supabase creds)
> Gate: requires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Bite-sized steps expanded at execution.

### Task 2.1: Schema + migrations
Tables: `documents(id, session_id, specialty, status, created_at)`, `chunks(id, document_id, start, end, line, text)`, `summaries(id, document_id, specialty, content jsonb, model, created_at)`. **Only de-identified text is stored.** Storage bucket for de-identified source text blob. Test against a Supabase test project (or `supabase start` local) that insert/select round-trips; assert no column ever receives raw pre-mask text (enforced by passing only masked text into the persistence helper).

### Task 2.2: Persistence helpers + anonymous delete
`saveDocument(...)`, `getDocument(id)`, `deleteDocument(id)` in `lib/supabase.ts`. Delete route removes doc+chunks+summary+blob. Test round-trip + delete removes all rows.

---

## Phase 3 — Summarization (needs OpenAI creds)
> Gate: requires `OPENAI_API_KEY`, `OPENAI_MODEL`. Confirm actual GPT-5.x model availability first.

### Task 3.1: Cost guard
`costGuard.canSpend(estUSD)` / `record(usd)` backed by a daily counter (Supabase table `spend_ledger(day, usd)`). Test: at/over `DAILY_SPEND_CAP_USD` returns false; resets per day. (Pure logic testable with an injected clock + in-memory store before wiring Supabase.)

### Task 3.2: EM summarization call
`summarize(maskedText, chunks, specialty, focus?)` → uses AI SDK `generateObject` with `SummarySchema`, EM system prompt (block order + "cite chunk ids, output '기록 없음' when absent, no fabrication"), token caps. Then `enforceCitations` (1.5) + assign/verify `label` + `slopLint` (1.6). Test with a recorded/mocked model response (fixture) that: uncited sentences are dropped, labels present, spans resolve. Live smoke test on the messy chest-pain fixture behind the cost guard.

---

## Phase 4 — API routes + public safeguards
### Task 4.1: `/api/deid-preview` — POST raw text → `detect`+`mask`, return identifiers + masked text (raw NOT persisted). 
### Task 4.2: `/api/summarize` — POST confirmed masked text + specialty + focus → cost-guard check → `summarize` → persist de-identified doc/chunks/summary → return summary + resolved spans.
### Task 4.3: Safeguards — signed upload token, per-IP + per-session rate limit (Vercel BotID/Turnstile), page/size caps, no PII in logs.
Each task: route handler + integration test (mocked model, real de-id/chunk/span logic).

---

## Phase 5 — Wire frozen UI (mockups-v2 → live)
Convert `mockups-v2/landing.html|upload.html|result.html` into App Router pages/components, wired to the Phase 4 APIs: upload → de-id preview+confirm screen → summarize → split-view with click→exact-span highlight + evidence popover. Preserve the frozen visual design; only make it functional. (Design refinement — info-density reduction + cinematic video/images — is a SEPARATE later effort, not in this plan.)

---

## Self-Review
- **Spec coverage:** upload✓(4.1/5) chunking✓(1.1) de-id+preview/confirm✓(1.2/1.3/4.1/5) EM template+citation+labels✓(1.5/3.2) exact-span✓(1.4/5) slop-lint✓(1.6) split-view✓(5) cost cap✓(3.1) delete link✓(2.2) anon session✓(session.ts) de-id-only storage✓(2.1). Image OCR / 25 other specialties correctly OUT (Global Constraints).
- **Placeholder scan:** Phases 0–1 are full bite-sized TDD. Phases 2–5 are task-level with interfaces + intent; each expands to bite-sized steps at execution (subagent-driven-development) once its credential gate is met — this is deliberate scoping, not an unresolved placeholder.
- **Type consistency:** `Chunk`, `Identifier`, `SummarySchema` item shape are defined once (1.1/1.2/1.5) and reused; `resolveSpan` (1.4) is consumed by 1.5 and 4.2/5.
