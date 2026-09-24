/* 10 · Physical security — state machine: pick a device state, read the surface. */

import { PHYS_STATES, PHYS_THREATS, type PhysLevel } from '../data/content'
import { swapPanel } from '../lib/util'

const LEVEL_LABEL: Record<PhysLevel, string> = {
  high: 'PROTECTED',
  mid: 'LIMITED',
  low: 'EXPOSED',
}

export function initPhysical(): void {
  const statesEl = document.getElementById('phys-states')
  const detailEl = document.getElementById('phys-detail')
  const matrixEl = document.getElementById('phys-matrix')
  if (!statesEl || !detailEl || !matrixEl) return
  const statesHost: HTMLElement = statesEl
  const detail: HTMLElement = detailEl
  const matrix: HTMLElement = matrixEl

  let current = PHYS_STATES[1] // after reboot (BFU) is the headline state

  const tabs = PHYS_STATES.map((s) => {
    const b = document.createElement('button')
    b.className = 'phys-state'
    b.setAttribute('role', 'tab')
    b.innerHTML = `<b>${s.label}</b><small>${s.sub}</small>`
    b.addEventListener('click', () => select(s.id))
    statesHost.appendChild(b)
    return b
  })

  function render() {
    detail!.innerHTML = `
      <h3 class="pd-name">${current.label}</h3>
      <span class="pd-badge">${current.badge}</span>
      <p class="pd-desc">${current.desc}</p>
      <div class="pd-rows">
        ${current.rows.map(([k, v]) => `<div class="pd-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
      </div>`
    swapPanel(detail!)

    matrix!.innerHTML = `
      <p class="pm-title">PROTECTION LEVEL BY THREAT</p>
      ${PHYS_THREATS.map((t, i) => {
        const lvl = current.matrix[`t${i}`] as PhysLevel
        return `<div class="pm-row"><span class="t">${t}</span><span class="pm-pill p-${lvl}">${LEVEL_LABEL[lvl]}</span></div>`
      }).join('')}`

    tabs.forEach((t, i) => {
      const on = PHYS_STATES[i].id === current.id
      t.classList.toggle('active', on)
      t.setAttribute('aria-selected', String(on))
    })
  }

  function select(id: string) {
    current = PHYS_STATES.find((s) => s.id === id)!
    render()
  }

  render()
}
