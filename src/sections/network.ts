/* 08 · Network modes — Direct / VPN / Tor with packets travelling the path. */

import { NET_MODES, type NetMode } from '../data/content'
import { svgEl, prefersReducedMotion } from '../lib/util'
import { getLang, onChange } from '../i18n'
import { ui } from '../i18n/ui'

export function initNetwork(): void {
  const tabsHostEl = document.getElementById('net-modes')
  const svgElHost = document.getElementById('net-svg')
  const captionEl = document.getElementById('net-caption')
  const factsEl = document.getElementById('net-facts')
  if (!tabsHostEl || !svgElHost || !captionEl || !factsEl) return
  const tabsHost: HTMLElement = tabsHostEl
  const svg: HTMLElement = svgElHost
  const caption: HTMLElement = captionEl
  const factsHost: HTMLElement = factsEl

  const reduced = prefersReducedMotion()
  let modeId: NetMode['id'] = 'direct'
  let raf = 0
  let packets: Array<{ el: SVGCircleElement; offset: number; plain: boolean }> = []
  let paths: Array<{ el: SVGPathElement; len: number }> = []

  const byId = (id: string) => NET_MODES.find((m) => m.id === id) ?? NET_MODES[0]

  function edgePath(a: { x: number; y: number }, b: { x: number; y: number }): string {
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const curve = Math.min(34, len * 0.16)
    const cx = mx - (dy / len) * curve
    const cy = my + (dx / len) * curve
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
  }

  function render() {
    const lang = getLang()
    const m = byId(modeId)

    /* tab labels + subs live in the static HTML — refresh them */
    tabsHost.querySelectorAll<HTMLButtonElement>('.net-mode').forEach((t) => {
      const id = t.dataset.mode as NetMode['id']
      const label = t.querySelector('.net-mode-label')!
      const sub = t.querySelector('small')!
      label.textContent = ui(`net.${id}`, lang)
      sub.textContent = ui(`net.${id}Sub`, lang)
      const on = id === m.id
      t.classList.toggle('active', on)
      t.setAttribute('aria-selected', String(on))
    })

    svg.innerHTML = ''
    packets = []
    paths = []

    /* edges */
    m.edges.forEach((e) => {
      const a = m.nodes[e.from]
      const b = m.nodes[e.to]
      const d = edgePath(a, b)
      if (e.tunnel) {
        svg.appendChild(svgEl('path', { d, class: 'net-edge-tunnel-halo' }))
        svg.appendChild(svgEl('path', { d, class: 'net-edge tunnel' }))
      } else {
        svg.appendChild(svgEl('path', { d, class: 'net-edge' }))
      }
      const p = svgEl('path', { d, fill: 'none', stroke: 'none' }) as SVGPathElement
      svg.appendChild(p)
      let len = Math.hypot(b.x - a.x, b.y - a.y)
      try {
        const measured = p.getTotalLength()
        if (Number.isFinite(measured) && measured > 0) len = measured
      } catch { /* geometry unavailable — chord length fallback */ }
      paths.push({ el: p, len })
    })

    /* nodes */
    m.nodes.forEach((n) => {
      const g = svgEl('g', {})
      g.appendChild(svgEl('circle', { cx: n.x, cy: n.y, r: 34, class: 'net-node-circle' }))
      const label = svgEl('text', { x: n.x, y: n.y + 52, 'text-anchor': 'middle', class: 'net-node-label' })
      label.textContent = n.label[lang]
      const sub = svgEl('text', { x: n.x, y: n.y + 66, 'text-anchor': 'middle', class: 'net-node-sub' })
      sub.textContent = n.sub[lang]
      const dot = svgEl('circle', { cx: n.x, cy: n.y, r: 3.5, fill: n.ext ? 'rgba(203,178,122,0.9)' : 'rgba(143,179,217,0.95)' })
      g.appendChild(dot)
      g.appendChild(label)
      g.appendChild(sub)
      svg.appendChild(g)
    })

    /* packets */
    const perEdge = reduced ? 1 : 2
    paths.forEach((_, pi) => {
      const edgeDef = m.edges[pi]
      for (let k = 0; k < perEdge; k++) {
        const el = svgEl('circle', { r: 4, class: 'net-packet' + (edgeDef.plain ? ' plain' : '') }) as SVGCircleElement
        svg.appendChild(el)
        packets.push({ el, offset: k / perEdge + pi * 0.13, plain: !!edgeDef.plain })
      }
    })

    caption.textContent = m.caption[lang]
    factsHost.innerHTML = m.facts
      .map((f) => `<div class="net-fact"><b>${f.k[lang]}</b>${f.v[lang]}</div>`)
      .join('')

    if (reduced) placeStatic()
  }

  function placeStatic() {
    packets.forEach((p, i) => {
      const path = paths[i % paths.length]
      if (!path || typeof path.el.getPointAtLength !== 'function') return
      try {
        const pt = path.el.getPointAtLength(0.5 * path.len)
        p.el.setAttribute('cx', String(pt.x))
        p.el.setAttribute('cy', String(pt.y))
      } catch { /* skip */ }
    })
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick)
    if (!packets.length) return
    const speed = 0.00011
    packets.forEach((p, i) => {
      const path = paths[Math.min(Math.floor(i / (reduced ? 1 : 2)), paths.length - 1)]
      if (!path || typeof path.el.getPointAtLength !== 'function') return
      const t = ((now * speed + p.offset) % 1)
      try {
        const pt = path.el.getPointAtLength(t * path.len)
        p.el.setAttribute('cx', String(pt.x))
        p.el.setAttribute('cy', String(pt.y))
      } catch { /* skip frame */ }
    })
  }

  tabsHost.addEventListener('click', (e) => {
    const tab = (e.target as HTMLElement).closest('.net-mode') as HTMLElement | null
    if (!tab?.dataset.mode) return
    modeId = tab.dataset.mode as NetMode['id']
    render()
  })

  render()
  onChange(render)
  if (!reduced) raf = requestAnimationFrame(tick)
}
