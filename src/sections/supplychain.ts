/* 12 · Supply chain — source → compiler → build → signing → OTA → device. */

import { CHAIN_STAGES } from '../data/content'
import { swapPanel } from '../lib/util'
import { getLang, onChange } from '../i18n'

export function initSupplyChain(): void {
  const chainHost = document.getElementById('chain')
  const detailHost = document.getElementById('chain-detail')
  if (!chainHost || !detailHost) return
  const chain: HTMLElement = chainHost
  const detail: HTMLElement = detailHost

  let active = 0

  function render() {
    const lang = getLang()
    const s = CHAIN_STAGES[active]

    chain.innerHTML = ''
    CHAIN_STAGES.forEach((st, i) => {
      const li = document.createElement('li')
      li.innerHTML = `
        <button class="chain-stage${i === active ? ' active' : ''}" role="tab" aria-selected="${i === active}">
          <span class="chain-dot"></span>
          ${i < CHAIN_STAGES.length - 1 ? `<span class="chain-check">${CHAIN_STAGES[i].check[lang]}</span>` : ''}
          <b>${st.name[lang]}</b><small>${st.tag[lang]}</small>
        </button>`
      chain.appendChild(li)
    })

    detail.innerHTML = `
      <span class="cd-sub">STAGE ${String(active + 1).padStart(2, '0')} · ${s.tag[lang]}</span>
      <h3 class="cd-title">${s.name[lang]}</h3>
      <p class="cd-body">${s.body[lang]}</p>
      <ul class="cd-points">${s.points[lang].map((p) => `<li>${p}</li>`).join('')}</ul>`
    swapPanel(detail)
  }

  function select(i: number) {
    active = i
    render()
  }

  chain.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.chain-stage') as HTMLElement | null
    if (!btn) return
    const idx = Array.from(chain.querySelectorAll('.chain-stage')).indexOf(btn)
    if (idx >= 0) select(idx)
  })

  chain.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); select((active + 1) % CHAIN_STAGES.length); focusBtn() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select((active - 1 + CHAIN_STAGES.length) % CHAIN_STAGES.length); focusBtn() }
  })

  function focusBtn() {
    chain.querySelectorAll<HTMLElement>('.chain-stage')[active]?.focus()
  }

  render()
  onChange(render)
}
