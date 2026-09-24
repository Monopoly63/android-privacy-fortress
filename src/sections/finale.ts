/* 15 · Finale — the architecture collapses back into a single device. */

import { FINALE_PHONE_SVG } from '../data/content'

export function initFinale(): void {
  const host = document.getElementById('finale-device')
  if (!host) return
  host.innerHTML = FINALE_PHONE_SVG
}
