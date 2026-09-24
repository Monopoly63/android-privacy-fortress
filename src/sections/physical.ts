/* 10 · Physical security — state machine: pick a device state, read the surface. */

import { PHYS_STATES, PHYS_THREATS, type PhysLevel } from '../data/content'
import { swapPanel } from '../lib/util'
import { getLang, onChange } from '../i18n'
import { ui } from '../i18n/ui'

const LEVEL_KEY: Record<PhysLevel, string> = {
  high: 'phys.lHigh',
  mid: 'phys.lMid',
  low: 'phys.lLow',
}

export function initPhysical(): void {
  const statesEl = document.getElementById('phys-states')
  const detailEl = document.getElementById('phys-detail')
  const matrixEl = document.getElementById('phys-matrix')
  if (!statesEl || !detailEl || !matrixEl) return
  const statesHost: HTMLElement = statesEl
  const detail: HTMLElement = detailEl
  const matrix: HTMLElement = matrixEl

  let currentId = PHYS_STATES[1].id // after reboot (BFU) is the headline state
  const byId = (id: string) => PHYS_STATES.find((s) => s.id === id) ?? PHYS_STATES[0]

  function render() {
    const lang = getLang()
    const current = byId(currentId)

    statesHost.innerHTML = ''
    PHYS_STATES.forEach((s) => {
      const b = document.createElement('button')
      b.className = 'phys-state' + (s.id === current.id ? ' active' : '')
      b.setAttribute('role', 'tab')
      b.setAttribute('aria-selected', String(s.id === current.id))
      b.innerHTML = `<b>${s.label[lang]}</b><small>${s.sub[lang]}</small>`
      b.addEventListener('click', () => { currentId = s.id; render() })
      statesHost.appendChild(b)
    })

    detail.innerHTML = `
      <h3 class="pd-name">${current.label[lang]}</h3>
      <span class="pd-badge">${current.badge[lang]}</span>
      <p class="pd-desc">${current.desc[lang]}</p>
      <div class="pd-rows">
        ${current.rows.map((pair) => {
          const cells = (pair as any)[lang] as string[]
          return `<div class="pd-row"><span class="k">${cells[0]}</span><span class="v">${cells[1]}</span></div>`
        }).join('')}
      </div>`
    swapPanel(detail)

    matrix.innerHTML = `
      <p class="pm-title">${ui('phys.matrixTitle', lang)}</p>
      ${PHYS_THREATS[lang].map((t, i) => {
        const lvl = current.matrix[`t${i}`] as PhysLevel
        return `<div class="pm-row"><span class="t">${t}</span><span class="pm-pill p-${lvl}">${ui(LEVEL_KEY[lvl], lang)}</span></div>`
      }).join('')}`
  }

  render()
  onChange(render)
}
