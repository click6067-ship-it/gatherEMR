'use client';

import { useState } from 'react';
import { GROUPS, SPECIALTIES, type Specialty, type Template } from '@/lib/specialties';

export type Picked = { specialty: Specialty; sub: Template | null; label: string };

/** Accordion specialty selector.
 * - 계열(top 4): opens on HOVER (desktop) with a smooth height animation; header
 *   click is the touch/keyboard fallback.
 * - 내과 세부: CLICK to reveal inline (closed by default → top level stays symmetric). */
export function SpecialtyPicker({ onPick }: { onPick: (p: Picked) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [imOpen, setImOpen] = useState(false);

  function setGroup(id: string | null) {
    setOpen(id);
    if (id === null) setImOpen(false); // reset 내과 세부 when the group closes
  }

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
            onMouseEnter={() => setGroup(g.id)}
            onMouseLeave={() => setGroup(null)}
          >
            <button className="sec-head" onClick={() => setGroup(isOpen ? null : g.id)} aria-expanded={isOpen}>
              <span className="bar" />
              <span className="nm">{g.label}</span>
              <span className="cn">{specs.length}</span>
              <span className="chev">▾</span>
            </button>
            <div className="sec-bodywrap">
              <div className="sec-body">
                {specs.map((s) =>
                  s.subspecialties && s.subspecialties.length ? (
                    <div key={s.id} className="im-wrap">
                      <button
                        className={`chip im${imOpen ? ' on' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setImOpen((o) => !o); }}
                        aria-expanded={imOpen}
                      >
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
