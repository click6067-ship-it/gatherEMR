'use client';

import { useEffect, useRef, useState } from 'react';
import type { ResolvedItem, ResolvedSummary } from '@/lib/summary/summarize';

const SAMPLE = `[Triage 2026-06-18 18:42]
Name: 홍길동  MRN: 00123456  Age/Sex: 67/M
CC: chest discomfort, SOB
Vitals: BP 168/94, HR 104, RR 22, SpO2 91% room air
Pain 7/10, sweating (+), left shoulder radiation (+)
[Nursing 18:51] "가슴이 꽉 막힌 느낌" onset about 1hr ago. O2 2L NC -> SpO2 95%. Home meds: "warfarin? 당뇨약" patient unsure.
[ED note 19:08] Pain now 3/10 after rest. Warfarin - not taking? (old AF?) Allergy: not documented.
[EKG 19:10] Sinus tach 102. Nonspecific ST-T. No STEMI criteria. QTc 458.
[Labs] Troponin-I 0.8 (19:22) -> 2.1 (20:46). Cr 1.8, eGFR 38, K 5.1, INR 1.7.
Repeat Troponin ordered 21:10 - pending at sign-out.`;

const CHIPS = ['🚨 놓치면 안 될 red flag 위주', '⏱️ 시간순 경과·활력징후 추세', '💊 감별진단·처치 우선순위'];

const LABELS = { explicit: '원문', derived: '추론', uncertain: '불확실' } as const;

const HEAD_BLOCKS: Array<[keyof ResolvedSummary, string]> = [
  ['acuity', 'Acuity — sick / not sick'],
  ['oneLiner', '한 줄 문제표상'],
  ['riskModifiers', 'Risk modifiers'],
  ['immediateThreats', '🚨 즉각 위협 & 지금 할 일'],
  ['pending', 'Pending / action list'],
  ['hpi', '주호소·발현 (HPI)'],
  ['vitals', '활력징후 + 추세'],
  ['keyLabs', '핵심 검사·영상'],
];
const TAIL_BLOCKS: Array<[keyof ResolvedSummary, string]> = [
  ['txResponse', '처치·반응'],
  ['disposition', '처분·다음 단계'],
  ['gaps', '⚠️ 불확실·누락'],
];

const STEPS: Array<['input' | 'preview' | 'result', string]> = [
  ['input', '01 차트 입력'],
  ['preview', '02 비식별 확인'],
  ['result', '03 근거 연결 요약'],
];

type Span = { start: number; end: number };

