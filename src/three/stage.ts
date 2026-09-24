/* ==========================================================================
   The WebGL stage — one fixed canvas serving both the hero and the
   scroll-driven device story. Targets are set from scroll triggers; the
   render loop damps toward them with physical intuition.
   ========================================================================== */

import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildDevice, buildParticles, buildGroundShadow, type DeviceParts } from './device'
import { clamp, damp, ramp, prefersReducedMotion, webglSupported } from '../lib/util'
import { getLang, type Lang } from '../i18n'
import { ui } from '../i18n/ui'

export interface StageHandle {
  ok: boolean
  setHeroProgress(p: number): void
  setStoryProgress(p: number): void
  setPointer(x: number, y: number): void
  setStage(i: number): void
  /** 0..1 — mirrors the canvas fade; rendering pauses entirely at 0. */
  setOpacity(v: number): void
  /** Swap WebGL label texts + on-device screen language. */
  setLang(lang: Lang): void
  dispose(): void
}

export function createStage(canvas: HTMLCanvasElement, labelHost: HTMLElement): StageHandle {
  if (!webglSupported()) return { ok: false, setHeroProgress() {}, setStoryProgress() {}, setPointer() {}, setStage() {}, setOpacity() {}, setLang() {}, dispose() {} }

  const reduced = prefersReducedMotion()
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30)
  camera.position.set(0, 0, 3.15)

  /* studio reflections without any network fetch */
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  /* lights */
  scene.add(new THREE.AmbientLight(0x8fa3bd, 0.32))
  const key = new THREE.DirectionalLight(0xffffff, 2.0)
  key.position.set(2.4, 3.2, 4.2)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x7fa8d0, 3.2)
  rim.position.set(-3.4, 1.4, -3.2)
  scene.add(rim)
  const fill = new THREE.DirectionalLight(0x3d5a80, 0.9)
  fill.position.set(0.4, -2.6, 2.8)
  scene.add(fill)

  /* device + environment */
  const device: DeviceParts = buildDevice(getLang())
  device.group.position.y = -0.5
  scene.add(device.group)

  const shadow = buildGroundShadow()
  shadow.position.y = -1.02
  scene.add(shadow)

  const particles = buildParticles()
  scene.add(particles)

  /* DOM labels for exploded layers */
  const lang0 = getLang()
  const labelEls: HTMLDivElement[] = Array.from({ length: 7 }, (_, i) => {
    const el = document.createElement('div')
    el.className = 'dev-label'
    el.innerHTML = `<span class="dev-label-line"></span><span class="dev-label-text">${ui(`gl.${i}`, lang0)}</span>`
    labelHost.appendChild(el)
    return el
  })

  /* ---- state targets ---- */
  let heroP = 0
  let storyP = 0
  let inStory = false
  let pointerX = 0
  let pointerY = 0
  let pointerTX = 0
  let pointerTY = 0
  let activeStage = -1
  let visible = true

  /* live values, damped */
  let rotY = -0.42
  let rotX = 0.07
  let posY = -0.5
  let scaleV = 1
  let shellO = 1
  let screenO = 1
  let explodeV = 0

  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    /* keep the device inside narrow viewports */
    const fit = camera.aspect < 0.75 ? 0.82 * (camera.aspect / 0.75) + 0.18 : 1
    scene.userData.fit = fit
  }
  resize()
  window.addEventListener('resize', resize)

  const v3 = new THREE.Vector3()

  let last = performance.now()
  let raf = 0
  let running = true

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    /* canvas fully faded (past the story) → skip all render work */
    if (!visible) {
      last = now
      return
    }
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const t = now / 1000

    /* pointer parallax (disabled for reduced motion) */
    if (!reduced) {
      pointerX = damp(pointerX, pointerTX, 4, dt)
      pointerY = damp(pointerY, pointerTY, 4, dt)
    }

    /* ----- choreography ----- */
    const idle = reduced ? 0 : Math.sin(t * 0.5) * 0.045
    const storyWeight = clamp((storyP - 0.02) / 0.06, 0, 1) // how deep into the story we are
    inStory = storyP > 0.001

    let targetRotY: number
    let targetRotX: number
    let targetPosY: number
    let targetScale: number
    let targetShell: number
    let targetScreen: number
    let targetExplode: number

    if (inStory) {
      targetRotY = ramp(storyP, [[0, -0.42], [0.12, -1.08], [0.88, -1.08], [1, -0.42]]) + idle * (1 - storyWeight)
      targetRotX = ramp(storyP, [[0, 0.07], [0.12, 0.115], [0.88, 0.115], [1, 0.07]])
      targetPosY = -0.05
      targetScale = ramp(storyP, [[0, 1], [0.4, 1.06], [0.8, 1.06], [1, 1]])
      targetShell = ramp(storyP, [[0, 1], [0.14, 1], [0.3, 0.13], [0.82, 0.13], [0.96, 1]])
      targetScreen = ramp(storyP, [[0, 1], [0.12, 1], [0.24, 0], [0.9, 0], [1, 1]])
      targetExplode = ramp(storyP, [[0.18, 0], [0.46, 1], [0.8, 1], [0.96, 0]])
    } else {
      targetRotY = -0.42 - heroP * 0.5 + idle + pointerX * 0.16
      targetRotX = 0.07 + heroP * 0.1 + pointerY * 0.08
      targetPosY = -0.5 + heroP * 0.55
      targetScale = 1
      targetShell = 1
      targetScreen = 1
      targetExplode = 0
    }

    const lambda = reduced ? 60 : 7
    rotY = damp(rotY, targetRotY, lambda, dt)
    rotX = damp(rotX, targetRotX, lambda, dt)
    posY = damp(posY, targetPosY, lambda, dt)
    scaleV = damp(scaleV, targetScale, lambda, dt)
    shellO = damp(shellO, targetShell, lambda, dt)
    screenO = damp(screenO, targetScreen, lambda, dt)
    explodeV = damp(explodeV, targetExplode, lambda, dt)

    const fit = (scene.userData.fit as number) || 1
    device.group.rotation.y = rotY
    device.group.rotation.x = rotX
    device.group.position.y = posY + (reduced ? 0 : Math.sin(t * 0.8) * 0.008)
    device.group.scale.setScalar(scaleV * fit)
    device.setShellOpacity(shellO)
    device.setScreenOpacity(screenO)

    /* slabs */
    for (let i = 0; i < device.slabs.length; i++) {
      const e = clamp(explodeV * 1.22 - i * 0.045, 0, 1)
      device.slabs[i].position.z = device.slabHome[i] + (device.slabSpread[i] - device.slabHome[i]) * e
      ;(device.slabs[i].material as THREE.MeshPhysicalMaterial).opacity = e * 0.34
      ;(device.slabEdges[i].material as THREE.LineBasicMaterial).opacity = e * (i === activeStage ? 1 : 0.45)
      device.slabs[i].visible = e > 0.01
      device.slabEdges[i].visible = e > 0.01
    }

    if (!reduced) particles.rotation.y = t * 0.02

    shadow.position.x = Math.sin(rotY) * 0.3
    ;(shadow.material as THREE.MeshBasicMaterial).opacity = clamp(0.85 - explodeV * 0.55, 0, 1)

    renderer.render(scene, camera)

    /* project label anchors */
    if (explodeV > 0.05) {
      const w = window.innerWidth
      const h = window.innerHeight
      for (let i = 0; i < labelEls.length; i++) {
        const el = labelEls[i]
        const show = i === activeStage && inStory
        if (!show) {
          if (el.classList.contains('on')) el.classList.remove('on')
          continue
        }
        device.labelAnchors[i].getWorldPosition(v3)
        v3.project(camera)
        el.style.left = `${(v3.x * 0.5 + 0.5) * w}px`
        el.style.top = `${(-v3.y * 0.5 + 0.5) * h}px`
        if (!el.classList.contains('on')) el.classList.add('on')
      }
    } else {
      for (const el of labelEls) el.classList.remove('on')
    }
  }

  raf = requestAnimationFrame(frame)

  return {
    ok: true,
    setHeroProgress(p: number) { heroP = clamp(p, 0, 1) },
    setStoryProgress(p: number) { storyP = clamp(p, 0, 1) },
    setPointer(x: number, y: number) { pointerTX = clamp(x, -1, 1); pointerTY = clamp(y, -1, 1) },
    setStage(i: number) { activeStage = i },
    setOpacity(v: number) { visible = v > 0.02 },
    setLang(lang: Lang) {
      labelEls.forEach((el, i) => {
        const txt = el.querySelector('.dev-label-text')
        if (txt) txt.textContent = ui(`gl.${i}`, lang)
      })
      device.setScreenLang(lang)
    },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      pmrem.dispose()
    },
  }
}
