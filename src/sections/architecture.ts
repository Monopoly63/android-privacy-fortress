/* 05 · Architecture — the device stack and the network path, side by side. */

import { ARCH_DEVICE, ARCH_NETWORK } from '../data/content'

function renderStack(host: HTMLElement, nodes: Array<{ name: string; sub: string; ext?: boolean }>) {
  host.innerHTML = ''
  nodes.forEach((n, i) => {
    const el = document.createElement('div')
    el.className = 'arch-node' + (n.ext ? ' arch-ext' : '')
    el.innerHTML = `${n.name}<small>${n.sub}</small>`
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
  renderStack(dev, ARCH_DEVICE)
  renderStack(net, ARCH_NETWORK)
}
