/* 08b · Content vs metadata — the sealed message and the shape it leaves. */

import { METADATA_ROWS } from '../data/content'
import { getLang, onChange } from '../i18n'
import { ui } from '../i18n/ui'

const BLOCKS = '█▓▒░'

export function initMetadata(): void {
  const cipherHost = document.getElementById('meta-cipher')
  const listHost = document.getElementById('meta-list')
  const titleEl = document.querySelector('[data-i18n="meta.contentTitle"]')
  const noteEl = document.querySelector('[data-i18n="meta.contentNote"]')
  const metaTitleEl = document.querySelector('[data-i18n="meta.metaTitle"]')
  const metaNoteEl = document.querySelector('[data-i18n="meta.metaNote"]')
  if (!cipherHost || !listHost) return
  const cipher: HTMLElement = cipherHost
  const list: HTMLElement = listHost

  /* a deterministic "ciphertext" block — decorative, not real crypto */
  function buildCipher() {
    let html = ''
    const rows = 4
    const cols = 26
    let seed = 41
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = BLOCKS[Math.floor(rnd() * BLOCKS.length)]
        const o = (0.4 + rnd() * 0.6).toFixed(2)
        html += `<span style="opacity:${o}">${ch}</span>`
      }
      html += '<br/>'
    }
    cipher.innerHTML = html
  }

  function render() {
    const lang = getLang()
    list.innerHTML = METADATA_ROWS.map(
      (row) => `<li><span>${row.k[lang]}</span><span class="mono">${row.v[lang]}</span></li>`,
    ).join('')
    if (titleEl) titleEl.innerHTML = ui('meta.contentTitle', lang)
    if (noteEl) noteEl.innerHTML = ui('meta.contentNote', lang)
    if (metaTitleEl) metaTitleEl.innerHTML = ui('meta.metaTitle', lang)
    if (metaNoteEl) metaNoteEl.innerHTML = ui('meta.metaNote', lang)
  }

  buildCipher()
  render()
  onChange(render)
}
