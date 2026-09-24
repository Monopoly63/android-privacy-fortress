/* jsdom polyfills for APIs the modules touch but jsdom doesn't ship. */

// matchMedia
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// IntersectionObserver
if (!('IntersectionObserver' in window)) {
  class IO {
    constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
  }
  Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: IO })
  Object.defineProperty(globalThis, 'IntersectionObserver', { writable: true, value: IO })
}

// ResizeObserver
if (!('ResizeObserver' in window)) {
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'ResizeObserver', { writable: true, value: RO })
  Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: RO })
}

// requestAnimationFrame
if (!window.requestAnimationFrame) {
  Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: (cb: FrameRequestCallback) => window.setTimeout(() => cb(Date.now()), 0),
  })
  Object.defineProperty(window, 'cancelAnimationFrame', {
    writable: true,
    value: (id: number) => window.clearTimeout(id),
  })
}

// SVG geometry methods (jsdom defines the class but not geometry ops)
{
  const w = globalThis as any
  const protos = [w.SVGPathElement?.prototype, w.window?.SVGPathElement?.prototype, w.SVGElement?.prototype]
  for (const proto of protos) {
    if (!proto) continue
    try {
      Object.defineProperty(proto, 'getTotalLength', { value: () => 100, configurable: true, writable: true })
      Object.defineProperty(proto, 'getPointAtLength', { value: () => ({ x: 50, y: 50 }), configurable: true, writable: true })
    } catch { /* ignore */ }
  }
}

// canvas 2d context (minimal)
if (typeof HTMLCanvasElement !== 'undefined') {
  const proto = HTMLCanvasElement.prototype as any
  const noopCtx = new Proxy({}, { get: (_t, prop) => {
    if (prop === 'createLinearGradient' || prop === 'createRadialGradient')
      return () => ({ addColorStop: () => {} })
    if (prop === 'measureText') return () => ({ width: 0 })
    if (prop === 'getImageData') return () => ({ data: [] })
    return typeof prop === 'string' ? () => {} : undefined
  }})
  if (!proto.getContext || true) {
    proto.getContext = function (type: string) {
      if (type === '2d') return noopCtx
      return null // webgl unavailable → graceful fallback path
    }
  }
}
