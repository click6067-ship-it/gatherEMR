import Link from 'next/link';
import { GROUPS, SPECIALTIES } from '@/lib/specialties';

export function SpecialtiesSection() {
  return (
    <section id="specialties" className="sec">
      <div className="wrapx">
        <h2 className="sec-h2 reveal">25개 분과별로, 그 분과가 가장 먼저 보는 주제 중심으로 정리합니다.</h2>
        <div className="grp-list">
          {GROUPS.map((gr, i) => (
            <div key={gr.id} className="grp reveal" style={{ ['--c' as string]: gr.color, ['--ri' as string]: i } as React.CSSProperties}>
              <span className="grp-name">{gr.label}</span>
              <span className="grp-chips">
                {SPECIALTIES.filter((s) => s.group === gr.id).map((s) => (
                  <Link key={s.id} href="/app" className="grp-chip">{s.name}</Link>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
