/* 07 · Miniature functional model — step through three threat scenarios. */

import { SCENARIOS, type Scenario, type SimTone } from '../data/content'
import { prefersReducedMotion } from '../lib/util'
import { getLang, onChange, type Lang } from '../i18n'
import { ui } from '../i18n/ui'

const toneClass: Record<SimTone, string> = {
  ok: 'resolved-ok',
  block: 'resolved-block',
  warn: 'resolved-warn',
  neutral: 'resolved-ok',
}

export function initSimulator(): void {
  const tabsHostEl = document.getElementById('sim-scenarios')
  const stageEl = document.getElementById('sim-stage')
  const logEl = document.getElementById('sim-log')
  const playBtnEl = document.getElementById('sim-play') as HTMLButtonElement | null
  const noteEl = document.getElementById('sim-note')
  if (!tabsHostEl || !stageEl || !logEl || !playBtnEl || !noteEl) return
  const tabsHost: HTMLElement = tabsHostEl
  const stage: HTMLElement = stageEl
  const log: HTMLElement = logEl
  const playBtn: HTMLButtonElement = playBtnEl
  const note: HTMLElement = noteEl
  const noteHost: HTMLElement = noteEl

  const reduced = prefersReducedMotion()
  let currentId = SCENARIOS[0].id
  let timers: number[] = []
  let running = false

  const byId = (id: string) => SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0]

  function clearTimers() {
    timers.forEach((t) => window.clearTimeout(t))
    timers = []
  }

  function buildStage(s: Scenario, lang: Lang) {
    stage.innerHTML = ''
    s.nodes.forEach((n, i) => {
      if (i > 0) {
        const c = document.createElement('div')
        c.className = 'sim-connector'
        stage.appendChild(c)
      }
      const el = document.createElement('div')
      el.className = 'sim-node'
      el.innerHTML = `
        <span class="sn-icon">${n.icon}</span>
        <span class="sn-label"><b>${n.label[lang]}</b>${n.sub ? `<small>${n.sub[lang]}</small>` : ''}</span>
        <span class="sn-status">${n.status[lang]}</span>`
      stage.appendChild(el)
    })
  }

  function addLog(lang: Lang, line: { t: { en: string; ar: string }; tone?: 'ok' | 'bad' | 'warn' }) {
    const li = document.createElement('li')
    li.innerHTML = line.tone ? `<span class="${line.tone}">${line.t[lang]}</span>` : line.t[lang]
    log.appendChild(li)
    while (log.children.length > 8) log.removeChild(log.firstChild!)
  }

  function play() {
    if (running) return
    const lang = getLang()
    const s = byId(currentId)
    running = true
    playBtn.disabled = true
    playBtn.textContent = ui('sim.running', lang)
    log.innerHTML = ''
    buildStage(s, lang)

    const nodes = Array.from(stage.querySelectorAll<HTMLElement>('.sim-node'))
    const connectors = Array.from(stage.querySelectorAll<HTMLElement>('.sim-connector'))
    const stepMs = reduced ? 0 : 850

    s.nodes.forEach((n, i) => {
      timers.push(
        window.setTimeout(() => {
          nodes[i]?.classList.add('lit')
          if (connectors[i - 1]) connectors[i - 1].classList.add('lit')
          if (s.log[i]) addLog(lang, s.log[i])
          timers.push(
            window.setTimeout(() => {
              nodes[i]?.classList.add(toneClass[n.tone])
              const st = nodes[i]?.querySelector('.sn-status')
              if (st) st.textContent = n.status[lang]
            }, stepMs ? 380 : 0),
          )
        }, i * stepMs),
      )
    })

    timers.push(
      window.setTimeout(() => {
        const extra = s.log.slice(s.nodes.length)
        extra.forEach((l, i) => timers.push(window.setTimeout(() => addLog(getLang(), l), (i + 1) * (stepMs ? 300 : 0))))
        running = false
        playBtn.disabled = false
        playBtn.textContent = ui('sim.replay', getLang())
      }, s.nodes.length * stepMs + (stepMs ? 450 : 0)),
    )
  }

  function render() {
    const lang = getLang()
    const s = byId(currentId)

    clearTimers()
    running = false
    playBtn.disabled = false
    playBtn.textContent = ui('sim.play', lang)

    tabsHost.innerHTML = ''
    SCENARIOS.forEach((sc) => {
      const b = document.createElement('button')
      b.className = 'sim-scenario' + (sc.id === s.id ? ' active' : '')
      b.setAttribute('role', 'tab')
      b.setAttribute('aria-selected', String(sc.id === s.id))
      b.innerHTML = `<b>${sc.title[lang]}</b><small>${sc.sub[lang]}</small>`
      b.addEventListener('click', () => { currentId = sc.id; render() })
      tabsHost.appendChild(b)
    })

    note.textContent = s.note[lang]
    log.innerHTML = ''
    buildStage(s, lang)
    if (reduced) play()
  }

  playBtn.addEventListener('click', play)
  render()
  onChange(render)
}
