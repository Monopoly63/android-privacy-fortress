/* 11 · Side channels — six restrained observational visualizations. */

import { SIDE_CHANNELS } from '../data/content'
import { svgEl, prefersReducedMotion } from '../lib/util'

type VizBuilder = (host: SVGElement, reduced: boolean) => void

const STEEL = 'rgba(143,179,217,0.85)'
const DIM = 'rgba(143,179,217,0.3)'

function vizTiming(host: SVGElement) {
  const bars = 14
  for (let i = 0; i < bars; i++) {
    const h = 14 + ((i * 37) % 46)
    const r = svgEl('rect', {
      x: 6 + i * 18, y: 80 - h, width: 9, height: h, rx: 1.5,
      fill: i === 9 ? STEEL : DIM, class: 'sc-anim sc-anim-bar',
    })
    r.style.animationDelay = `${i * 120}ms`
    host.appendChild(r)
  }
}

function vizPower(host: SVGElement) {
  let d = 'M 0 60'
  for (let x = 0; x <= 400; x += 4) {
    const y = 46 + Math.sin(x * 0.09) * 12 + Math.sin(x * 0.23) * 7 + ((x * 7919) % 5) - 2
    d += ` L ${x} ${y.toFixed(1)}`
  }
  host.appendChild(svgEl('path', { d, stroke: STEEL, 'stroke-width': 1.4, fill: 'none', class: 'sc-anim sc-anim-draw', 'stroke-dasharray': 900, 'stroke-dashoffset': 900 }))
}

function vizEm(host: SVGElement) {
  for (let i = 0; i < 4; i++) {
    const c = svgEl('circle', { cx: 60, cy: 46, r: 6 + i * 14, fill: 'none', stroke: STEEL, 'stroke-width': 1, class: 'sc-anim sc-anim-ring', opacity: 0 })
    c.style.animationDelay = `${i * 700}ms`
    host.appendChild(c)
  }
  host.appendChild(svgEl('circle', { cx: 60, cy: 46, r: 3, fill: STEEL }))
}

function vizCache(host: SVGElement) {
  for (let gy = 0; gy < 4; gy++) {
    for (let gx = 0; gx < 10; gx++) {
      const hit = (gx * 3 + gy * 7) % 5 === 0
      const r = svgEl('rect', {
        x: 4 + gx * 19, y: 8 + gy * 18, width: 13, height: 12, rx: 2,
        fill: hit ? STEEL : 'rgba(255,255,255,0.06)', class: 'sc-anim sc-anim-cell',
      })
      r.style.animationDelay = `${((gx * 31 + gy * 97) % 9) * 340}ms`
      host.appendChild(r)
    }
  }
}

function vizSensors(host: SVGElement) {
  const mk = (phase: number, amp: number, cls: string, stroke: string) => {
    let d = `M 0 46`
    for (let x = 0; x <= 400; x += 4) d += ` L ${x} ${(46 + Math.sin(x * 0.05 + phase) * amp).toFixed(1)}`
    host.appendChild(svgEl('path', { d, stroke, 'stroke-width': 1.3, fill: 'none', class: cls }))
  }
  mk(0, 16, 'sc-anim sc-anim-wave', STEEL)
  mk(2.1, 10, 'sc-anim sc-anim-wave2', DIM)
}

function vizTraffic(host: SVGElement) {
  const bursts = [12, 14, 13, 30, 14, 12, 44, 13, 15, 12, 13, 28, 14, 12]
  bursts.forEach((h, i) => {
    const r = svgEl('rect', {
      x: 6 + i * 18, y: 78 - h, width: 8, height: h, rx: 1.5,
      fill: h > 25 ? STEEL : DIM, class: 'sc-anim sc-anim-pulse',
    })
    r.style.animationDelay = `${i * 210}ms`
    host.appendChild(r)
  })
}

const VIZ: Record<string, VizBuilder> = {
  timing: vizTiming, power: vizPower, em: vizEm, cache: vizCache, sensors: vizSensors, traffic: vizTraffic,
}

export function initSideChannels(): void {
  const grid = document.getElementById('sc-grid')
  if (!grid) return
  const reduced = prefersReducedMotion()

  /* inject animation styles once */
  if (!document.getElementById('sc-styles')) {
    const st = document.createElement('style')
    st.id = 'sc-styles'
    st.textContent = `
      @media (prefers-reduced-motion: no-preference) {
        .sc-anim-bar { animation: scBar 3.4s ease-in-out infinite alternate; transform-origin: bottom; }
        @keyframes scBar { from { transform: scaleY(0.72); } to { transform: scaleY(1.06); } }
        .sc-anim-draw { animation: scDraw 5s cubic-bezier(0.4,0,0.2,1) infinite; }
        @keyframes scDraw { 0% { stroke-dashoffset: 900; } 55% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -900; } }
        .sc-anim-ring { animation: scRing 2.8s ease-out infinite; }
        @keyframes scRing { 0% { opacity: 0.75; transform: scale(0.35); } 100% { opacity: 0; transform: scale(1.25); } }
        .sc-anim-ring { transform-origin: 60px 46px; }
        .sc-anim-cell { animation: scCell 3.2s steps(2, jump-none) infinite; }
        @keyframes scCell { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0.35; } }
        .sc-anim-wave { animation: scSlide 7s linear infinite; }
        .sc-anim-wave2 { animation: scSlide 9s linear infinite reverse; }
        @keyframes scSlide { from { transform: translateX(0); } to { transform: translateX(-60px); } }
        .sc-anim-pulse { animation: scPulse 2.9s ease-in-out infinite alternate; transform-origin: bottom; }
        @keyframes scPulse { from { transform: scaleY(0.8); opacity: 0.65; } to { transform: scaleY(1.08); opacity: 1; } }
      }`
    document.head.appendChild(st)
  }

  grid.innerHTML = ''
  SIDE_CHANNELS.forEach((sc) => {
    const tile = document.createElement('article')
    tile.className = 'sc-tile panel'
    const vizHost = document.createElement('div')
    vizHost.className = 'sc-viz'
    const svg = svgEl('svg', { viewBox: '0 0 300 90', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' })
    vizHost.appendChild(svg)
    tile.appendChild(vizHost)
    tile.insertAdjacentHTML(
      'beforeend',
      `<h3>${sc.name}</h3><p>${sc.desc}</p><span class="sc-mit"><b>${sc.mit.split('·')[0]}</b>·${sc.mit.split('·').slice(1).join('·')}</span>`,
    )
    grid.appendChild(tile)
    VIZ[sc.id]?.(svg, reduced)
  })
}
