/* ==========================================================================
   The Hardening Playbook — page logic.
   Renders the bilingual move list, filters, tracked progress (localStorage),
   myth cards, and reading list.
   ========================================================================== */

import '../style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initReveals, prefersReducedMotion } from '../lib/util'
import { getLang, setLang, onChange, type Lang } from '../i18n'
import { ui } from '../i18n/ui'
import { MOVES, TIERS, MYTHS, READS, PHASE_LABELS, DEVICES, type Move } from '../data/playbook'

gsap.registerPlugin(ScrollTrigger)

const reduced = prefersReducedMotion()
const STORE_KEY = 'apf-pb-progress'

/* ---------- progress store ---------- */
function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch { /* ignore */ }
  return new Set()
}
function saveProgress(done: Set<string>) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...done])) } catch { /* ignore */ }
}

let done = loadProgress()

/* ---------- static i18n ---------- */
function applyStatic(lang: Lang) {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    if (key) el.innerHTML = ui(key, lang)
  })
  document.querySelectorAll<HTMLElement>('[data-aria]').forEach((el) => {
    const key = el.dataset.aria
    if (key) el.setAttribute('aria-label', ui(key, lang))
  })
  document.title = lang === 'ar'
    ? 'دليل التحصين — حصن أندرويد للخصوصية'
    : 'The Hardening Playbook — Android Privacy Fortress'
  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (desc) {
    desc.content = lang === 'ar'
      ? 'دليل التحصين العملي — خطوات ملموسة مرتبة بالأثر والجهد لتقوية جهاز أندرويد: مستويات أساس، خطوات، أدوات حقيقية، وخرافات مُفنَّدة.'
      : 'The Hardening Playbook — concrete, prioritized steps to harden an Android device: baseline tiers, impact-by-effort moves, real tools, and common myths debunked.'
  }
  const stat = document.getElementById('pb-stat-moves')
  if (stat) stat.textContent = String(MOVES.length)
  const total = document.getElementById('pb-total')
  if (total) total.textContent = String(MOVES.length)
}

function syncLangToggle(lang: Lang) {
  const en = document.getElementById('lang-en')
  const ar = document.getElementById('lang-ar')
  en?.classList.toggle('active', lang === 'en')
  ar?.classList.toggle('active', lang === 'ar')
  en?.setAttribute('aria-pressed', String(lang === 'en'))
  ar?.setAttribute('aria-pressed', String(lang === 'ar'))
}

document.getElementById('lang-en')?.addEventListener('click', () => setLang('en'))
document.getElementById('lang-ar')?.addEventListener('click', () => setLang('ar'))

/* ---------- tiers ---------- */
function renderTiers() {
  const host = document.getElementById('pb-tiers')
  if (!host) return
  const lang = getLang()
  host.innerHTML = TIERS.map((t, i) => `
    <article class="pb-tier panel reveal${t.best ? ' pb-tier-best' : ''}" style="transition-delay:${i * 80}ms">
      ${t.best ? `<span class="pb-tier-badge mono">${ui('pb.tierBest', lang)}</span>` : ''}
      <h3 class="pb-tier-name">${t.name[lang]}</h3>
      <p class="pb-tier-sub">${t.sub[lang]}</p>
      <ul class="pb-tier-bullets">${t.bullets[lang].map((b) => `<li>${b}</li>`).join('')}</ul>
    </article>`).join('')
}

/* ---------- moves ---------- */
let phaseFilter: number | null = null

const IMPACT_KEY = { 1: 'pb.i1', 2: 'pb.i2', 3: 'pb.i3' } as const
const EFFORT_KEY = { 1: 'pb.e1', 2: 'pb.e2', 3: 'pb.e3' } as const

function moveCard(m: Move, i: number, lang: Lang): string {
  const checked = done.has(m.id) ? ' checked' : ''
  const phase = PHASE_LABELS[lang][m.phase]
  const tools = (m.tools ?? [])
    .map((t) => `<a class="pb-tool" href="${t.url}" target="_blank" rel="noopener" title="${ui('pb.example', lang)}">${t.name[lang]}</a>`)
    .join('')
  return `
  <article class="pb-move panel${checked}" data-id="${m.id}" data-phase="${m.phase}" style="transition-delay:${(i % 6) * 50}ms">
    ${m.img ? `<figure class="pb-move-fig"><img src="/images/${m.img}" alt="" loading="lazy" /></figure>` : ''}
    <div class="pb-move-head">
      <button class="pb-check" role="checkbox" aria-checked="${!!done.has(m.id)}" aria-label="${m.title[lang]}" data-check="${m.id}">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="pb-move-titlebox">
        <h3 class="pb-move-title">${m.title[lang]}</h3>
        <p class="pb-move-why">${m.why[lang]}</p>
      </div>
      <div class="pb-move-metrics">
        <span class="pb-metric pb-metric-i${m.impact}" title="${ui('pb.impact', lang)}">${ui('pb.impact', lang)} · ${ui(IMPACT_KEY[m.impact], lang)}</span>
        <span class="pb-metric pb-metric-e${m.effort}" title="${ui('pb.effort', lang)}">${ui('pb.effort', lang)} · ${ui(EFFORT_KEY[m.effort], lang)}</span>
      </div>
    </div>
    <div class="pb-move-body">
      <div class="pb-how">
        <h4 class="pb-h4">${ui('pb.how', lang)}</h4>
        <ol class="pb-how-list">${m.how[lang].map((h) => `<li>${h}</li>`).join('')}</ol>
      </div>
      ${tools ? `<div class="pb-tools"><h4 class="pb-h4">${ui('pb.tools', lang)}</h4><div class="pb-tool-row">${tools}</div></div>` : ''}
      <p class="pb-phase-tag mono">${phase}</p>
    </div>
  </article>`
}

