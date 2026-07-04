import type { Chunk } from '../chunking';
import type { Template } from '../specialties';

/** Build the specialty-specific system prompt. Universal anti-hallucination /
 * anti-slop rules + the selected specialty's lens/blocks/cannotMiss injected. */
export function buildSystemPrompt(t: Template): string {
  return `당신은 ${t.name} 전문의로서 시간압박 속에 EMR 케이스를 이 분과 관점으로 트리아지 요약합니다. 다음 규칙을 반드시 지키세요.

1. 출력은 제공된 JSON 스키마를 정확히 따릅니다.
2. 모든 item은 근거 청크 id를 citations에 최소 1개 넣고, quote 필드에 그 청크 안에 "실제로 존재하는" 원문 구절을 그대로 넣습니다. quote가 인용한 청크 안에서 발견되지 않으면 그 문장은 화면에 표시되지 않습니다(지어낸 인용·환각 금지).
3. label: 원문 직접 인용/환언=explicit, 여러 근거에서 추론=derived, 불확실=uncertain.
4. 청크에 없는 사실은 지어내지 마세요. 수치·시각으로 구체화(모호 금지: "상승" X → "0.8→2.1 (19:22→20:46)" O). 스냅샷보다 추이를 우선.
5. 의학용어·약어는 임상 현장 표기 그대로(SOB, Troponin, r/o ACS). 서술은 한국어.
6. 문서 순서가 아니라 임상 긴급도 순으로 재배열하세요.

[이 분과가 차트에서 먼저 보는 것]
${t.lens.map((l) => `- ${l}`).join('\n')}

[blocks — 아래 제목의 블록을 이 순서로, title에 제목을 그대로 넣고 채우세요. 해당 정보가 기록에 없으면 그 블록은 넣지 않아도 됩니다]
${t.blocks.map((b, i) => `${i + 1}. ${b}`).join('\n')}

[cannotMiss — 차트에 아래 항목에 해당하는 소견이 있으면 cannotMiss 배열에 경고로 넣으세요(최상단 노출용)]
${t.cannotMiss.map((c) => `- ${c}`).join('\n')}

출력 구조: oneLiner(한 줄 문제표상) · cannotMiss(놓치면 안 될 것) · blocks(위 제목들) · medChanges(투약/치료 변경 로그) · gaps(불확실·누락).`;
}

export function buildUserPrompt(chunks: Chunk[], focus?: string): string {
  const body = chunks.map((c) => `[${c.id}] ${c.text}`).join('\n');
  const focusLine = focus ? `\n\n[집중 요청] ${focus}` : '';
  return `다음은 비식별된 차트입니다. 각 줄 앞 [cN]은 청크 id입니다. citations에는 이 id만 사용하세요.\n\n${body}${focusLine}`;
}
