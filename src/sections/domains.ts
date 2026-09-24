/* 06 · Ten security domains — list + detail explorer with keyboard support. */

import { DOMAINS } from '../data/content'
import { swapPanel } from '../lib/util'
import { getLang, onChange } from '../i18n'
import { ui } from '../i18n/ui'

export function initDomains(): void {
  const listHost = document.getElementById('domains-list')
  const detailHost = document.getElementById('domains-detail')
  if (!listHost || !detailHost) return
  const list: HTMLElement = listHost
  const detail: HTMLElement = detailHost

  let active = 0

  function render() {
    const lang = getLang()
    const d = DOMAINS[active]

    list.innerHTML = ''
    DOMAINS.forEach((dom, i) => {
      const li = document.createElement('li')
      li.innerHTML = `
        <button class="domain-btn${i === active ? ' active' : ''}" role="tab" aria-selected="${i === active}" id="domain-tab-${i}">
          <span class="d-num">${dom.num}</span><span class="d-title">${dom.title[lang]}</span>
        </button>`
      list.appendChild(li)
    })

    detail.innerHTML = `
      <div class="dd-head"><span class="dd-num">${d.num} / 10</span><h3 class="dd-title">${d.title[lang]}</h3></div>
      <span class="dd-tagline">${d.tagline[lang]}</span>
      <p class="dd-objective">${d.objective[lang]}</p>
      <div class="dd-grid">
        <div class="dd-block"><h4>${ui('dom.hSurface', lang)}</h4><ul>${d.surface[lang].map((s) => `<li>${s}</li>`).join('')}</ul></div>
        <div class="dd-block"><h4>${ui('dom.hAssets', lang)}</h4><ul>${d.assets[lang].map((s) => `<li>${s}</li>`).join('')}</ul></div>
        <div class="dd-block"><h4>${ui('dom.hTech', lang)}</h4><ul>${d.tech[lang].map((s) => `<li>${s}</li>`).join('')}</ul></div>
        <div class="dd-block"><h4>${ui('dom.hExample', lang)}</h4><ul>
          <li><b style="color:var(--bad);font-weight:500">${ui('dom.attackLbl', lang)}</b> ${d.attack[lang]}</li>
          <li><b style="color:var(--ok);font-weight:500">${ui('dom.defLbl', lang)}</b> ${d.mitigation[lang]}</li>
        </ul></div>
      </div>
      <p class="dd-relations"><b>${ui('dom.relLbl', lang)}</b> ${d.relations[lang]}</p>`
    swapPanel(detail)
  }

  function select(i: number) {
    active = (i + DOMAINS.length) % DOMAINS.length
    render()
  }

  list.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.domain-btn') as HTMLElement | null
    if (!btn) return
    const idx = Number(btn.id.replace('domain-tab-', ''))
    if (!Number.isNaN(idx)) select(idx)
  })

  list.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(active + 1); focusBtn(active) }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(active - 1); focusBtn(active) }
    if (e.key === 'Home') { e.preventDefault(); select(0); focusBtn(0) }
    if (e.key === 'End') { e.preventDefault(); select(DOMAINS.length - 1); focusBtn(DOMAINS.length - 1) }
  })

  function focusBtn(i: number) {
    list.querySelector<HTMLElement>(`#domain-tab-${i}`)?.focus()
  }

  render()
  onChange(render)
}
