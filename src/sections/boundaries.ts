/* 04 · Trust boundaries — hover/focus dims siblings; click locks a layer. */

import { BOUND_LAYERS } from '../data/content'
import { swapPanel } from '../lib/util'

export function initBoundaries(): void {
  const stackHost = document.getElementById('bounds-stack')
  const detailHost = document.getElementById('bounds-detail')
  if (!stackHost || !detailHost) return
  const stack: HTMLElement = stackHost
  const detail: HTMLElement = detailHost

  let locked: string | null = null
  let hovered: string | null = null

  const rows = BOUND_LAYERS.map((layer, i) => {
    const btn = document.createElement('button')
    btn.className = 'bound-row'
    btn.setAttribute('role', 'tab')
    btn.setAttribute('aria-selected', 'false')
    btn.dataset.id = layer.id
    btn.innerHTML = `
      <span class="b-idx">${String(i + 1).padStart(2, '0')}</span>
      <span><span class="b-name">${layer.name}</span><span class="b-sub">${layer.sub}</span></span>
      <span class="b-tag">${layer.tag}</span>`
    stack.appendChild(btn)
    return btn
  })

  function render(id: string) {
    const l = BOUND_LAYERS.find((x) => x.id === id)!
    detail.innerHTML = `
      <p class="bd-role">${l.role}</p>
      <h3 class="bd-name">${l.name}</h3>
      <p class="bd-desc">${l.desc}</p>
      <div class="bd-cols">
        <div class="bd-col"><h4>Can access</h4><ul>${l.access.map((a) => `<li>${a}</li>`).join('')}</ul></div>
        <div class="bd-col"><h4>Constrained by</h4><ul>${l.constrained.map((a) => `<li>${a}</li>`).join('')}</ul></div>
        <div class="bd-col"><h4>Isolated from</h4><ul>${l.isolated.map((a) => `<li>${a}</li>`).join('')}</ul></div>
      </div>
      <p class="bd-note">${l.note}</p>`
    swapPanel(detail)
    for (const row of rows) {
      const on = row.dataset.id === id
      row.classList.toggle('active', on)
      row.setAttribute('aria-selected', String(on))
    }
  }

  function refresh() {
    const current = hovered ?? locked ?? 'kernel'
    stack.classList.toggle('dimming', hovered !== null || locked !== null)
    render(current)
  }

  rows.forEach((row) => {
    row.addEventListener('mouseenter', () => { hovered = row.dataset.id!; refresh() })
    row.addEventListener('focus', () => { hovered = row.dataset.id!; refresh() })
    row.addEventListener('mouseleave', () => { hovered = null; refresh() })
    row.addEventListener('blur', () => { hovered = null; refresh() })
    row.addEventListener('click', () => {
      locked = locked === row.dataset.id ? null : row.dataset.id!
      refresh()
    })
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        locked = locked === row.dataset.id ? null : row.dataset.id!
        refresh()
      }
    })
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && locked) { locked = null; refresh() }
  })

  refresh()
}
