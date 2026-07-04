'use client';

import { useEffect, useRef, useState } from 'react';
import { SPECIALTIES, type Specialty, type Template } from '@/lib/specialties';
import { SpecialtyPicker, type Picked } from '../components/SpecialtyPicker';
import { ChartLens } from '../components/ChartLens';
import { getSessionId } from '@/lib/session';
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

type Stage = 'pick' | 'input' | 'preview' | 'result';
const STEP_LABELS: [Stage, string][] = [
  ['pick', '01 분과'], ['input', '02 차트'], ['preview', '03 확인'], ['result', '04 결과'],
];

const LABEL_KO: Record<ResolvedItem['label'], string> = { explicit: '원문', derived: '추론', uncertain: '불확실' };

export default function Home() {
  const [stage, setStage] = useState<Stage>('pick');
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [sub, setSub] = useState<Template | null>(null);
  const [pickedLabel, setPickedLabel] = useState('');
  const [text, setText] = useState('');
  const [focus, setFocus] = useState('');
  const [consent, setConsent] = useState(false);
  const [masked, setMasked] = useState('');
  const [idCount, setIdCount] = useState(0);
  const [summary, setSummary] = useState<ResolvedSummary | null>(null);
  const [lint, setLint] = useState<{ rule: string }[]>([]);
  const [sel, setSel] = useState<ResolvedItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [err, setErr] = useState('');
  const markRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sel && markRef.current) markRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [sel]);

  // deep-link from the landing droplet: /app?s=<specialtyId>&sub=<subId>
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const sid = q.get('s');
    if (!sid) return;
    const sp = SPECIALTIES.find((x) => x.id === sid);
    if (!sp) return;
    const t = sp.subspecialties?.find((u) => u.id === q.get('sub')) ?? null;
    setSpecialty(sp); setSub(t); setPickedLabel(t ? t.name : sp.name); setStage('input');
  }, []);

  const template: Template | null = sub ?? specialty;
  const chosenName = pickedLabel || specialty?.name;

  function onPick(p: Picked) { setSpecialty(p.specialty); setSub(p.sub); setPickedLabel(p.label); setStage('input'); }

  async function onFile(f: File) {
    setExtracting(true); setErr('');
    try {
      const fd = new FormData(); fd.append('file', f);
      const r = await fetch('/api/extract', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'error');
      setText(j.text);
    } catch (e) { setErr((e as Error).message); } finally { setExtracting(false); }
  }

  async function preview() {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/deid-preview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'error');
      setMasked(j.masked); setIdCount(j.identifiers.length); setStage('preview');
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  async function run() {
    if (!specialty) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/summarize', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ maskedText: masked, specialtyId: specialty.id, subId: sub?.id, focus: focus || undefined, sessionId: getSessionId() }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'error');
      setSummary(j.summary); setLint(j.lint ?? []); setSel(null); setStage('result');
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  function reset() {
    setStage('pick'); setSpecialty(null); setSub(null); setPickedLabel('');
    setText(''); setFocus(''); setConsent(false); setMasked(''); setSummary(null); setSel(null); setErr('');
  }

  return (
    <main>
      <header className="top">
        <div className="wrap">
          <span className="brand">gatherEMR</span>
          <span className="crumb">
            {STEP_LABELS.map(([s, t], i) => (
              <span key={s}>{i > 0 && ' · '}<b style={{ color: stage === s ? undefined : 'var(--muted)' }}>{t}</b></span>
            ))}
          </span>
        </div>
      </header>

      <div className="wrap">
        {err && <div className="alert">⚠ {err}</div>}

        {stage === 'pick' && (
          <section className="step panel sheet">
            <h1 className="q ink play">어느 분과세요?</h1>
            <p className="sub">차트를 자기 분과 관점으로 요약해 드립니다. 계열을 눌러 펼치고 분과를 고르세요.</p>
            <SpecialtyPicker onPick={onPick} />
          </section>
        )}

        {stage === 'input' && template && (
          <section className="step panel sheet">
            <button className="back" onClick={() => setStage('pick')}>← 분과 선택</button>
            <h1 className="q ink play">차트를 붙여넣으세요</h1>
            <p className="sub"><b>{chosenName}</b> 관점으로 요약합니다. 식별정보는 다음 단계에서 가립니다.</p>
            <div className="row" style={{ marginBottom: 8 }}>
              <label className="btn ghost" style={{ cursor: extracting ? 'default' : 'pointer', opacity: extracting ? 0.6 : 1 }}>
                {extracting ? '추출 중…' : '📎 파일 첨부'}
                <input type="file" hidden disabled={extracting}
                  accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.heic,.hwp,.hwpx,.docx,.pptx,.xlsx"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ''; }} />
              </label>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>PDF · 이미지 · HWP · DOCX — 또는 아래에 붙여넣기</span>
            </div>
            <textarea className="ta mono" value={text} onChange={(e) => setText(e.target.value)} placeholder="EMR 케이스 텍스트를 붙여넣거나, 위에서 파일을 첨부하세요 (추출된 텍스트가 여기 표시됩니다)" />
            <div className="chips">
              {template.chips.map((c) => (
                <button key={c} className={`chip${focus === c ? ' on' : ''}`} onClick={() => setFocus(focus === c ? '' : c)}>{c}</button>
              ))}
            </div>
            <details className="oneline">
              <summary>직접 입력 (선택)</summary>
              <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="예: 이번 입원 신장기능 변화 중심으로" />
            </details>
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>비식별 교육·연구용 케이스이며, 비식별본 저장에 동의합니다.</span>
            </label>
            <div className="row">
              <button className="btn" disabled={busy || !text.trim() || !consent} onClick={preview}>{busy ? '처리 중…' : '비식별 확인 →'}</button>
              <button className="btn ghost" onClick={() => setText(SAMPLE)}>샘플 채우기</button>
            </div>
          </section>
        )}

        {stage === 'preview' && (
          <section className="step panel sheet">
            <button className="back" onClick={() => setStage('input')}>← 수정</button>
            <h1 className="q ink play">전송 전 비식별 확인</h1>
            <p className="sub">식별자 후보 <b>{idCount}</b>건을 <span className="mono">███</span>로 가리고 날짜를 시프트했습니다. 남은 식별정보가 없는지 확인 후 요약하세요. (OpenAI엔 이 비식별본만 전송됩니다.)</p>
            <ChartLens text={masked} className="preview-box" />
            <p className="hint-lens">커서로 훑어 남은 식별정보를 확인하세요.</p>
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn" disabled={busy} onClick={run}>{busy ? `${chosenName} 요약 중… (~20s)` : `확인했습니다 · ${chosenName} 요약 →`}</button>
            </div>
          </section>
        )}

        {stage === 'result' && summary && (
          <section className="step" style={{ paddingBottom: 40 }}>
            <div className="row" style={{ justifyContent: 'space-between', margin: '14px 0 10px' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                <b style={{ color: 'var(--ink)' }}>{chosenName}</b> 요약 · 문장을 누르면 → 오른쪽 원문 위치로.
              </div>
              <button className="btn ghost" onClick={reset}>새 케이스</button>
            </div>
            {lint.length > 0 && <div className="lintbar">slop-린트 {lint.length}건 (참고): {lint.map((l) => l.rule).join(', ')}</div>}
            <div className="split">
              <div className="pane">
                <h3>{chosenName} 요약</h3>
                {summary.cannotMiss.length > 0 && (
                  <div className="warn">
                    <div className="blk-title">⚠️ 놓치면 안 될 것</div>
                    {summary.cannotMiss.map((it, i) => <Item key={i} it={it} sel={sel} onSel={setSel} />)}
                  </div>
                )}
                <Block title="한 줄 문제표상" items={summary.oneLiner} sel={sel} onSel={setSel} />
                {summary.blocks.map((b, i) => (
                  <div key={i}>
                    <div className="blk-title">{String(i + 1).padStart(2, '0')} · {b.title}</div>
                    {b.items.map((it, j) => <Item key={j} it={it} sel={sel} onSel={setSel} />)}
                  </div>
                ))}
                <Block title="투약·치료 변경" items={summary.medChanges} sel={sel} onSel={setSel} />
                <Block title="⚠ 불확실·누락" items={summary.gaps} sel={sel} onSel={setSel} />
              </div>
              <div className="pane right">
                <h3>비식별 원문</h3>
                <pre className="orig mono">
                  {sel ? (<>{masked.slice(0, sel.span.start)}<mark ref={markRef}>{masked.slice(sel.span.start, sel.span.end)}</mark>{masked.slice(sel.span.end)}</>) : masked}
                </pre>
                {sel && (
                  <div className="ev">
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>선택한 근거</div>
                    <div><b>주장</b> {sel.text}</div>
                    {sel.quote && <div style={{ marginTop: 3 }}><b>원문 인용</b> <span className="mono">“{sel.quote}”</span></div>}
                    <div style={{ marginTop: 3 }}><b>라벨</b> <Badge label={sel.label} /> · <b>인용 청크</b> {sel.citations.join(', ')}</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Badge({ label }: { label: ResolvedItem['label'] }) {
  return <span className={`badge ${label}`}>{LABEL_KO[label]}</span>;
}

function Item({ it, sel, onSel }: { it: ResolvedItem; sel: ResolvedItem | null; onSel: (i: ResolvedItem) => void }) {
  return (
    <button className={`item${it === sel ? ' on' : ''}`} onClick={() => onSel(it)}>
      <Badge label={it.label} /> <span style={{ marginLeft: 4 }}>{it.text}</span>
    </button>
  );
}

function Block({ title, items, sel, onSel }: { title: string; items: ResolvedItem[]; sel: ResolvedItem | null; onSel: (i: ResolvedItem) => void }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="blk-title">{title}</div>
      {items.map((it, i) => <Item key={i} it={it} sel={sel} onSel={onSel} />)}
    </div>
  );
}