export default function Home() {
  const [stage, setStage] = useState<'input' | 'preview' | 'result'>('input');
  const [text, setText] = useState('');
  const [focus, setFocus] = useState('');
  const [masked, setMasked] = useState('');
  const [idCount, setIdCount] = useState(0);
  const [summary, setSummary] = useState<ResolvedSummary | null>(null);
  const [lint, setLint] = useState<Array<{ rule: string; text: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sel, setSel] = useState<ResolvedItem | null>(null);
  const markRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sel && markRef.current) markRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [sel]);

  async function preview() {
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/deid-preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'error');
      setMasked(j.masked);
      setIdCount(j.identifiers.length);
      setStage('preview');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function run() {
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ maskedText: masked, focus: focus || undefined }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'error');
      setSummary(j.summary);
      setLint(j.lint ?? []);
      setSel(null);
      setStage('result');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStage('input');
    setSummary(null);
    setSel(null);
    setErr('');
  }

  return (
    <main>
      <header className="top">
        <div className="top__inner">
          <span className="brand">
            <b>gatherEMR</b>
            <span>응급의학과 v1 · 비식별 전용</span>
          </span>
          {stage === 'result' ? (
            <button type="button" className="tool" onClick={reset}>
              새 케이스
            </button>
          ) : (
            <span className="crumb" aria-hidden="true">
              {STEPS.map(([s, t], i) => (
                <span key={s}>
                  {i > 0 && ' → '}
                  <b data-on={stage === s ? 'true' : 'false'}>{t}</b>
                </span>
              ))}
            </span>
          )}
        </div>
      </header>

      {err && <div className="alert">⚠ {err}</div>}

      {stage === 'input' && (
        <>
          <section className="hero">
            <div className="hero__noise" aria-hidden="true">
              <pre>{`[Triage 18:42] CC: chest discomfort, SOB
BP 168/94  HR 104  RR 22  SpO2 91% RA
Pain 7/10, sweating (+), radiation (+)
[Nursing 18:51] 운동 후 "가슴이 꽉 막힌 느낌"
onset: pt says "about 1 hr ago"
Home meds: "warfarin? 당뇨약, 혈압약"
[ED MD 19:08] M/67 DM/HTN/CKD3
Pain now 3/10 after rest.
Warfarin - not taking? (old AF?)
Allergy: not documented.`}</pre>
              <pre>{`[EKG 19:10] Sinus tachycardia 102/min
Nonspecific ST-T abnormality. QTc 458.
[Labs 19:22] Troponin-I 0.8 ng/mL
Hb 10.2  Cr 1.8  K 5.1  INR 1.7
[Labs 20:46] Troponin-I 2.1 ng/mL ↑
Repeat ordered 21:10 - pending.
[Tx 19:18] Aspirin 300 mg chewed.
19:21 NTG SL x1. 7/10 → 3/10.
Heparin order 20:55 in CPOE;
administration record not signed.`}</pre>
              <pre>{`[Imaging] CXR portable:
mild pulmonary congestion?
no pneumothorax mentioned.
CTA chest not ordered.
[Consult 20:58] Cardiology
requested - callback pending.
[Sign-out] high-risk chest pain
serial troponin, monitor,
reconcile anticoagulation
door-to-EKG time uncertain`}</pre>
            </div>
            <div className="hero__inner">
              <p className="eyebrow">[ Triage 18:42 · M/67 · Chest discomfort ]</p>
              <h1>
                차트는 그대로,
                <br />
                판단은 빠르게.
              </h1>
              <p className="lede">비식별 EMR 케이스를 응급의학과 우선순위로 재정렬합니다. 모든 문장은 클릭 한 번으로 원문 근거로 돌아갑니다.</p>
              <svg className="ecg" viewBox="0 0 1200 140" role="img" aria-label="심전도 리듬 스트립 형태의 장식 선">
                <path
                  pathLength="1"
                  d="M0,84 h60 q7,-10 14,0 h10 l4,6 l7,-58 l8,64 l5,-12 h12 q12,-14 24,0 h70 q7,-10 14,0 h10 l4,6 l7,-58 l8,64 l5,-12 h12 q12,-14 24,0 h24 l6,10 l10,-64 l12,70 l6,-16 h14 q14,-18 28,0 h90 q7,-10 14,0 h10 l4,6 l7,-58 l8,64 l5,-12 h12 q12,-14 24,0 h70 q7,-10 14,0 h10 l4,6 l7,-58 l8,64 l5,-12 h12 q12,-14 24,0 h70 q7,-10 14,0 h10 l4,6 l7,-58 l8,64 l5,-12 h12 q12,-14 24,0 h70 q7,-10 14,0 h10 l4,6 l7,-58 l8,64 l5,-12 h12 q12,-14 24,0 h152"
                />
              </svg>
              <div className="legend" aria-label="근거 상태 표기">
                <span>
                  <Badge label="explicit" /> 차트에 그대로 존재
                </span>
                <span>
                  <Badge label="derived" /> 원문을 연결해 도출
                </span>
                <span>
                  <Badge label="uncertain" /> 상충·누락, 확인 필요
                </span>
              </div>
            </div>
          </section>
          <section className="stage stage--overlap">
            <div className="panel">
              <div className="panel__head">
                <h2>Step 01 · 차트 입력</h2>
                <span>text · 로그인 없음</span>
              </div>
              <div className="panel__body">
                <textarea
                  className="input-area"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="EMR 케이스 텍스트를 붙여넣으세요 (식별정보는 자동으로 가립니다)"
                />
                <p className="chips-label">응급의학과 집중 포인트 · 탭으로 선택</p>
                <div className="chips">
                  {CHIPS.map((c) => (
                    <button key={c} type="button" className="chip" aria-pressed={focus === c} onClick={() => setFocus(focus === c ? '' : c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="actions">
                  <button type="button" className="primary" onClick={preview} disabled={busy || !text.trim()}>
                    {busy ? '처리 중…' : '비식별 미리보기 →'}
                  </button>
                  <button type="button" className="ghost" onClick={() => setText(SAMPLE)}>
                    messy 흉통 샘플 채우기
                  </button>
                </div>
              </div>
              <div className="note">저장형 서비스가 아닙니다 · 식별자는 전송 전 자동 마스킹 · 외부(OpenAI)에는 비식별본만 전송됩니다.</div>
            </div>
          </section>
        </>
      )}

      {stage === 'preview' && (
        <section className="stage">
          <div className="panel">
            <div className="panel__head">
              <h2>Step 02 · 전송 전 비식별 확인</h2>
              <span className="mono">{idCount} masked</span>
            </div>
            <div className="panel__body">
              <p className="panel__lede">
                식별자 후보 <strong>{idCount}</strong>건을 <span className="mono">███</span>로 가리고 날짜를 시프트했습니다. 남은 식별정보가 없는지 확인 후 요약하세요.
              </p>
              <pre className="masked-pre mono">{masked}</pre>
              <div className="actions">
                <button type="button" className="primary" onClick={run} disabled={busy}>
                  {busy ? 'GPT-5.x 요약 중… (~20s)' : '확인했습니다 · 응급의학과 요약 →'}
                </button>
                <button type="button" className="ghost" onClick={() => setStage('input')}>
                  ← 수정
                </button>
              </div>
            </div>
            <div className="note">외부(OpenAI)에는 이 비식별본만 전송됩니다.</div>
          </div>
        </section>
      )}

      {stage === 'result' && summary && (
        <div className="workspace">
          <section className="pane" aria-labelledby="summary-title">
            <div className="pane__head">
              <h1 id="summary-title">Emergency Medicine summary</h1>
              <span className="status">🚨 urgency-first</span>
            </div>
            {lint.length > 0 && (
              <div className="lintnote">
                slop-린트 {lint.length}건 (참고): <span className="mono">{lint.map((l) => l.rule).join(', ')}</span>
              </div>
            )}
            <div className="summary">
              {HEAD_BLOCKS.map(([k, title], i) => (
                <Block key={k} no={String(i + 1).padStart(2, '0')} title={title} items={summary[k] as ResolvedItem[]} sel={sel} onSel={setSel} big={k === 'acuity'} />
              ))}
              <section className="block">
                <BlockTitle no="09" title="감별 (DDx)" />
                <div className="columns">
                  <SubBlock title="Working Dx" items={summary.ddx.working} sel={sel} onSel={setSel} />
                  <SubBlock title="Cannot-miss 미배제" miss items={summary.ddx.cannotMiss} sel={sel} onSel={setSel} />
                  <SubBlock title="원문상 배제" items={summary.ddx.ruledOut} sel={sel} onSel={setSel} />
                </div>
              </section>
              {TAIL_BLOCKS.map(([k, title], i) => (
                <Block key={k} no={String(i + 10)} title={title} items={summary[k] as ResolvedItem[]} sel={sel} onSel={setSel} />
              ))}
            </div>
          </section>

          <section className="pane pane--chart" aria-labelledby="chart-title">
            <div className="pane__head">
              <h2 id="chart-title">De-identified original chart</h2>
              <span className="status status--calm">주장 클릭 ↔ 원문 span</span>
            </div>
            <div className="chart">
              <pre>
                {sel ? (
                  <>
                    {masked.slice(0, sel.span.start)}
                    <mark ref={markRef}>{masked.slice(sel.span.start, sel.span.end)}</mark>
                    {masked.slice(sel.span.end)}
                  </>
                ) : (
                  masked
                )}
              </pre>
            </div>
            {sel && (
              <aside className="evidence" aria-label="선택된 근거">
                <h3>선택된 근거 · claim ↔ span</h3>
                <dl>
                  <div>
                    <dt>주장</dt>
                    <dd>{sel.text}</dd>
                  </div>
                  {sel.quote && (
                    <div>
                      <dt>원문 인용</dt>
                      <dd>
                        <code>“{sel.quote}”</code>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>라벨</dt>
                    <dd>
                      <Badge label={sel.label} />
                    </dd>
                  </div>
                  <div>
                    <dt>인용 청크</dt>
                    <dd className="mono">{sel.citations.join(', ')}</dd>
                  </div>
                </dl>
              </aside>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function Badge({ label }: { label: keyof typeof LABELS }) {
  return (
    <span className={`tag tag--${label}`}>
      <span className="dot" aria-hidden="true" />
      {LABELS[label]}
    </span>
  );
}

function BlockTitle({ no, title }: { no: string; title: string }) {
  return (
    <h3 className="block__h">
      <i>{no}</i>
      {title}
    </h3>
  );
}

function Item({ it, sel, onSel, big }: { it: ResolvedItem; sel: ResolvedItem | null; onSel: (i: ResolvedItem) => void; big?: boolean }) {
  const active = it === sel;
  return (
    <button type="button" className={`line${active ? ' line--selected' : ''}`} onClick={() => onSel(it)}>
      <Badge label={it.label} />
      <span className={`line__text${big ? ' big' : ''}`}>{it.text}</span>
    </button>
  );
}

function Block({ no, title, items, sel, onSel, big }: { no: string; title: string; items: ResolvedItem[]; sel: ResolvedItem | null; onSel: (i: ResolvedItem) => void; big?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="block">
      <BlockTitle no={no} title={title} />
      {items.map((it, i) => (
        <Item key={i} it={it} sel={sel} onSel={onSel} big={big} />
      ))}
    </section>
  );
}

function SubBlock({ title, items, sel, onSel, miss }: { title: string; items: ResolvedItem[]; sel: ResolvedItem | null; onSel: (i: ResolvedItem) => void; miss?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`ddx${miss ? ' ddx--miss' : ''}`}>
      <b>{title}</b>
      {items.map((it, i) => (
        <Item key={i} it={it} sel={sel} onSel={onSel} />
      ))}
    </div>
  );
}
