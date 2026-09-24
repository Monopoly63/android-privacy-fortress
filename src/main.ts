/* ==========================================================================
   Android Privacy Fortress — application entry.
   Boots the design system modules, the WebGL stage, the scroll narrative,
   and the EN/AR bilingual layer.
   ========================================================================== */

import './style.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createStage } from './three/stage'
import { initReveals, prefersReducedMotion, clamp } from './lib/util'
import { getLang, setLang, onChange, type Lang } from './i18n'
import { ui } from './i18n/ui'
import { initBoundaries } from './sections/boundaries'
import { initArchitecture } from './sections/architecture'
import { initDomains } from './sections/domains'
import { initSimulator } from './sections/simulator'
import { initNetwork } from './sections/network'
import { initMetadata } from './sections/metadata'
import { initPhysical } from './sections/physical'
import { initSideChannels } from './sections/sidechannels'
import { initSupplyChain } from './sections/supplychain'
import { initDefaults } from './sections/defaults'
import { initCompartments } from './sections/compartments'
import { initSystem } from './sections/system'
import { initFinale } from './sections/finale'

gsap.registerPlugin(ScrollTrigger)

const reduced = prefersReducedMotion()

/* ---------- static modules (each subscribes to language changes) ---------- */
initBoundaries()
initArchitecture()
initDomains()
initSimulator()
initNetwork()
initMetadata()
initPhysical()
initSideChannels()
initSupplyChain()
initDefaults()
initCompartments()
initSystem()
initFinale()
initReveals()

/* ---------- i18n: static text, meta, toggle ---------- */
function applyStatic(lang: Lang) {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    if (key) el.innerHTML = ui(key, lang)
  })
  document.querySelectorAll<HTMLElement>('[data-bb]').forEach((el) => {
    const key = `bb.${el.dataset.bb}`
    el.innerHTML = ui(key, lang)
  })
  document.querySelectorAll<HTMLElement>('[data-aria]').forEach((el) => {
    const key = el.dataset.aria
    if (key) el.setAttribute('aria-label', ui(key, lang))
  })
  /* baseband node labels */
  const nModem = document.getElementById('bb-node-modem')
  const nTower = document.getElementById('bb-node-tower')
  const nCarrier = document.getElementById('bb-node-carrier')
  if (nModem) nModem.textContent = ui('bb.nModem', lang)
  if (nTower) nTower.textContent = ui('bb.nTower', lang)
  if (nCarrier) nCarrier.textContent = ui('bb.nCarrier', lang)

  document.title = ui('meta.title', lang)
  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (desc) desc.content = ui('meta.desc', lang)
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

applyStatic(getLang())
syncLangToggle(getLang())

/* ---------- smooth scroll (skipped for reduced motion) ---------- */
let lenis: Lenis | null = null
if (!reduced && typeof ResizeObserver !== 'undefined') {
  try {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis!.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  } catch {
    lenis = null // native scroll remains fully functional
  }
}

/* ---------- WebGL stage ---------- */
const canvas = document.getElementById('gl') as HTMLCanvasElement
const labelHost = document.getElementById('device-labels') as HTMLDivElement
const stage = createStage(canvas, labelHost)

if (!stage.ok) {
  /* graceful fallback: static device, unpinned story */
  document.documentElement.classList.add('no-webgl')
  const style = document.createElement('style')
  style.textContent = `
    .no-webgl .gl-canvas, .no-webgl .device-labels { display: none; }
    .no-webgl .story-pin { height: auto; padding: 16vh 0; }
    .no-webgl .story-side { position: static; transform: none; margin: 40px auto 0; max-width: 720px; }
    .no-webgl .story-step { opacity: 1; transform: none; }
    .no-webgl .hero::after {
      content: ""; display: block; width: 200px; height: 400px; margin: 5vh auto 0;
      border: 2px solid rgba(255,255,255,0.4); border-radius: 34px;
      box-shadow: inset 0 0 40px rgba(143,179,217,0.06);
    }`
  document.head.appendChild(style)
}

/* language changes reach the WebGL layer here */
onChange((lang) => {
  applyStatic(lang)
  syncLangToggle(lang)
  stage.setLang(lang)
})

/* ---------- pointer parallax ---------- */
window.addEventListener(
  'pointermove',
  (e) => {
    if (e.pointerType !== 'mouse' || reduced) return
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    stage.setPointer(x, y)
  },
  { passive: true },
)

/* ---------- scroll narrative ---------- */
const steps = Array.from(document.querySelectorAll<HTMLElement>('.story-step'))
const railFill = document.getElementById('story-rail-fill')
const storyCue = document.getElementById('story-cue')

function storyUi(p: number) {
  if (railFill) railFill.style.height = `${(p * 100).toFixed(2)}%`
  if (storyCue) storyCue.style.opacity = String(clamp(1 - p * 8, 0, 1))
  let idx = -1
  if (p > 0.24 && p < 0.9) idx = clamp(Math.floor(((p - 0.24) / 0.64) * 7), 0, 6)
  steps.forEach((s, i) => s.classList.toggle('active', i === idx))
  stage.setStage(idx)
}

if (stage.ok) {
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => stage.setHeroProgress(self.progress),
  })

  ScrollTrigger.create({
    trigger: '#device-story',
    start: 'top top',
    end: '+=3600',
    pin: true,
    scrub: 0.55,
    onUpdate: (self) => {
      stage.setStoryProgress(self.progress)
      storyUi(self.progress)
    },
  })

  /* hand off to the DOM sections: fade the stage out over #boundaries */
  ScrollTrigger.create({
    trigger: '#boundaries',
    start: 'top 92%',
    end: 'top 45%',
    scrub: true,
    onUpdate: (self) => {
      const o = 1 - self.progress
      const os = String(o)
      canvas.style.opacity = os
      labelHost.style.opacity = os
      stage.setOpacity(o)
    },
  })
} else {
  steps.forEach((s) => s.classList.add('active'))
}

/* ---------- mobile menu ---------- */
const navMenu = document.getElementById('nav-menu')
const navLinks = document.getElementById('nav-links')
navMenu?.addEventListener('click', () => {
  const open = navLinks!.classList.toggle('open')
  navMenu.setAttribute('aria-expanded', String(open))
})

/* ---------- anchor navigation through lenis ---------- */
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!.slice(1)
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    navLinks?.classList.remove('open')
    navMenu?.setAttribute('aria-expanded', 'false')
    if (lenis) lenis.scrollTo(target, { offset: 0 })
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    /* move focus for accessibility */
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  })
})

/* ---------- nav progress ---------- */
const progressFill = document.getElementById('progress-fill')
let ticking = false
window.addEventListener(
  'scroll',
  () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressFill!.style.width = `${(window.scrollY / Math.max(max, 1)) * 100}%`
      ticking = false
    })
  },
  { passive: true },
)

/* recalculate pinned measurements after fonts/layout settle */
window.addEventListener('load', () => ScrollTrigger.refresh())
