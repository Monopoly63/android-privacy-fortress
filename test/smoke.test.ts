/* End-to-end DOM smoke test: loads index.html into jsdom and boots main.ts. */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')

beforeAll(async () => {
  document.documentElement.innerHTML = html.replace(/^[\s\S]*?<html[^>]*>/, '').replace(/<\/html>[\s\S]*$/, '')
  await import('../src/main')
  // give rAF/IO-driven code a beat
  await new Promise((r) => setTimeout(r, 50))
})

describe('bootstrap', () => {
  it('renders the navigation and progress rail', () => {
    expect(document.querySelector('.nav')).toBeTruthy()
    expect(document.getElementById('progress-fill')).toBeTruthy()
  })

  it('falls back gracefully without WebGL', () => {
    // jsdom canvas returns null for webgl → stage.ok === false path
    expect(document.querySelectorAll('.story-step.active').length).toBeGreaterThan(0)
  })
})

describe('04 · trust boundaries', () => {
  it('lists all layers and reacts to selection', () => {
    expect(document.querySelectorAll('.bound-row').length).toBe(9)
    // rows re-render on selection — re-query after each interaction
    ;(document.querySelectorAll('.bound-row')[0] as HTMLElement).click()
    const locked = document.querySelectorAll('.bound-row')[0]
    expect(locked.classList.contains('active')).toBe(true)
    expect(document.querySelector('#bounds-detail .bd-name')!.textContent).toBe('Applications')
    // keyboard escape releases lock
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })
})

describe('05 · architecture', () => {
  it('renders both stacks', () => {
    expect(document.querySelectorAll('#arch-device .arch-node').length).toBe(7)
    expect(document.querySelectorAll('#arch-network .arch-node').length).toBe(5)
  })
})

describe('06 · domains', () => {
  it('renders ten domains and switches detail', () => {
    expect(document.querySelectorAll('.domain-btn').length).toBe(10)
    // list re-renders on selection — re-query after each interaction
    ;(document.querySelectorAll('.domain-btn')[6] as HTMLElement).click()
    expect(document.querySelector('#domains-detail .dd-title')!.textContent).toBe('Network Security & Anonymity')
    ;(document.querySelectorAll('.domain-btn')[0] as HTMLElement).click()
    expect(document.querySelector('#domains-detail .dd-title')!.textContent).toBe('Threat Modeling')
  })
})

describe('07 · simulator', () => {
  it('offers three scenarios and plays without errors', async () => {
    expect(document.querySelectorAll('.sim-scenario').length).toBe(3)
    const play = document.getElementById('sim-play') as HTMLButtonElement
    play.click()
    await new Promise((r) => setTimeout(r, 30))
    expect(play.disabled).toBe(true)
    ;(document.querySelectorAll('.sim-scenario')[1] as HTMLElement).click()
    expect(document.querySelectorAll('.sim-node').length).toBe(6)
  })
})

describe('08 · network', () => {
  it('switches routing modes', () => {
    const tabs = document.querySelectorAll('.net-mode')
    expect(tabs.length).toBe(3)
    ;(tabs[2] as HTMLElement).click()
    expect(document.getElementById('net-caption')!.textContent).toContain('relay')
    expect(document.querySelectorAll('#net-svg .net-node-label').length).toBe(5)
    ;(tabs[1] as HTMLElement).click()
    expect(document.querySelectorAll('#net-facts .net-fact').length).toBe(4)
  })
})

describe('08b · metadata', () => {
  it('renders cipher blocks and metadata rows', () => {
    expect(document.querySelectorAll('#meta-cipher span').length).toBeGreaterThan(50)
    expect(document.querySelectorAll('#meta-list li').length).toBe(7)
  })
})

describe('10 · physical states', () => {
  it('renders six states and updates the matrix', () => {
    const states = document.querySelectorAll('.phys-state')
    expect(states.length).toBe(6)
    states.forEach((s, i) => {
      ;(s as HTMLElement).click()
      expect(document.querySelectorAll('#phys-matrix .pm-row').length).toBe(5)
      expect(document.querySelector('.pd-badge')!.textContent!.length).toBeGreaterThan(3)
    })
  })
})

describe('11 · side channels', () => {
  it('renders six tiles', () => {
    expect(document.querySelectorAll('.sc-tile').length).toBe(6)
  })
})

describe('12 · supply chain', () => {
  it('renders six stages and detail', () => {
    expect(document.querySelectorAll('.chain-stage').length).toBe(6)
    ;(document.querySelectorAll('.chain-stage')[3] as HTMLElement).click()
    expect(document.querySelector('#chain-detail .cd-title')!.textContent).toBe('Signing')
  })
})

describe('13 · defaults', () => {
  it('toggles grants and updates the exposure counter', () => {
    const switches = document.querySelectorAll('.switch')
    expect(switches.length).toBe(6)
    ;(switches[0] as HTMLElement).click()
    expect(switches[0].getAttribute('aria-checked')).toBe('true')
    expect(document.querySelector('.ds-count')!.textContent).toContain('5')
    ;(switches[0] as HTMLElement).click()
    expect(document.querySelector('.ds-count')!.textContent).toContain('6')
  })
})

describe('13.5 · compartments', () => {
  it('renders four profiles and inspects apps', () => {
    expect(document.querySelectorAll('.comp-block').length).toBe(4)
    const apps = document.querySelectorAll('.comp-app')
    expect(apps.length).toBe(12)
    ;(apps[4] as HTMLElement).click()
    expect(document.querySelector('.cpd-app')!.textContent!.length).toBeGreaterThan(2)
  })
})

describe('14 · system', () => {
  it('assembles the full architecture', () => {
    expect(document.querySelectorAll('#system-svg .sys-node').length).toBeGreaterThanOrEqual(13)
    expect(document.querySelectorAll('#system-svg .sys-link').length).toBe(12)
  })
})

describe('15 · finale', () => {
  it('shows the device and quote', () => {
    expect(document.querySelector('#finale-device svg')).toBeTruthy()
    expect(document.querySelector('.finale-quote')!.textContent).toContain('architecture of trust')
  })
})

describe('i18n · Arabic / RTL', () => {
  it('switches to Arabic with RTL and re-renders every module, then back', async () => {
    const { setLang } = await import('../src/i18n')
    setLang('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')
    expect(document.querySelector('.display')!.textContent).toContain('الطبقات')
    expect(document.querySelector('#why-title')!.textContent).toContain('لا يكفي')
    expect(document.querySelectorAll('.bound-row').length).toBe(9)
    expect(document.querySelector('#bounds-detail .bd-name')!.textContent!.length).toBeGreaterThan(3)
    expect(document.querySelectorAll('.domain-btn').length).toBe(10)
    expect(document.querySelectorAll('.sim-scenario').length).toBe(3)
    expect(document.querySelectorAll('.net-fact').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.sc-tile').length).toBe(6)
    expect(document.querySelectorAll('.chain-stage').length).toBe(6)
    expect(document.querySelectorAll('.switch').length).toBe(6)
    expect(document.querySelectorAll('.comp-app').length).toBe(12)
    expect(document.querySelectorAll('#system-svg .sys-node').length).toBeGreaterThanOrEqual(13)
    setLang('en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.querySelector('.display')!.textContent).toContain('layered security system')
  })
})
