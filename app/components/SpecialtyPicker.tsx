'use client';

import { useState } from 'react';
import { GROUPS, SPECIALTIES, type Specialty, type Template } from '@/lib/specialties';

export type Picked = { specialty: Specialty; sub: Template | null; label: string };

/** Accordion specialty selector. Collapsed = 4 계열 (symmetric). Click a 계열 →
 * its specialties as chips. 내과 has an extra level (click → 세부 inline, closed by
 * default so the top level stays symmetric). Click-to-open (works on touch). */
export function SpecialtyPicker({ onPick }: { onPick: (p: Picked) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [imOpen, setImOpen] = useState(false);

  return (
    <div className="picker">
      {GROUPS.map((g) => {
        const specs = SPECIALTIES.filter((s) => s.group === g.id);
        const isOpen = open === g.id;
        return (
          <div
            key={g.id}
            className={`sec${isOpen ? ' open' : ''}`}
            style={{ ['--c' as string]: g.color, ['--bg' as string]: g.soft } as React.CSSProperties}
          >
            <button className="sec-head" onClick={() => setOpen(isOpen ? null : g.id)} aria-expanded={isOpen}>
              <span className="bar" />
              <span className="nm">{g.label}</span>
              <span className="cn">{specs.length}</span>
              <span className="chev">▾</span>
            </button>
            {isOpen && (
              <div className="sec-body">
                {specs.map((s) =>
                  s.subspecialties && s.subspecialties.length ? (
                    <div key={s.id} className="im-wrap">
                      <button className={`chip im${imOpen ? ' on' : ''}`} onClick={() => setImOpen((o) => !o)} aria-expanded={imOpen}>
                        {s.name} <span className="more">▾{s.subspecialties.length}</span>
                      </button>
                      {imOpen && (
                        <div className="im-subs">
                          <span className="im-label">내과 세부 — 눌러서 선택</span>
                          <button className="sub gen" onClick={() => onPick({ specialty: s, sub: null, label: `${s.name} 일반` })}>
                            {s.name} 일반
                          </button>
                          {s.subspecialties.map((t) => (
                            <button key={t.id} className="sub" onClick={() => onPick({ specialty: s, sub: t, label: t.name })}>
                              {t.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button key={s.id} className="chip" onClick={() => onPick({ specialty: s, sub: null, label: s.name })}>
                      {s.name}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
