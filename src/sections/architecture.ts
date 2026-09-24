/* 05 · Architecture — the device stack and the network path, side by side. */

import { ARCH_DEVICE, ARCH_NETWORK, type ArchNode } from '../data/content'
import { getLang, onChange, type Lang } from '../i18n'

function renderStack(host: HTMLElement, lang: Lang, nodes: ArchNode[]) {
  host.innerHTML = ''
  nodes.forEach((n, i) => {
    const el = document.createElement('div')
    el.className = 'arch-node' + (n.ext ? ' arch-ext' : '')
    el.innerHTML = `${n.name[lang]}<small>${n.sub[lang]}</small>`
    host.appendChild(el)
    if (i < nodes.length - 1) {
      const arrow = document.createElement('div')
      arrow.className = 'arch-down'
      arrow.textContent = '↓'
      arrow.setAttribute('aria-hidden', 'true')
      host.appendChild(arrow)
    }
  })
}

export function initArchitecture(): void {
  const dev = document.getElementById('arch-device')
  const net = document.getElementById('arch-network')
  if (!dev || !net) return

  const render = () => {
    const lang = getLang()
    renderStack(dev, lang, ARCH_DEVICE)
    renderStack(net, lang, ARCH_NETWORK)
  }

  render()
  onChange(render)
}
