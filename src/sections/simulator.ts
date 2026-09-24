/* 07 · Miniature functional model — step through three threat scenarios. */

import { SCENARIOS, type Scenario, type SimTone } from '../data/content'
import { prefersReducedMotion } from '../lib/util'

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

  const reduced = prefersReducedMotion()
  let current: Scenario = SCENARIOS[0]
  let timers: number[] = []
  let running = false

  const tabs = SCENARIOS.map((s) => {
    const b = document.createElement('button')
    b.className = 'sim-scenario'
    b.setAttribute('role', 'tab')
    b.innerHTML = `<b>${s.title}</b><small>${s.sub}</small>`
    b.addEventListener('click', () => pick(s))
    tabsHost.appendChild(b)
    return b
  })

  function clearTimers() {
    timers.forEach((t) => window.clearTimeout(t))
    timers = []
  }

  function buildStage(s: Scenario) {
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
        <span class="sn-label"><b>${n.label}</b>${n.sub ? `<small>${n.sub}</small>` : ''}</span>
        <span class="sn-status">${n.status}</span>`
      stage.appendChild(el)
    })
  }

  function addLog(line: { t: string; tone?: 'ok' | 'bad' | 'warn' }) {
    const li = document.createElement('li')
    li.innerHTML = line.tone ? `<span class="${line.tone}">${line.t}</span>` : line.t
    log.appendChild(li)
    while (log.children.length > 8) log.removeChild(log.firstChild!)
  }

  function play() {
    if (running) return
    running = true
    playBtn.disabled = true
    playBtn.textContent = 'Running…'
    log.innerHTML = ''
    buildStage(current)

    const nodes = Array.from(stage.querySelectorAll<HTMLElement>('.sim-node'))
    const connectors = Array.from(stage.querySelectorAll<HTMLElement>('.sim-connector'))
    const stepMs = reduced ? 0 : 850

    current.nodes.forEach((n, i) => {
      timers.push(
        window.setTimeout(() => {
          nodes[i].classList.add('lit')
          if (connectors[i - 1]) connectors[i - 1].classList.add('lit')
          if (current.log[i]) addLog(current.log[i])
          // resolve after a beat
          timers.push(
            window.setTimeout(() => {
              nodes[i].classList.add(toneClass[n.tone])
              const st = nodes[i].querySelector('.sn-status')!
              st.textContent = n.status
            }, stepMs ? 380 : 0),
          )
        }, i * stepMs),
      )
    })

    timers.push(
      window.setTimeout(() => {
        const extra = current.log.slice(current.nodes.length)
        extra.forEach((l, i) => timers.push(window.setTimeout(() => addLog(l), (i + 1) * (stepMs ? 300 : 0))))
        running = false
        playBtn.disabled = false
        playBtn.textContent = 'Replay scenario'
      }, current.nodes.length * stepMs + (stepMs ? 450 : 0)),
    )
  }

  function pick(s: Scenario) {
    clearTimers()
    running = false
    playBtn.disabled = false
    playBtn.textContent = 'Run scenario'
    current = s
    tabs.forEach((t, i) => {
      t.classList.toggle('active', SCENARIOS[i].id === s.id)
      t.setAttribute('aria-selected', String(SCENARIOS[i].id === s.id))
    })
    note.textContent = s.note
    log.innerHTML = ''
    buildStage(s)
    if (reduced) play() // for reduced motion, show the completed trace directly
  }

  playBtn.addEventListener('click', play)
  pick(SCENARIOS[0])
}
