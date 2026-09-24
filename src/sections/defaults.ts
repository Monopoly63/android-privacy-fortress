/* 13 · Privacy by default — least-privilege baseline with an exposure counter. */

import { DEFAULT_TOGGLES } from '../data/content'

export function initDefaults(): void {
  const panelHost = document.getElementById('defaults-panel')
  const summaryHost = document.getElementById('defaults-summary')
  if (!panelHost || !summaryHost) return
  const panel: HTMLElement = panelHost
  const summary: HTMLElement = summaryHost

  const state = new Map<string, boolean>(DEFAULT_TOGGLES.map((t) => [t.id, false]))

  function renderSummary() {
    const granted = Array.from(state.values()).filter(Boolean).length
    const total = DEFAULT_TOGGLES.length
    const pct = ((total - granted) / total) * 100
    summary.innerHTML = `
      <p class="ds-count">${total - granted}<span> / ${total}</span></p>
      <span class="ds-label">RADIORS &amp; SENSORS CLOSED BY DEFAULT</span>
      <div class="ds-bar"><div class="ds-bar-fill" style="width:${pct}%"></div></div>
      <p class="ds-text">${
        granted === 0
          ? 'Baseline posture: every sensitive surface denied until a deliberate, specific grant. This is what “secure by default” means in practice.'
          : `${granted} surface${granted > 1 ? 's' : ''} currently granted. Each open radio or permission is a door that must be justified — and can be revoked.`
      }</p>`
  }

  panel.innerHTML = ''
  DEFAULT_TOGGLES.forEach((t) => {
    const row = document.createElement('div')
    row.className = 'default-row'
    row.innerHTML = `
      <span><span class="dr-name">${t.name}</span><span class="dr-note">${t.note}</span></span>
      <span class="dr-state" id="dr-state-${t.id}">${t.denyLabel}</span>`
    const sw = document.createElement('button')
    sw.className = 'switch'
    sw.setAttribute('role', 'switch')
    sw.setAttribute('aria-checked', 'false')
    sw.setAttribute('aria-label', `${t.name}: ${t.note}`)
    sw.addEventListener('click', () => {
      const next = !state.get(t.id)
      state.set(t.id, next)
      sw.setAttribute('aria-checked', String(next))
      const label = document.getElementById(`dr-state-${t.id}`)!
      label.textContent = next ? t.grantLabel : t.denyLabel
      label.classList.toggle('granted', next)
      renderSummary()
    })
    row.appendChild(sw)
    panel.appendChild(row)
  })

  renderSummary()
}
