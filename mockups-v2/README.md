# gatherEMR mockups — ver2 (cinematic clinical)

Screens:

- `landing.html` — fully cinematic scroll narrative (the only place cinema is allowed).
- `upload.html` — calm lens picker + zero-friction upload.
- `result.html` — calm split-view product core: urgency-first EM summary ↔ de-identified source chart.

## How ver2 is cinematic without being slop

The cinema is built from the product's own material, not decoration. The landing rides **one real case's clock** (18:42 Triage → 21:10 pending troponin): a fixed timeline rail fills as you scroll and ticks through the case's actual timestamps; scene eyebrows are chart-style time markers. The three scroll scenes are the product's argument in film form — (1) seven real chart fragments stack up with their real contradictions flagged, (2) the same lines reorder into the EM priority list, (3) a summary claim draws a literal line to its exact source span under the statement "AI 요약을 100% 믿지 마세요." There are no orbs, no purple gradients, no marketing copy — atmosphere comes from dim monospace chart text, a cold blue-black "night shift" palette, and one ECG trace that draws itself on load. Red appears only on clinical conflicts and cannot-miss risk.

All motion is progressive enhancement: without JS or with `prefers-reduced-motion`, the landing collapses to a fully readable static page (`html.fx` gates every effect).

## Why the tool screens stay calm

Upload and result are used by time-pressured, skeptical doctors; motion there would be a different kind of slop. They keep the light clinical-paper surface and inherit ver2 only through the thin night-band header, the sharpened 2px geometry, and the mono "clinical voice" for labels. Their upgrades are workflow, not spectacle: the source chart pane is sticky so evidence stays in view while scrolling the summary; evidence tags use shape + color (● 원문 / ◐ 추론 / ○ 불확실) so they scan without reading; summary blocks are numbered 01–12 because the EM priority order *is* the product's thesis; the troponin trend gets a tiny sparkline with an honest hollow "pending" point.

Self-contained: system font stack, inline CSS/JS only, no external requests.

Deterministic anti-slop check (sloplint, 11 rules): all pages pass except two knowingly-kept signals — `allcaps-eyebrow` (the mono uppercase labels are EMR chart-section headers, the subject's native artifact, not marketing eyebrows) and `emoji-headings` on result.html (`🚨 즉각 위협` / `⚠️ 불확실·누락` are the product's fixed block titles, mandated content).
