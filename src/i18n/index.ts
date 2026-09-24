/* Lightweight i18n store — language detection, persistence, DOM direction. */

export type Lang = 'en' | 'ar'

const STORAGE_KEY = 'apf-lang'

function detect(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ar' || stored === 'en') return stored
  } catch { /* storage unavailable */ }
  if (typeof navigator !== 'undefined' && (navigator.language || '').toLowerCase().startsWith('ar')) return 'ar'
  return 'en'
}

let current: Lang = detect()
const listeners = new Set<(l: Lang) => void>()

function applyDoc(l: Lang): void {
  const el = document.documentElement
  el.lang = l
  el.dir = l === 'ar' ? 'rtl' : 'ltr'
}

/* apply direction as early as possible */
if (typeof document !== 'undefined') applyDoc(current)

export function getLang(): Lang {
  return current
}

export function setLang(l: Lang): void {
  if (l !== 'en' && l !== 'ar') return
  current = l
  try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
  applyDoc(l)
  listeners.forEach((fn) => fn(l))
}

export function onChange(fn: (l: Lang) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
