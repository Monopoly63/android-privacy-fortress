/* 14 · The complete system — every layer assembled, animated into place. */

import { svgEl, prefersReducedMotion } from '../lib/util'

interface NodeDef {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  kind?: 'accent' | 'warn' | 'ext'
}

const W = 220
const H = 46
const LX = 170 // left column x
const CX = 390 // center column x
const RX = 610 // right column x

const NODES: NodeDef[] = [
  { x: CX, y: 22, w: W, h: H, label: 'USER / IDENTITY', sub: 'intent · accounts · profiles', kind: 'accent' },
  { x: CX, y: 92, w: W, h: H, label: 'APPLICATIONS', sub: 'sandboxes · compartments' },
  { x: CX, y: 162, w: W, h: H, label: 'ANDROID FRAMEWORK', sub: 'permissions · binder ipc' },
  { x: CX, y: 232, w: W, h: H, label: 'KERNEL / SELINUX', sub: 'mandatory policy' },
  { x: LX, y: 322, w: W, h: H, label: 'CRYPTO / TEE', sub: 'keymint · fbe keys', kind: 'accent' },
  { x: LX, y: 392, w: W, h: H, label: 'SECURE BOOT', sub: 'avb · rollback fuses' },
  { x: LX, y: 462, w: W, h: H, label: 'HARDWARE', sub: 'soc · fuses · secure element', kind: 'accent' },
  { x: RX, y: 322, w: W, h: H, label: 'NETWORK STACK', sub: 'dns · tls · routing' },
  { x: RX, y: 392, w: W, h: H, label: 'VPN / TOR / DNS', sub: 'tunnels · onion routing', kind: 'accent' },
  { x: RX, y: 462, w: W, h: H, label: 'CELLULAR MODEM', sub: 'separate trust domain', kind: 'warn' },
  { x: RX, y: 540, w: W, h: 40, label: 'CELL TOWER', sub: 'radio interface', kind: 'ext' },
  { x: RX, y: 596, w: W, h: 40, label: 'CARRIER', sub: 'subscriber records', kind: 'ext' },
]

const LINKS: Array<{ a: number; b: number; flow?: boolean; dashed?: boolean }> = [
  { a: 0, b: 1 },
  { a: 1, b: 2 },
  { a: 2, b: 3 },
  { a: 3, b: 4, flow: true },
  { a: 3, b: 7 },
  { a: 4, b: 5 },
  { a: 5, b: 6 },
  { a: 7, b: 8, flow: true },
  { a: 8, b: 9 },
  { a: 9, b: 10 },
  { a: 10, b: 11 },
  { a: 6, b: 9, dashed: true },
]

function center(n: NodeDef, side: 'top' | 'bottom' | 'left' | 'right') {
  const cx = n.x + n.w / 2
  switch (side) {
    case 'top': return { x: cx, y: n.y }
    case 'bottom': return { x: cx, y: n.y + n.h }
    case 'left': return { x: n.x, y: n.y + n.h / 2 }
    default: return { x: n.x + n.w, y: n.y + n.h / 2 }
  }
}

export function initSystem(): void {
  const svg = document.getElementById('system-svg')
  if (!svg) return
  svg.innerHTML = ''
  const reduced = prefersReducedMotion()

  /* zones */
  const zoneDevice = svgEl('rect', { x: LX - 26, y: 8, width: CX + W - LX + 52, height: 528, rx: 18, class: 'sys-zone' })
  const zoneRadio = svgEl('rect', { x: RX - 26, y: 300, width: W + 52, height: 350, rx: 18, class: 'sys-zone' })
  svg.appendChild(zoneDevice)
  svg.appendChild(zoneRadio)
  const zl1 = svgEl('text', { x: LX - 10, y: 30, class: 'sys-zone-label' })
  zl1.textContent = 'DEVICE TRUST DOMAIN'
  const zl2 = svgEl('text', { x: RX - 10, y: 322, class: 'sys-zone-label' })
  zl2.textContent = 'RADIO PATH'
  svg.appendChild(zl1)
  svg.appendChild(zl2)

  /* links */
  LINKS.forEach((l) => {
    const a = NODES[l.a]
    const b = NODES[l.b]
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

  /* over-time strip */
  const strip = svgEl('g', { class: 'sys-node' })
  strip.appendChild(svgEl('rect', { x: LX, y: 652, width: RX + W - LX, height: 44, rx: 10, class: 'sys-box ext' }))
  const st = svgEl('text', { x: 500, y: 678, 'text-anchor': 'middle', class: 'sys-label' })
  st.textContent = 'OVER TIME — SUPPLY CHAIN · MONITORING · RECOVERY · ENCRYPTED BACKUPS'
  strip.appendChild(st)

  /* nodes */
  NODES.forEach((n) => {
    const g = svgEl('g', { class: 'sys-node' })
    g.appendChild(
      svgEl('rect', {
        x: n.x, y: n.y, width: n.w, height: n.h, rx: 10,
        class: 'sys-box' + (n.kind === 'accent' ? ' accent' : n.kind === 'warn' ? ' warnbox' : n.kind === 'ext' ? ' ext' : ''),
      }),
    )
    const label = svgEl('text', { x: n.x + n.w / 2, y: n.y + (n.sub ? 20 : n.h / 2 + 4), 'text-anchor': 'middle', class: 'sys-label' })
    label.textContent = n.label
    g.appendChild(label)
    if (n.sub) {
      const sub = svgEl('text', { x: n.x + n.w / 2, y: n.y + 34, 'text-anchor': 'middle', class: 'sys-sub' })
      sub.textContent = n.sub
      g.appendChild(sub)
    }
    svg.appendChild(g)
  })
  svg.appendChild(strip)

  /* stagger */
  const nodes = Array.from(svg.querySelectorAll<SVGElement>('.sys-node'))
  nodes.forEach((el, i) => { el.style.transitionDelay = `${i * 70}ms` })

  const figure = svg.closest('figure')!
  figure.classList.add('assemble')
  if (reduced) {
    figure.classList.add('in')
    return
  }
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        figure.classList.add('in')
        io.disconnect()
      }
    },
    { threshold: 0.25 },
  )
  io.observe(figure)
}
