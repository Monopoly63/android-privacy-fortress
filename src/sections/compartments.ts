/* 13.5 · Application compartments — profiles as floor plans. */

import { COMPARTMENTS, type CompApp, type CompProfile } from '../data/content'
import { swapPanel } from '../lib/util'

export function initCompartments(): void {
  const treeHost = document.getElementById('comp-tree')
  const detailHost = document.getElementById('comp-detail')
  if (!treeHost || !detailHost) return
  const tree: HTMLElement = treeHost
  const detail: HTMLElement = detailHost

  let selected: { profile: CompProfile; app: CompApp } = {
    profile: COMPARTMENTS[1],
    app: COMPARTMENTS[1].apps[0],
  }

  function renderDetail() {
    const { profile, app } = selected
    detail.innerHTML = `
      <span class="cpd-profile">${profile.name}</span>
      <h3 class="cpd-app">${app.name}</h3>
      <div class="cpd-block">
        <h4>Permissions granted</h4>
        <ul class="cpd-perms">${
          app.perms.length
            ? app.perms.map((p) => `<li>${p}</li>`).join('')
            : '<li class="none">NONE — by design</li>'
        }</ul>
      </div>
      <div class="cpd-block">
        <h4>Network boundary</h4>
        <p class="cpd-net">${app.net}</p>
      </div>
      <p class="cpd-note">${app.note}</p>`
    swapPanel(detail)
  }

  function buildTree() {
    tree.innerHTML = '<p class="comp-tree-root">DEVICE · COMPARTMENT MAP</p>'
    COMPARTMENTS.forEach((profile) => {
      const block = document.createElement('div')
      block.className = 'comp-block'
      block.innerHTML = `
        <p class="comp-name">${profile.name}</p>
        <p class="comp-sub">${profile.sub}</p>
        <div class="comp-apps"></div>`
      const apps = block.querySelector('.comp-apps')!
      profile.apps.forEach((app) => {
        const b = document.createElement('button')
        b.className = 'comp-app'
        b.textContent = app.name
        b.setAttribute('aria-label', `${app.name} in ${profile.name}`)
        b.addEventListener('click', () => {
          selected = { profile, app }
          document.querySelectorAll('.comp-app').forEach((el) => el.classList.remove('active'))
          b.classList.add('active')
          renderDetail()
        })
        if (selected.profile.id === profile.id && selected.app.id === app.id) b.classList.add('active')
        apps.appendChild(b)
      })
      tree.appendChild(block)
    })
  }

  buildTree()
  renderDetail()
}
