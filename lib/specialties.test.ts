import { describe, it, expect } from 'vitest';
import { SPECIALTIES, GROUPS, findSpecialty, resolveTemplate, type Template } from './specialties';

describe('specialty registry', () => {
  it('has 26 specialties across the 4 groups (internal 8, surgical 9, diagnostic 6, emergency 3)', () => {
    expect(SPECIALTIES).toHaveLength(26);
    expect(GROUPS.map((g) => g.id)).toEqual(['internal', 'surgical', 'diagnostic', 'emergency']);
    const count = (g: string) => SPECIALTIES.filter((s) => s.group === g).length;
    expect(count('internal')).toBe(8);
    expect(count('surgical')).toBe(9);
    expect(count('diagnostic')).toBe(6);
    expect(count('emergency')).toBe(3);
  });

  it('내과 carries 9 subspecialties', () => {
    expect(findSpecialty('internal-medicine')?.subspecialties).toHaveLength(9);
  });

  it('every id is unique (specialties + subspecialties)', () => {
    const ids = SPECIALTIES.flatMap((s) => [s.id, ...(s.subspecialties ?? []).map((t) => t.id)]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every template (and subspecialty) has non-empty lens/blocks/cannotMiss/chips', () => {
    const check = (t: Template) => {
      expect(t.lens.length, `${t.name} lens`).toBeGreaterThan(0);
      expect(t.blocks.length, `${t.name} blocks`).toBeGreaterThan(0);
      expect(t.cannotMiss.length, `${t.name} cannotMiss`).toBeGreaterThan(0);
      expect(t.chips.length, `${t.name} chips`).toBeGreaterThan(0);
    };
    for (const s of SPECIALTIES) {
      check(s);
      (s.subspecialties ?? []).forEach(check);
    }
  });

  it('resolveTemplate returns subspecialty, specialty, or null', () => {
    expect(resolveTemplate('internal-medicine', 'cardio')?.name).toBe('순환기내과');
    expect(resolveTemplate('internal-medicine')?.name).toBe('내과');
    expect(resolveTemplate('emergency')?.name).toBe('응급의학과');
    expect(resolveTemplate('nope')).toBeNull();
    // unknown subId falls back to the specialty itself
    expect(resolveTemplate('emergency', 'cardio')?.name).toBe('응급의학과');
  });
});
