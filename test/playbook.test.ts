/* Playbook page boot test — guards against runtime crashes that blank the page. */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const html = readFileSync(resolve(__dirname, '../playbook.html'), 'utf-8')

beforeAll(async () => {
  document.documentElement.innerHTML = html.replace(/^[\s\S]*?<html[^>]*>/, '').replace(/<\/html>[\s\S]*$/, '')
  await import('../src/playbook/main')
  await new Promise((r) => setTimeout(r, 30))
})

describe('playbook · boot renders every section', () => {
  it('renders tiers, moves, myths and reads without crashing', () => {
    expect(document.querySelectorAll('.pb-tier').length).toBe(3)
    expect(document.querySelectorAll('.pb-move').length).toBe(18)
    expect(document.querySelectorAll('.pb-myth').length).toBe(4)
    expect(document.querySelectorAll('.pb-read').length).toBe(5)
    // reads must have real URLs, not [object Object]
    const href = document.querySelector('.pb-read-link')!.getAttribute('href')!
    expect(href).toMatch(/^https:\/\//)
    // flagship moves carry their visuals
    expect(document.querySelectorAll('.pb-move-fig img').length).toBe(4)
    // filter chips: All + 6 phases
    expect(document.querySelectorAll('.pb-chip').length).toBe(7)
  })

  it('tracks progress in localStorage and updates the counter', async () => {
    const before = document.getElementById('pb-done')!.textContent
    ;(document.querySelector('[data-check="updates"]') as HTMLElement).click()
    ;(document.querySelector('[data-check="lockscreen"]') as HTMLElement).click()
    ;(document.querySelector('[data-check="os"]') as HTMLElement).click()
    expect(document.getElementById('pb-done')!.textContent).toBe('3')
    expect(before).toBe('0')
    const stored = JSON.parse(localStorage.getItem('apf-pb-progress')!)
    expect(stored).toContain('os')
    // completing the OS move (devices:true) reveals conditional recommendations
    await new Promise((r) => setTimeout(r, 10))
    expect(document.getElementById('pb-devices')!.hidden).toBe(false)
    expect(document.querySelectorAll('.pb-device-line').length).toBeGreaterThan(0)
  })

  it('filters moves by phase', async () => {
    const chips = document.querySelectorAll('.pb-chip')
    ;(chips[3] as HTMLElement).click() // Isolation phase (2 moves)
    expect(document.querySelectorAll('.pb-move').length).toBe(2)
    ;(document.querySelectorAll('.pb-chip')[0] as HTMLElement).click() // All
    expect(document.querySelectorAll('.pb-move').length).toBe(18)
  })

  it('switches to Arabic fully and back', async () => {
    const { setLang } = await import('../src/i18n')
    setLang('ar')
    expect(document.documentElement.dir).toBe('rtl')
    // target a specific move so the assertion is independent of any active filter
    const threat = document.querySelector('[data-id="threat-model"] .pb-move-title')!
    expect(threat.textContent).toContain('نموذج')
    // everything re-rendered with counts intact after the language switch
    ;(document.querySelector('[data-id="os"] .pb-move-title') as HTMLElement)
    expect(document.querySelector('[data-id="os"] .pb-move-title')!.textContent).toContain('النظام')
    expect(document.querySelectorAll('.pb-read').length).toBe(5)
    const href = document.querySelector('.pb-read-link')!.getAttribute('href')!
    expect(href).toMatch(/^https:\/\//)
    setLang('en')
    expect(document.documentElement.dir).toBe('ltr')
  })
})
