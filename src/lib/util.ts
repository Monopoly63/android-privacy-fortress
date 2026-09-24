/* Shared utilities: motion preferences, reveals, math helpers. */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

export const smoothstep = (t: number): number => t * t * (3 - 2 * t)

/**
 * Piecewise-linear ramp through [position, value] stops.
 * `ramp(0.5, [[0,0],[1,10]])` → 5.
 */
export function ramp(x: number, stops: Array<[number, number]>): number {
  if (x <= stops[0][0]) return stops[0][1]
  for (let i = 0; i < stops.length - 1; i++) {
    const [x0, y0] = stops[i]
    const [x1, y1] = stops[i + 1]
    if (x >= x0 && x <= x1) {
      const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0)
      return lerp(y0, y1, smoothstep(t))
    }
  }
  return stops[stops.length - 1][1]
}

/** Reveal-on-scroll: adds `.in` when an element enters the viewport. */
export function initReveals(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
  if (prefersReducedMotion()) {
    els.forEach((el) => el.classList.add('in'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  els.forEach((el) => io.observe(el))
}

/** Detect WebGL support once. */
export function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Force a style swap animation (re-trigger CSS keyframes on a panel). */
export function swapPanel(el: HTMLElement): void {
  el.classList.remove('swap')
  // reflow so the animation restarts
  void el.offsetWidth
  el.classList.add('swap')
}

export const svgNS = 'http://www.w3.org/2000/svg'

export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(svgNS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v))
  return el
}
