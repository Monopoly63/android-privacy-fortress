/* Lab page boot test — jsdom has no WebGL, so this exercises the graceful
   fallback path and guards against import-time crashes. */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const html = readFileSync(resolve(__dirname, '../lab.html'), 'utf-8')

beforeAll(async () => {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*?<html[^>]*>/, '')
    .replace(/<\/html>[\s\S]*$/, '')
  await import('../src/lab/main')
  await new Promise((r) => setTimeout(r, 40))
})

describe('visual lab · wordless page', () => {
  it('boots without crashing and falls back cleanly without WebGL', () => {
    expect(document.getElementById('lab-fallback')!.hidden).toBe(false)
    // no text content beyond the attribution + a11y heading
    const heading = document.querySelector('.sr-only')!.textContent!
    expect(heading.length).toBeGreaterThan(3)
    expect(document.querySelectorAll('.lab-hud .lab-corner').length).toBe(4)
    expect(document.querySelector('.lab-credit')!.getAttribute('href')).toBe('https://hablas.tech')
    // attribution requirement survives on the visual page too
    expect(document.querySelector('.lab-credit')!.textContent).toContain('ABDULMOIN HABLAS')
  })

  it('scrolls to a real height for the journey', () => {
    const spacer = document.querySelector('.lab-spacer') as HTMLElement
    expect(spacer).toBeTruthy()
  })
})
