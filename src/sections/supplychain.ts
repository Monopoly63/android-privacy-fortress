/* 12 · Supply chain — source → compiler → build → signing → OTA → device. */

import { CHAIN_STAGES } from '../data/content'
import { swapPanel } from '../lib/util'

export function initSupplyChain(): void {
  const chainHost = document.getElementById('chain')
  const detailHost = document.getElementById('chain-detail')
  if (!chainHost || !detailHost) return
  const chain: HTMLElement = chainHost
  const detail: HTMLElement = detailHost

  let active = 0

  const buttons = CHAIN_STAGES.map((s, i) => {
    const li = document.createElement('li')
    li.innerHTML = `
      <button class="chain-stage" role="tab" aria-selected="false">
        <span class="chain-dot"></span>
        ${i < CHAIN_STAGES.length - 1 ? `<span class="chain-check">${CHAIN_STAGES[i].check}</span>` : ''}
        <b>${s.name}</b><small>${s.tag}</small>
      </button>`
    chain.appendChild(li)
    const btn = li.querySelector('button')!
    btn.addEventListener('click', () => select(i))
    return btn
  })

  function render(i: number) {
    const s = CHAIN_STAGES[i]
    detail.innerHTML = `
      <span class="cd-sub">STAGE ${String(i + 1).padStart(2, '0')} · ${s.tag}</span>
      <h3 class="cd-title">${s.name}</h3>
      <p class="cd-body">${s.body}</p>
      <ul class="cd-points">${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>`
    swapPanel(detail)
    buttons.forEach((b, j) => {
      b.classList.toggle('active', j === i)
      b.setAttribute('aria-selected', String(j === i))
    })
  }

  function select(i: number) {
    active = i
    render(active)
  }

  chain.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); select((active + 1) % CHAIN_STAGES.length); buttons[active].focus() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select((active - 1 + CHAIN_STAGES.length) % CHAIN_STAGES.length); buttons[active].focus() }
  })

  render(0)
}
