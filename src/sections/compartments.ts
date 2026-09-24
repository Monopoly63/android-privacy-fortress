/* 13.5 · Application compartments — profiles as floor plans. */

import { COMPARTMENTS, type CompApp, type CompProfile } from '../data/content'
import { swapPanel } from '../lib/util'
import { getLang, onChange } from '../i18n'
import { ui } from '../i18n/ui'

export function initCompartments(): void {
  const treeHost = document.getElementById('comp-tree')
  const detailHost = document.getElementById('comp-detail')
  if (!treeHost || !detailHost) return
  const tree: HTMLElement = treeHost
  const detail: HTMLElement = detailHost

  let selected = { profile: COMPARTMENTS[1].id, app: COMPARTMENTS[1].apps[0].id }

  function find(): { profile: CompProfile; app: CompApp } {
    const profile = COMPARTMENTS.find((p) => p.id === selected.profile) ?? COMPARTMENTS[1]
    const app = profile.apps.find((a) => a.id === selected.app) ?? profile.apps[0]
    return { profile, app }
  }

  function renderDetail() {
    const lang = getLang()
    const { profile, app } = find()
    detail.innerHTML = `
      <span class="cpd-profile">${profile.name[lang]}</span>
      <h3 class="cpd-app">${app.name[lang]}</h3>
      <div class="cpd-block">
        <h4>${ui('comp.hPerms', lang)}</h4>
        <ul class="cpd-perms">${
          app.perms[lang].length
            ? app.perms[lang].map((p) => `<li>${p}</li>`).join('')
            : `<li class="none">${ui('comp.none', lang)}</li>`
        }</ul>
      </div>
      <div class="cpd-block">
        <h4>${ui('comp.hNet', lang)}</h4>
        <p class="cpd-net">${app.net[lang]}</p>
      </div>
      <p class="cpd-note">${app.note[lang]}</p>`
    swapPanel(detail)
  }

  function render() {
    const lang = getLang()
    tree.innerHTML = `<p class="comp-tree-root">${ui('comp.root', lang)}</p>`
    COMPARTMENTS.forEach((profile) => {
      const block = document.createElement('div')
      block.className = 'comp-block'
      block.innerHTML = `
        <p class="comp-name">${profile.name[lang]}</p>
        <p class="comp-sub">${profile.sub[lang]}</p>
        <div class="comp-apps"></div>`
      const apps = block.querySelector('.comp-apps')!
      profile.apps.forEach((app) => {
        const b = document.createElement('button')
        b.className = 'comp-app' + (selected.profile === profile.id && selected.app === app.id ? ' active' : '')
        b.textContent = app.name[lang]
        b.setAttribute('aria-label', `${app.name[lang]} — ${profile.name[lang]}`)
        b.addEventListener('click', () => {
          selected = { profile: profile.id, app: app.id }
          tree.querySelectorAll('.comp-app').forEach((el) => el.classList.remove('active'))
          b.classList.add('active')
          renderDetail()
        })
        apps.appendChild(b)
      })
      tree.appendChild(block)
    })
    renderDetail()
  }

  render()
  onChange(render)
}
