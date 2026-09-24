/* 14 · The complete system — every layer assembled, animated into place. */

import { svgEl, prefersReducedMotion } from '../lib/util'
import { SYSTEM_NODES, SYSTEM_LINKS, SYSTEM_STRIP, SYSTEM_ZONES } from '../data/content'
import { getLang, onChange } from '../i18n'

function center(n: { x: number; y: number; w: number; h: number }, side: 'top' | 'bottom' | 'left' | 'right') {
  const cx = n.x + n.w / 2
  switch (side) {
    case 'top': return { x: cx, y: n.y }
    case 'bottom': return { x: cx, y: n.y + n.h }
    case 'left': return { x: n.x, y: n.y + n.h / 2 }
    default: return { x: n.x + n.w, y: n.y + n.h / 2 }
  }
}

export function initSystem(): void {
  const svgHost = document.getElementById('system-svg')
  const figure = document.querySelector('#system')?.querySelector('figure') as HTMLElement | null
  if (!svgHost || !figure) return
  const svg = svgHost as unknown as SVGSVGElement
  const fig: HTMLElement = figure
  const reduced = prefersReducedMotion()
  let assembled = false

  function render() {
    const lang = getLang()
    svg.innerHTML = ''

    /* zones */
    const zoneDevice = svgEl('rect', { x: 144, y: 8, width: 496, height: 528, rx: 18, class: 'sys-zone' })
    const zoneRadio = svgEl('rect', { x: 584, y: 300, width: 272, height: 350, rx: 18, class: 'sys-zone' })
    svg.appendChild(zoneDevice)
    svg.appendChild(zoneRadio)
    const zl1 = svgEl('text', { x: 160, y: 30, class: 'sys-zone-label' })
    zl1.textContent = SYSTEM_ZONES.z1[lang]
    const zl2 = svgEl('text', { x: 600, y: 322, class: 'sys-zone-label' })
    zl2.textContent = SYSTEM_ZONES.z2[lang]
    svg.appendChild(zl1)
    svg.appendChild(zl2)

    /* links */
    SYSTEM_LINKS.forEach((l) => {
      const a = SYSTEM_NODES[l.a]
      const b = SYSTEM_NODES[l.b]
      let p1 = center(a, 'bottom')
      let p2 = center(b, 'top')
      if (l.a === 6 && l.b === 9) { p1 = center(a, 'right'); p2 = center(b, 'left') }
      const mid = `M ${p1.x} ${p1.y} C ${p1.x} ${(p1.y + p2.y) / 2}, ${p2.x} ${(p1.y + p2.y) / 2}, ${p2.x} ${p2.y}`
      const straight = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`
      const d = l.a === 6 ? straight : Math.abs(p1.x - p2.x) < 2 ? straight : mid
      svg.appendChild(
        svgEl('path', {
          d,
          class: 'sys-link' + (l.flow ? ' flow' : ''),
          ...(l.dashed ? { 'stroke-dasharray': '4 5' } : {}),
        }),
      )
    })

    /* nodes */
    SYSTEM_NODES.forEach((n) => {
      const g = svgEl('g', { class: 'sys-node' })
      g.appendChild(
        svgEl('rect', {
          x: n.x, y: n.y, width: n.w, height: n.h, rx: 10,
          class: 'sys-box' + (n.kind === 'accent' ? ' accent' : n.kind === 'warn' ? ' warnbox' : n.kind === 'ext' ? ' ext' : ''),
        }),
      )
      const label = svgEl('text', { x: n.x + n.w / 2, y: n.y + (n.sub ? 20 : n.h / 2 + 4), 'text-anchor': 'middle', class: 'sys-label' })
      label.textContent = n.label[lang]
      g.appendChild(label)
      if (n.sub) {
        const sub = svgEl('text', { x: n.x + n.w / 2, y: n.y + 34, 'text-anchor': 'middle', class: 'sys-sub' })
        sub.textContent = n.sub[lang]
        g.appendChild(sub)
      }
      svg.appendChild(g)
    })

    /* over-time strip */
    const strip = svgEl('g', { class: 'sys-node' })
    strip.appendChild(svgEl('rect', { x: 170, y: 652, width: 660, height: 44, rx: 10, class: 'sys-box ext' }))
    const st = svgEl('text', { x: 500, y: 678, 'text-anchor': 'middle', class: 'sys-label' })
    st.textContent = SYSTEM_STRIP[lang]
    strip.appendChild(st)
    svg.appendChild(strip)

    /* stagger + assemble state */
    const nodes = Array.from(svg.querySelectorAll<SVGElement>('.sys-node'))
    nodes.forEach((el, i) => { el.style.transitionDelay = `${i * 70}ms` })
    fig.classList.add('assemble')
    if (assembled || reduced) figure!.classList.add('in')
  }

  if (!reduced) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          assembled = true
          fig.classList.add('in')
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(figure)
  }

  render()
  onChange(render)
}
