/* 13 · Privacy by default — least-privilege baseline with an exposure counter. */

import { DEFAULT_TOGGLES } from '../data/content'
import { getLang, onChange } from '../i18n'
import { ui } from '../i18n/ui'

export function initDefaults(): void {
  const panelHost = document.getElementById('defaults-panel')
  const summaryHost = document.getElementById('defaults-summary')
  if (!panelHost || !summaryHost) return
  const panel: HTMLElement = panelHost
  const summary: HTMLElement = summaryHost

  /* toggle state survives re-renders */
  const state = new Map<string, boolean>(DEFAULT_TOGGLES.map((t) => [t.id, false]))

  function renderSummary() {
    const lang = getLang()
    const granted = Array.from(state.values()).filter(Boolean).length
    const total = DEFAULT_TOGGLES.length
    const pct = ((total - granted) / total) * 100
    const text = granted === 0
      ? ui('def.sum0', lang)
      : ui('def.sumN', lang).replace('{n}', String(granted))
    summary.innerHTML = `
      <p class="ds-count">${total - granted}<span> / ${total}</span></p>
      <span class="ds-label">${ui('def.countLabel', lang)}</span>
      <div class="ds-bar"><div class="ds-bar-fill" style="width:${pct}%"></div></div>
      <p class="ds-text">${text}</p>`
  }

  function render() {
    const lang = getLang()
    panel.innerHTML = ''
    DEFAULT_TOGGLES.forEach((t) => {
      const on = state.get(t.id) ?? false
      const row = document.createElement('div')
      row.className = 'default-row'
      row.innerHTML = `
        <span><span class="dr-name">${t.name[lang]}</span><span class="dr-note">${t.note[lang]}</span></span>
        <span class="dr-state${on ? ' granted' : ''}" data-state="${t.id}">${on ? t.grantLabel[lang] : t.denyLabel[lang]}</span>`
      const sw = document.createElement('button')
      sw.className = 'switch'
      sw.setAttribute('role', 'switch')
      sw.setAttribute('aria-checked', String(on))
      sw.setAttribute('aria-label', `${t.name[lang]}: ${t.note[lang]}`)
      sw.addEventListener('click', () => {
        const next = !state.get(t.id)
        state.set(t.id, next)
        sw.setAttribute('aria-checked', String(next))
        const label = row.querySelector(`[data-state="${t.id}"]`)!
        label.textContent = next ? t.grantLabel[getLang()] : t.denyLabel[getLang()]
        label.classList.toggle('granted', next)
        renderSummary()
      })
      row.appendChild(sw)
      panel.appendChild(row)
    })
    renderSummary()
  }

  render()
  onChange(render)
}
