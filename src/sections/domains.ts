/* 06 · Ten security domains — list + detail explorer with keyboard support. */

import { DOMAINS } from '../data/content'
import { swapPanel } from '../lib/util'

export function initDomains(): void {
  const listHost = document.getElementById('domains-list')
  const detailHost = document.getElementById('domains-detail')
  if (!listHost || !detailHost) return
  const list: HTMLElement = listHost
  const detail: HTMLElement = detailHost

  let active = 0

  const buttons = DOMAINS.map((d, i) => {
    const li = document.createElement('li')
    li.innerHTML = `
      <button class="domain-btn" role="tab" aria-selected="false" id="domain-tab-${i}">
        <span class="d-num">${d.num}</span><span class="d-title">${d.title}</span>
      </button>`
    list.appendChild(li)
    const btn = li.querySelector('button')!
    btn.addEventListener('click', () => select(i))
    return btn
  })

  function render(i: number) {
    const d = DOMAINS[i]
    detail.innerHTML = `
      <div class="dd-head"><span class="dd-num">${d.num} / 10</span><h3 class="dd-title">${d.title}</h3></div>
      <span class="dd-tagline">${d.tagline}</span>
      <p class="dd-objective">${d.objective}</p>
      <div class="dd-grid">
        <div class="dd-block"><h4>Attack surface</h4><ul>${d.surface.map((s) => `<li>${s}</li>`).join('')}</ul></div>
        <div class="dd-block"><h4>Protected assets</h4><ul>${d.assets.map((s) => `<li>${s}</li>`).join('')}</ul></div>
        <div class="dd-block"><h4>Key technologies</h4><ul>${d.tech.map((s) => `<li>${s}</li>`).join('')}</ul></div>
        <div class="dd-block"><h4>Example attack &amp; mitigation</h4><ul>
          <li><b style="color:var(--bad);font-weight:500">Attack ·</b> ${d.attack}</li>
          <li><b style="color:var(--ok);font-weight:500">Defense ·</b> ${d.mitigation}</li>
        </ul></div>
      </div>
      <p class="dd-relations"><b>RELATIONS →</b> ${d.relations}</p>`
    swapPanel(detail)
    buttons.forEach((b, j) => {
      b.classList.toggle('active', j === i)
      b.setAttribute('aria-selected', String(j === i))
    })
  }

  function select(i: number) {
    active = (i + DOMAINS.length) % DOMAINS.length
    render(active)
  }

  list.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(active + 1); buttons[active].focus() }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(active - 1); buttons[active].focus() }
    if (e.key === 'Home') { e.preventDefault(); select(0); buttons[0].focus() }
    if (e.key === 'End') { e.preventDefault(); select(DOMAINS.length - 1); buttons[DOMAINS.length - 1].focus() }
  })

  render(0)
}