function renderMoves() {
  const host = document.getElementById('pb-moves')
  const filters = document.getElementById('pb-filters')
  if (!host || !filters) return
  const lang = getLang()

  /* filter chips */
  filters.innerHTML = ''
  const mk = (label: string, val: number | null) => {
    const b = document.createElement('button')
    b.className = 'pb-chip' + (phaseFilter === val ? ' active' : '')
    b.textContent = label
    b.addEventListener('click', () => { phaseFilter = val; renderMoves() })
    filters.appendChild(b)
  }
  mk(ui('pb.phaseAll', lang), null)
  PHASE_LABELS[lang].forEach((p, i) => mk(p, i))

  /* cards */
  const list = MOVES
    .filter((m) => phaseFilter === null || m.phase === phaseFilter)
    .map((m, i) => moveCard(m, i, lang))
  host.innerHTML = list.join('')

  host.querySelectorAll<HTMLButtonElement>('[data-check]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.check!
      if (done.has(id)) done.delete(id)
      else done.add(id)
      saveProgress(done)
      syncProgressUi()
      const card = btn.closest('.pb-move')
      card?.classList.toggle('checked', done.has(id))
      btn.setAttribute('aria-checked', String(done.has(id)))
      maybeDevices()
    })
  })

  syncProgressUi()
}

/* ---------- progress ui ---------- */
function syncProgressUi() {
  const elDone = document.getElementById('pb-done')
  const elBar = document.getElementById('pb-bar')
  if (!elDone || !elBar) return
  elDone.textContent = String(done.size)
  elBar.style.width = `${(done.size / MOVES.length) * 100}%`
}

document.getElementById('pb-reset')?.addEventListener('click', () => {
  done = new Set()
  saveProgress(done)
  renderMoves()
  maybeDevices()
})

/* ---------- device recommendations after 3 impactful moves ---------- */
function maybeDevices() {
  const panel = document.getElementById('pb-devices')
  const list = document.getElementById('pb-device-list')
  if (!panel || !list) return
  const lang = getLang()
  const bank = DEVICES[lang]

  const picked = new Map<string, string[]>()
  for (const m of MOVES) {
    if (done.has(m.id) && m.devices && bank[m.id]) {
      for (const d of bank[m.id]) if (!picked.has(d)) picked.set(d, [m.id])
    }
  }

  if (done.size >= 3 && picked.size > 0) {
    panel.hidden = false
    list.innerHTML = [...picked.keys()].map((d) => `<p class="pb-device-line">${d}</p>`).join('')
  } else {
    panel.hidden = true
  }
}

/* ---------- myths + reads ---------- */
function renderMyths() {
  const host = document.getElementById('pb-myths')
  if (!host) return
  const lang = getLang()
  host.innerHTML = MYTHS.map((m) => `
    <article class="pb-myth panel">
      <p class="pb-myth-label mono">${ui('pb.mythLabel', lang)}</p>
      <p class="pb-myth-text">${m.myth[lang]}</p>
      <p class="pb-reality-label mono">${ui('pb.realityLabel', lang)}</p>
      <p class="pb-reality-text">${m.reality[lang]}</p>
    </article>`).join('')
}

function renderReads() {
  const host = document.getElementById('pb-reads')
  if (!host) return
  const lang = getLang()
  host.innerHTML = READS.map((r) => `
    <li class="pb-read">
      <a class="pb-read-link" href="${r.url}" target="_blank" rel="noopener">
        <b>${r.name[lang]}</b>
        <span>${r.note[lang]}</span>
        <span class="pb-read-url mono">${new URL(r.url).hostname.replace('www.', '')}</span>
      </a>
    </li>`).join('')
}

/* ---------- boot ---------- */
applyStatic(getLang())
syncLangToggle(getLang())
renderTiers()
renderMoves()
renderMyths()
renderReads()
maybeDevices()
initReveals()

onChange((lang) => {
  applyStatic(lang)
  syncLangToggle(lang)
  renderTiers()
  renderMoves()
  renderMyths()
  renderReads()
  maybeDevices()
  initReveals() // re-observe freshly rendered .reveal elements
  ScrollTrigger.refresh()
})

/* ---------- mobile menu ---------- */
const navMenu = document.getElementById('nav-menu')
const navLinks = document.getElementById('nav-links')
navMenu?.addEventListener('click', () => {
  const open = navLinks!.classList.toggle('open')
  navMenu.setAttribute('aria-expanded', String(open))
})
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', () => {
    navLinks?.classList.remove('open')
    navMenu?.setAttribute('aria-expanded', 'false')
  })
})

/* ---------- nav progress ---------- */
const progressFill = document.getElementById('progress-fill')
let ticking = false
window.addEventListener('scroll', () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    progressFill!.style.width = `${(window.scrollY / Math.max(max, 1)) * 100}%`
    ticking = false
  })
}, { passive: true })

window.addEventListener('load', () => ScrollTrigger.refresh())
