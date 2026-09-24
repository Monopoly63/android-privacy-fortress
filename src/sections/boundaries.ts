/* 04 · Trust boundaries — hover/focus dims siblings; click locks a layer. */

import { BOUND_LAYERS } from '../data/content'
import { swapPanel } from '../lib/util'
import { getLang, onChange } from '../i18n'
import { ui } from '../i18n/ui'

export function initBoundaries(): void {
  const stackHost = document.getElementById('bounds-stack')
  const detailHost = document.getElementById('bounds-detail')
  if (!stackHost || !detailHost) return
  const stack: HTMLElement = stackHost
  const detail: HTMLElement = detailHost

  let locked: string | null = null
  let hovered: string | null = null

  function render() {
    const lang = getLang()
    const current = hovered ?? locked ?? 'kernel'
    const layer = BOUND_LAYERS.find((x) => x.id === current) ?? BOUND_LAYERS[2]

    stack.innerHTML = ''
    BOUND_LAYERS.forEach((l, i) => {
      const btn = document.createElement('button')
      btn.className = 'bound-row' + (l.id === current ? ' active' : '')
      btn.setAttribute('role', 'tab')
      btn.setAttribute('aria-selected', String(l.id === current))
      btn.dataset.id = l.id
      btn.innerHTML = `
        <span class="b-idx">${String(i + 1).padStart(2, '0')}</span>
        <span><span class="b-name">${l.name[lang]}</span><span class="b-sub">${l.sub[lang]}</span></span>
        <span class="b-tag">${l.tag[lang]}</span>`
      stack.appendChild(btn)
    })
    stack.classList.toggle('dimming', hovered !== null || locked !== null)

    detail.innerHTML = `
      <p class="bd-role">${layer.role[lang]}</p>
      <h3 class="bd-name">${layer.name[lang]}</h3>
      <p class="bd-desc">${layer.desc[lang]}</p>
      <div class="bd-cols">
        <div class="bd-col"><h4>${ui('bounds.cAccess', lang)}</h4><ul>${layer.access[lang].map((a) => `<li>${a}</li>`).join('')}</ul></div>
        <div class="bd-col"><h4>${ui('bounds.cConstr', lang)}</h4><ul>${layer.constrained[lang].map((a) => `<li>${a}</li>`).join('')}</ul></div>
        <div class="bd-col"><h4>${ui('bounds.cIso', lang)}</h4><ul>${layer.isolated[lang].map((a) => `<li>${a}</li>`).join('')}</ul></div>
      </div>
      <p class="bd-note">${layer.note[lang]}</p>`
    swapPanel(detail)
  }

  function bindStack() {
    stack.addEventListener('mouseover', (e) => {
      const row = (e.target as HTMLElement).closest('.bound-row') as HTMLElement | null
      if (row) { hovered = row.dataset.id ?? null; render() }
    })
    stack.addEventListener('mouseout', () => { hovered = null; render() })
    stack.addEventListener('focusin', (e) => {
      const row = (e.target as HTMLElement).closest('.bound-row') as HTMLElement | null
      if (row) { hovered = row.dataset.id ?? null; render() }
    })
    stack.addEventListener('focusout', () => { hovered = null; render() })
    stack.addEventListener('click', (e) => {
      const row = (e.target as HTMLElement).closest('.bound-row') as HTMLElement | null
      if (!row) return
      locked = locked === row.dataset.id ? null : row.dataset.id!
      render()
    })
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && locked) { locked = null; render() }
  })

  bindStack()
  render()
  onChange(render)
}
