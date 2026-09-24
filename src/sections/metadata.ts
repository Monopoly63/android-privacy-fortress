/* 08b · Content vs metadata — the sealed message and the shape it leaves. */

import { METADATA_ROWS } from '../data/content'

const BLOCKS = '█▓▒░'

export function initMetadata(): void {
  const cipher = document.getElementById('meta-cipher')
  const list = document.getElementById('meta-list')
  if (!cipher || !list) return

  /* a deterministic "ciphertext" block — decorative, not real crypto */
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

  list.innerHTML = METADATA_ROWS.map(
    (row) => `<li><span>${row.k}</span><span class="mono">${row.v}</span></li>`,
  ).join('')
}
