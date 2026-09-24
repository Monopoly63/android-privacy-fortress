/* ==========================================================================
   ◇ VISUAL — a wordless, scroll-driven circuit.
   Silicon die → board city → signal storm → crypto core.
   No copy. Glyphs and geometry only.
   ========================================================================== */

import '../style.css'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { clamp, damp, lerp, ramp, prefersReducedMotion, webglSupported, smoothstep } from '../lib/util'

const STEEL = 0x8fb3d9

interface Poly { pts: THREE.Vector3[]; cum: number[]; total: number }

function boot(): void {
  const canvas = document.getElementById('lab-gl') as HTMLCanvasElement
  const fallback = document.getElementById('lab-fallback') as HTMLElement
  if (!canvas || !webglSupported()) {
    if (fallback) fallback.hidden = false
    if (canvas) canvas.style.display = 'none'
    return
  }

  const reduced = prefersReducedMotion()
  const mobile = window.matchMedia('(max-width: 768px)').matches

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x050608, 1)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x050608, 4.2, 10.5)

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 30)
  camera.position.set(2.2, 0.9, 3.2)

  scene.add(new THREE.AmbientLight(0x8fa3bd, 0.35))
  const key = new THREE.DirectionalLight(0xffffff, 1.6)
  key.position.set(2.5, 4, 3)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x7fa8d0, 2.2)
  rim.position.set(-3, 2, -3)
  scene.add(rim)

  /* ---------- substrate + procedural traces ---------- */

  const BOARD_W = 7
  const BOARD_D = 5.25
  const polylines: Poly[] = []

  function buildTraces() {
    const W = 1024
    const H = 768
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')!
    g.fillStyle = '#090d12'
    g.fillRect(0, 0, W, H)

    // reference pad grid
    g.strokeStyle = 'rgba(255,255,255,0.045)'
    g.lineWidth = 1
    for (let x = 32; x < W; x += 64) {
      for (let y = 32; y < H; y += 64) {
        g.beginPath()
        g.arc(x, y, 2.2, 0, Math.PI * 2)
        g.stroke()
      }
    }

    const cols = ['rgba(143,179,217,0.34)', 'rgba(143,179,217,0.55)', 'rgba(190,212,235,0.7)']
    for (let i = 0; i < 170; i++) {
      let x = 32 + Math.floor((Math.random() * (W - 64)) / 32) * 32
      let y = 32 + Math.floor((Math.random() * (H - 64)) / 32) * 32
      const dx = Math.random() < 0.5 ? 1 : -1
      const dz = Math.random() < 0.5 ? 1 : -1
      const horiz = Math.random() < 0.5
      const pts: Array<[number, number]> = [[x, y]]
      g.beginPath()
      g.moveTo(x, y)
      g.strokeStyle = cols[Math.floor(Math.random() * cols.length)]
      g.lineWidth = 1.6
      const steps = 6 + Math.floor(Math.random() * 10)
      for (let s = 0; s < steps; s++) {
        const len = (1 + Math.floor(Math.random() * 5)) * 32
        if (s % 2 === (horiz ? 0 : 1)) x += len * dx
        else y += len * dz
        x = Math.max(16, Math.min(W - 16, x))
        y = Math.max(16, Math.min(H - 16, y))
        g.lineTo(x, y)
        pts.push([x, y])
      }
      g.stroke()
      g.fillStyle = 'rgba(143,179,217,0.55)'
      for (const [px, py] of [pts[0], pts[pts.length - 1]]) {
        g.beginPath()
        g.arc(px, py, 4, 0, Math.PI * 2)
        g.fill()
      }
      if (Math.random() < 0.4 && pts.length > 2) {
        // store in board space for travelling pulses
        const v = pts.map(([px, py]) => new THREE.Vector3((px / W - 0.5) * BOARD_W, 0.015, (py / H - 0.5) * BOARD_D))
        const cum = [0]
        for (let k = 1; k < v.length; k++) cum.push(cum[k - 1] + v[k].distanceTo(v[k - 1]))
        polylines.push({ pts: v, cum, total: cum[cum.length - 1] })
      }
    }

    // QFP footprints — tick arrays around empty rectangles
    g.strokeStyle = 'rgba(143,179,217,0.3)'
    for (let i = 0; i < 10; i++) {
      const x = 80 + Math.floor(Math.random() * ((W - 260) / 32)) * 32
      const y = 80 + Math.floor(Math.random() * ((H - 220) / 32)) * 32
      const w = 96 + Math.floor(Math.random() * 3) * 32
      const h = 96 + Math.floor(Math.random() * 2) * 32
      for (let k = 0; k <= w; k += 16) {
        g.beginPath(); g.moveTo(x + k, y - 10); g.lineTo(x + k, y - 2); g.stroke()
        g.beginPath(); g.moveTo(x + k, y + h + 2); g.lineTo(x + k, y + h + 10); g.stroke()
      }
      for (let k = 0; k <= h; k += 16) {
        g.beginPath(); g.moveTo(x - 10, y + k); g.lineTo(x - 2, y + k); g.stroke()
        g.beginPath(); g.moveTo(x + w + 2, y + k); g.lineTo(x + w + 10, y + k); g.stroke()
      }
    }

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }

  const traceTex = buildTraces()
  const substrateMat = new THREE.MeshBasicMaterial({ map: traceTex })
  const substrate = new THREE.Mesh(new THREE.PlaneGeometry(BOARD_W, BOARD_D), substrateMat)
  substrate.rotation.x = -Math.PI / 2
  scene.add(substrate)

  // glowing board edge
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(BOARD_W, BOARD_D)),
    new THREE.LineBasicMaterial({ color: STEEL, transparent: true, opacity: 0.28 }),
  )
  edge.rotation.x = -Math.PI / 2
  edge.position.y = 0.002
  scene.add(edge)

  // corner screws
  const screwMat = new THREE.MeshStandardMaterial({ color: 0x59616c, metalness: 1, roughness: 0.35 })
  for (const [sx, sz] of [[-3.3, -2.4], [3.3, -2.4], [-3.3, 2.4], [3.3, 2.4]]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 20), screwMat)
    s.position.set(sx, 0.012, sz)
    scene.add(s)
  }

  /* ---------- die blocks ---------- */

  const dieCount = mobile ? 110 : 200
  const dieMat = new THREE.MeshStandardMaterial({ color: 0x11161d, metalness: 0.65, roughness: 0.4 })
  const die = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 1, 0.09), dieMat, dieCount)
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x0c1016,
    emissive: STEEL,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  })
  const glow = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 1, 0.07), glowMat, dieCount)
  const m4 = new THREE.Matrix4()
  let glowIdx = 0
  for (let i = 0; i < dieCount; i++) {
    const x = (Math.random() - 0.5) * 5.6
    const z = -2.1 + Math.random() * 1.5
    const h = 0.04 + Math.random() * 0.16
    m4.makeScale(1, h, 1)
    m4.setPosition(x, h / 2, z)
    die.setMatrixAt(i, m4)
    if (Math.random() < 0.32 && glowIdx < dieCount) {
      m4.makeScale(1, 0.006, 1)
      m4.setPosition(x, h + 0.004, z)
      glow.setMatrixAt(glowIdx++, m4)
    }
  }
  glow.count = glowIdx
  scene.add(die, glow)

  /* ---------- components sector ---------- */

  const capMat = new THREE.MeshStandardMaterial({ color: 0x9aa2ac, metalness: 1, roughness: 0.3 })
  const caps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.032, 0.032, 0.085, 14), capMat, mobile ? 30 : 52)
  const resMat = new THREE.MeshStandardMaterial({ color: 0x161b22, roughness: 0.55 })
  const ress = new THREE.InstancedMesh(new THREE.BoxGeometry(0.062, 0.02, 0.026), resMat, mobile ? 22 : 38)
  const icMat = new THREE.MeshStandardMaterial({ color: 0x0b0e13, metalness: 0.4, roughness: 0.5 })
  const ics = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.032, 0.17), icMat, 12)
  const place = (mesh: THREE.InstancedMesh, n: number, y: number, zMin: number, zMax: number, sx = 1, sz = 1) => {
    for (let i = 0; i < n; i++) {
      m4.identity()
      m4.setPosition((Math.random() - 0.5) * 5.6 * sx, y, zMin + Math.random() * (zMax - zMin))
      mesh.setMatrixAt(i, m4)
    }
  }
  place(caps, caps.count, 0.043, 0.35, 2.2)
  place(ress, ress.count, 0.011, 0.35, 2.2, 1.2, 1)
  place(ics, ics.count, 0.017, 0.5, 2.0)

  // heatsink fin array
  const finMat = new THREE.MeshStandardMaterial({ color: 0x79828d, metalness: 0.95, roughness: 0.42 })
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 0.16, 0.52), finMat, 12)
  for (let i = 0; i < 12; i++) {
    m4.identity()
    m4.setPosition(1.15 + i * 0.036, 0.08, 1.05)
    fins.setMatrixAt(i, m4)
  }

  // fan
  const fan = new THREE.Group()
  const fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.014, 10, 60), finMat)
  fanRing.rotation.x = Math.PI / 2
  fan.add(fanRing)
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x39414c, metalness: 0.8, roughness: 0.4 })
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.008, 0.1), bladeMat)
    const a = (i / 7) * Math.PI * 2
    b.position.set(Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15)
    b.rotation.y = -a + 0.7
    fan.add(b)
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 20), capMat)
  fan.add(hub)
  fan.position.set(-1.1, 0.06, 1.1)
  scene.add(caps, ress, ics, fins, fan)

  /* ---------- signal rain ---------- */

  const rainCount = mobile ? 90 : 170
  const rainMat = new THREE.MeshBasicMaterial({ color: STEEL, transparent: true, opacity: 0 })
  const rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.004, 0.14, 0.004), rainMat, rainCount)
  const rainP: Array<{ x: number; z: number; y: number; v: number }> = []
  for (let i = 0; i < rainCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 2.3 + Math.random() * 1.1
    rainP.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y: Math.random() * 3, v: 0.25 + Math.random() * 0.6 })
  }

  /* ---------- travelling pulses ---------- */

  const pulseCount = mobile ? 26 : 52
  const pulseMat = new THREE.PointsMaterial({
    color: 0xd7e6f6,
    size: 0.045,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })
  const pulsePos = new Float32Array(pulseCount * 3)
  const pulseGeo = new THREE.BufferGeometry()
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3))
  const pulses = new THREE.Points(pulseGeo, pulseMat)
  // fallback route just in case trace generation ever yields nothing
  if (polylines.length === 0) {
    const a = new THREE.Vector3(-2.5, 0.02, 0)
    const b = new THREE.Vector3(2.5, 0.02, 0)
    polylines.push({ pts: [a, b], cum: [0, a.distanceTo(b)], total: a.distanceTo(b) })
  }
  const pulseState = Array.from({ length: pulseCount }, () => ({
    poly: polylines[Math.floor(Math.random() * polylines.length)],
    t: Math.random(),
    v: 0.05 + Math.random() * 0.14,
  }))
  scene.add(pulses)

  function samplePoly(p: Poly, t: number, out: THREE.Vector3): void {
    const d = t * p.total
    let i = 1
    while (i < p.cum.length && p.cum[i] < d) i++
    const i0 = Math.min(i - 1, p.pts.length - 2)
    const segLen = p.cum[i0 + 1] - p.cum[i0] || 1
    const u = (d - p.cum[i0]) / segLen
    out.lerpVectors(p.pts[i0], p.pts[i0 + 1], clamp(u, 0, 1))
  }

  /* ---------- crypto core ---------- */

  const core = new THREE.Group()
  core.position.set(0, 1.12, 0)
  core.visible = false

  const shellMat = new THREE.MeshBasicMaterial({ color: STEEL, wireframe: true, transparent: true, opacity: 0 })
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), shellMat)
  core.add(shell)

  const heartMat = new THREE.MeshStandardMaterial({
    color: 0x0d1420,
    emissive: STEEL,
    emissiveIntensity: 1.4,
    metalness: 0.6,
    roughness: 0.25,
    transparent: true,
    opacity: 0,
  })
  const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), heartMat)
  core.add(heart)

  const ringMats: THREE.MeshBasicMaterial[] = []
  const rings: THREE.Mesh[] = []
  for (let i = 0; i < 3; i++) {
    const rm = new THREE.MeshBasicMaterial({ color: STEEL, transparent: true, opacity: 0 })
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.16, 0.005, 8, 90), rm)
    ring.rotation.set(1.1 + i * 0.5, i * 0.9, 0.4 * i)
    ringMats.push(rm)
    rings.push(ring)
    core.add(ring)
  }

  const bitCount = 26
  const bitMat = new THREE.MeshStandardMaterial({
    color: 0x11161d,
    emissive: STEEL,
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0,
  })
  const bits = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, 0.035, 0.035), bitMat, bitCount)
  const bitP = Array.from({ length: bitCount }, (_, i) => ({
    r: 0.55 + (i % 5) * 0.09,
    a: Math.random() * Math.PI * 2,
    tilt: (Math.random() - 0.5) * 1.2,
    v: 0.25 + Math.random() * 0.5,
  }))
  core.add(bits)
  scene.add(core)

  /* ---------- post ---------- */

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), mobile ? 0.7 : 0.9, 0.55, 0.72)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    bloom.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  /* ---------- camera keyframes ---------- */

  const STOPS: Array<{ t: number; pos: number[]; look: number[] }> = [
    { t: 0.0, pos: [2.3, 0.7, 3.1], look: [0.2, 0.15, -0.4] },
    { t: 0.16, pos: [1.2, 1.9, 2.5], look: [0, 0.1, -0.2] },
    { t: 0.34, pos: [0, 4.4, 3.4], look: [0, 0, 0] },
    { t: 0.52, pos: [-1.7, 1.0, 1.7], look: [-0.5, 0.05, -0.3] },
    { t: 0.66, pos: [-0.4, 1.3, 2.1], look: [0, 0.7, 0] },
    { t: 0.82, pos: [0.6, 1.9, 3.9], look: [0, 0.75, 0] },
    { t: 1.0, pos: [1.9, 1.3, 4.6], look: [0, 0.6, 0] },
  ]

  const camPos = new THREE.Vector3(...(STOPS[0].pos as [number, number, number]))
  const camLook = new THREE.Vector3(...(STOPS[0].look as [number, number, number]))
  const tmpPos = new THREE.Vector3()
  const tmpLook = new THREE.Vector3()

  function targets(p: number) {
    let i = 0
    while (i < STOPS.length - 2 && p > STOPS[i + 1].t) i++
    const a = STOPS[i]
    const b = STOPS[i + 1]
    const u = smoothstep(clamp((p - a.t) / (b.t - a.t), 0, 1))
    tmpPos.set(lerp(a.pos[0], b.pos[0], u), lerp(a.pos[1], b.pos[1], u), lerp(a.pos[2], b.pos[2], u))
    tmpLook.set(lerp(a.look[0], b.look[0], u), lerp(a.look[1], b.look[1], u), lerp(a.look[2], b.look[2], u))
  }

  /* ---------- HUD ---------- */

  const dot = document.getElementById('lab-dot')
  const scope = document.getElementById('lab-scope') as HTMLCanvasElement | null
  const scopeCtx = scope?.getContext('2d') ?? null
  const hexA = document.getElementById('lab-hex-a')
  const hexB = document.getElementById('lab-hex-b')
  const hint = document.getElementById('lab-hint')
  const scan = document.getElementById('lab-scan')

  if (!reduced && hexA && hexB) {
    const hexWord = () =>
      Array.from({ length: 4 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(' ')
    const hexAddr = () => `0x${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase()}`
    window.setInterval(() => {
      hexA!.textContent = hexWord()
      if (Math.random() < 0.4) hexB!.textContent = hexAddr()
    }, 480)
  }

  function drawScope(t: number) {
    if (!scopeCtx || reduced) return
    const w = scope!.width
    const h = scope!.height
    scopeCtx.clearRect(0, 0, w, h)
    scopeCtx.strokeStyle = 'rgba(143,179,217,0.14)'
    scopeCtx.lineWidth = 1
    scopeCtx.beginPath()
    for (let gy = 16; gy < h; gy += 16) {
      scopeCtx.moveTo(0, gy)
      scopeCtx.lineTo(w, gy)
    }
    scopeCtx.stroke()
    const env = 0.4 + 0.6 * Math.max(0, Math.sin(t * 0.5) ** 8)
    scopeCtx.strokeStyle = 'rgba(160,196,232,0.85)'
    scopeCtx.lineWidth = 1.4
    scopeCtx.beginPath()
    for (let x = 0; x <= w; x += 2) {
      const y =
        h / 2 +
        Math.sin(x * 0.075 + t * 3.1) * 13 * env +
        Math.sin(x * 0.31 - t * 5.7) * 4 * env +
        (Math.random() - 0.5) * 1.6
      if (x === 0) scopeCtx.moveTo(x, y)
      else scopeCtx.lineTo(x, y)
    }
    scopeCtx.stroke()
  }

  /* ---------- input + progress ---------- */

  let progress = 0
  let target = 0
  let mx = 0
  let my = 0
  let tmx = 0
  let tmy = 0

  function readScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight
    target = clamp(window.scrollY / Math.max(max, 1), 0, 1)
    if (hint && target > 0.02) hint.classList.add('off')
  }
  window.addEventListener('scroll', readScroll, { passive: true })
  readScroll()

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return
      tmx = (e.clientX / window.innerWidth) * 2 - 1
      tmy = (e.clientY / window.innerHeight) * 2 - 1
      const xEl = document.getElementById('lab-x')
      const yEl = document.getElementById('lab-y')
      if (xEl) xEl.style.transform = `translateY(${e.clientY}px)`
      if (yEl) yEl.style.transform = `translateX(${e.clientX}px)`
    },
    { passive: true },
  )

  /* ---------- loop ---------- */

  const pulseV = new THREE.Vector3()
  let last = performance.now()
  let raf = 0

  function tick(now: number) {
    raf = requestAnimationFrame(tick)
    if (document.hidden) {
      last = now
      return
    }
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const t = now / 1000

    progress = damp(progress, target, reduced ? 40 : 5.2, dt)
    mx = damp(mx, tmx, 4, dt)
    my = damp(my, tmy, 4, dt)

    if (dot) dot.style.top = `${(progress * 100).toFixed(2)}%`
    if (scan) scan.style.opacity = String(Math.max(0, Math.sin(t * 0.14)) * 0.12)

    targets(progress)

    const bob = reduced ? 0 : Math.sin(t * 0.6) * 0.045
    camPos.copy(tmpPos)
    camPos.x += mx * 0.22
    camPos.y += -my * 0.14 + bob
    camLook.copy(tmpLook)
    camLook.x += mx * 0.05
    camLook.y += -my * 0.03
    camera.position.copy(camPos)
    camera.lookAt(camLook)

    /* weights */
    const rainW = ramp(progress, [[0.3, 0], [0.44, 1], [0.78, 1], [0.92, 0]])
    const coreW = ramp(progress, [[0.56, 0], [0.72, 1], [0.96, 1], [1, 0.8]])
    const dimW = ramp(progress, [[0.55, 0], [0.72, 1], [0.97, 1], [1, 0.8]])

    const dk = 1 - dimW * 0.68
    substrateMat.color.setRGB(dk, dk, dk)
    dieMat.color.setRGB(0.067 * dk + 0.02, 0.086 * dk + 0.02, 0.113 * dk + 0.02)

    /* autonomous life */
    const fanV = reduced ? 0 : 3.4
    fan.rotation.y += fanV * dt

    glowMat.emissiveIntensity = 0.55 + Math.sin(t * 2.2) * 0.3 + dimW * 0.4

    /* pulses */
    const speedK = 1 + ramp(progress, [[0.42, 0], [0.6, 1.6], [0.8, 1.6], [0.95, 0]]) * (reduced ? 0 : 1)
    pulseMat.opacity = 0.95 * (1 - dimW * 0.75)
    for (let i = 0; i < pulseCount; i++) {
      const s = pulseState[i]
      if (!reduced) s.t = (s.t + s.v * dt * speedK) % 1
      samplePoly(s.poly, s.t, pulseV)
      pulsePos[i * 3] = pulseV.x
      pulsePos[i * 3 + 1] = pulseV.y
      pulsePos[i * 3 + 2] = pulseV.z
    }
    pulseGeo.attributes.position.needsUpdate = true

    /* rain */
    rainMat.opacity = 0.16 * rainW
    rain.visible = rainW > 0.02
    if (rain.visible) {
      for (let i = 0; i < rainCount; i++) {
        const r = rainP[i]
        if (!reduced) r.y += r.v * dt
        if (r.y > 3.1) r.y = -0.4
        m4.identity()
        m4.setPosition(r.x, r.y, r.z)
        rain.setMatrixAt(i, m4)
      }
      rain.instanceMatrix.needsUpdate = true
    }

    /* core */
    core.visible = coreW > 0.02
    if (core.visible) {
      if (!reduced) {
        shell.rotation.y += dt * 0.35
        shell.rotation.x += dt * 0.12
        heart.rotation.y -= dt * 0.8
        for (let i = 0; i < rings.length; i++) {
          rings[i].rotation.z += dt * (0.22 + i * 0.13) * (i % 2 ? -1 : 1)
        }
      }
      const pulse = 0.9 + Math.sin(t * 2.6) * 0.5
      shellMat.opacity = 0.42 * coreW
      heartMat.opacity = coreW
      heartMat.emissiveIntensity = 1.1 * pulse
      for (const rm of ringMats) rm.opacity = 0.5 * coreW
      bitMat.opacity = 0.95 * coreW
      for (let i = 0; i < bitCount; i++) {
        const b = bitP[i]
        if (!reduced) b.a += b.v * dt
        const x = Math.cos(b.a) * b.r
        const z = Math.sin(b.a) * b.r
        m4.identity()
        m4.setPosition(x, Math.sin(b.a * 2 + b.tilt) * 0.16, z * Math.cos(b.tilt))
        bits.setMatrixAt(i, m4)
      }
      bits.instanceMatrix.needsUpdate = true
    }

    drawScope(t)
    composer.render()
  }

  raf = requestAnimationFrame(tick)

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) last = performance.now()
  })
}

boot()

export {}
