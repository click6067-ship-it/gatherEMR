export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(v, max));
}

export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

/** Progress 0..1 through a pinned scrub section.
 *  top = wrapper.getBoundingClientRect().top; range = wrapHeight - viewportH. */
export function sectionProgress(top: number, wrapHeight: number, viewportH: number): number {
  const range = wrapHeight - viewportH;
  if (range <= 0) return top <= 0 ? 1 : 0;
  return clamp(-top / range, 0, 1);
}
