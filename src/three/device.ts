/* ==========================================================================
   Procedural flagship device — PBR materials, no external assets.
   Frame / glass / screen / camera module / buttons + 7 internal layer slabs
   used by the exploded-view choreography.
   ========================================================================== */

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export interface DeviceParts {
  group: THREE.Group
  /** Opacity-controlled shell meshes (frame + both glass faces). */
  shellMaterials: THREE.MeshPhysicalMaterial[]
  screenMaterial: THREE.MeshBasicMaterial
  slabs: THREE.Mesh[]
  slabEdges: THREE.LineSegments[]
  slabHome: number[]
  slabSpread: number[]
  labelAnchors: THREE.Object3D[]
  setShellOpacity(v: number): void
  setScreenOpacity(v: number): void
}

/** Minimal "secure lock screen" drawn to a canvas texture. */
function makeScreenTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 1024
  const g = c.getContext('2d')!
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  tex.colorSpace = THREE.SRGBColorSpace

  const draw = () => {

  const bg = g.createLinearGradient(0, 0, 0, 1024)
  bg.addColorStop(0, '#0a0d12')
  bg.addColorStop(0.5, '#070a0e')
  bg.addColorStop(1, '#0a0d13')
  g.fillStyle = bg
  g.fillRect(0, 0, 512, 1024)

  // faint vertical sheen
  const sheen = g.createLinearGradient(0, 0, 512, 0)
  sheen.addColorStop(0, 'rgba(143,179,217,0)')
  sheen.addColorStop(0.5, 'rgba(143,179,217,0.045)')
  sheen.addColorStop(1, 'rgba(143,179,217,0)')
  g.fillStyle = sheen
  g.fillRect(0, 0, 512, 1024)

  // status bar
  g.fillStyle = 'rgba(255,255,255,0.35)'
  g.font = '500 18px "JetBrains Mono", monospace'
  g.textAlign = 'left'
  g.fillText('09:41', 34, 44)
  g.textAlign = 'right'
  g.fillText('▂▄▆  ⏻', 480, 44)

  // lock glyph
  g.strokeStyle = 'rgba(143,179,217,0.9)'
  g.lineWidth = 5
  g.beginPath()
  g.arc(256, 400, 26, Math.PI, 0)
  g.stroke()
  g.strokeRect(256 - 40, 400, 80, 62)
  g.fillStyle = 'rgba(143,179,217,0.9)'
  g.beginPath()
  g.arc(256, 428, 7, 0, Math.PI * 2)
  g.fill()

  // time + date
  g.fillStyle = 'rgba(238,241,244,0.92)'
  g.font = '600 88px "Space Grotesk", system-ui, sans-serif'
  g.textAlign = 'center'
  g.fillText('09:41', 256, 580)
  g.fillStyle = 'rgba(166,174,184,0.8)'
  g.font = '400 24px "Inter", system-ui, sans-serif'
  g.fillText('Thursday, September 24', 256, 622)

  // footer
  g.fillStyle = 'rgba(143,179,217,0.55)'
  g.font = '500 15px "JetBrains Mono", monospace'
  g.fillText('FBE ACTIVE · KEYS SEALED', 256, 952)
  }

  draw()
  /* redraw once webfonts are ready so the texture uses the display face */
  if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
    ;(document as any).fonts.ready.then(() => {
      draw()
      tex.needsUpdate = true
    })
  }
  return tex
}

export function buildDevice(): DeviceParts {
  const group = new THREE.Group()

  const W = 0.72
  const H = 1.5
  const D = 0.08

  /* ---- frame (machined metal) ---- */
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x9aa2ac,
    metalness: 0.96,
    roughness: 0.34,
    envMapIntensity: 1.1,
    transparent: true,
  })
  const frame = new THREE.Mesh(new RoundedBoxGeometry(W + 0.015, H + 0.015, D, 5, 0.041), frameMat)
  group.add(frame)

  /* ---- back glass ---- */
  const backGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1117,
    metalness: 0.25,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.25,
    transparent: true,
  })
  const backGlass = new THREE.Mesh(new RoundedBoxGeometry(W - 0.012, H - 0.012, 0.026, 4, 0.036), backGlassMat)
  backGlass.position.z = -D / 2 + 0.002
  group.add(backGlass)

  /* ---- front glass ---- */
  const frontGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x05070a,
    metalness: 0.1,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.4,
    transparent: true,
  })
  const frontGlass = new THREE.Mesh(new RoundedBoxGeometry(W - 0.012, H - 0.012, 0.026, 4, 0.036), frontGlassMat)
  frontGlass.position.z = D / 2 - 0.002
  group.add(frontGlass)

  /* ---- screen ---- */
  const screenMat = new THREE.MeshBasicMaterial({
    map: makeScreenTexture(),
    transparent: true,
    toneMapped: false,
  })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.062, H - 0.075), screenMat)
  screen.position.z = D / 2 + 0.0115
  group.add(screen)

  /* ---- camera module (back) ---- */
  const cam = new THREE.Group()
  const plateMat = new THREE.MeshPhysicalMaterial({
    color: 0x14181e,
    metalness: 0.7,
    roughness: 0.28,
    envMapIntensity: 1.1,
  })
  const plate = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.3, 0.02, 3, 0.05), plateMat)
  cam.add(plate)

  const ringMat = new THREE.MeshPhysicalMaterial({ color: 0x3a4048, metalness: 1, roughness: 0.35 })
  const lensGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x04060a,
    metalness: 0.4,
    roughness: 0.04,
    clearcoat: 1,
    envMapIntensity: 1.6,
  })
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x0a1626,
    roughness: 0.15,
    metalness: 0.2,
    emissive: 0x12233c,
    emissiveIntensity: 0.55,
  })

  const lensAt = (x: number, y: number) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.058, 0.02, 40), ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.set(x, y, -0.012)
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.022, 40), lensGlassMat)
    glass.rotation.x = Math.PI / 2
    glass.position.set(x, y, -0.014)
    const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.024, 24), pupilMat)
    pupil.rotation.x = Math.PI / 2
    pupil.position.set(x, y, -0.015)
    cam.add(ring, glass, pupil)
  }
  lensAt(-0.072, 0.072)
  lensAt(0.072, 0.072)
  lensAt(-0.072, -0.072)

  const flash = new THREE.Mesh(
    new THREE.CylinderGeometry(0.021, 0.021, 0.012, 24),
    new THREE.MeshStandardMaterial({ color: 0xd8d3bd, roughness: 0.4, emissive: 0x443f2c, emissiveIntensity: 0.35 }),
  )
  flash.rotation.x = Math.PI / 2
  flash.position.set(0.072, -0.072, -0.011)
  cam.add(flash)

  cam.position.set(-W / 2 + 0.21, H / 2 - 0.23, -D / 2 - 0.008)
  group.add(cam)

  /* ---- side buttons ---- */
  const btnMat = new THREE.MeshPhysicalMaterial({ color: 0x868d97, metalness: 1, roughness: 0.4 })
  const mkBtn = (y: number, h: number) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.012, h, 0.02, 2, 0.005), btnMat)
    b.position.set(W / 2 + 0.012, y, 0)
    group.add(b)
  }
  mkBtn(0.28, 0.14) // volume
  mkBtn(0.08, 0.08) // power

  /* ---- internal layer slabs (exploded view) ---- */
  const slabColors = [0x6f8db0, 0x7fa0c4, 0x8fb3d9, 0x9fc2e2, 0x8fb3d9, 0x7fa0c4, 0xbcd4ea]
  const slabs: THREE.Mesh[] = []
  const slabEdges: THREE.LineSegments[] = []
  const slabHome: number[] = []
  const slabSpread: number[] = []
  const labelAnchors: THREE.Object3D[] = []

  for (let i = 0; i < 7; i++) {
    const geo = new THREE.BoxGeometry(W - 0.12, H - 0.18, 0.006)
    const mat = new THREE.MeshPhysicalMaterial({
      color: slabColors[i],
      transparent: true,
      opacity: 0,
      roughness: 0.35,
      metalness: 0.4,
      emissive: slabColors[i],
      emissiveIntensity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const slab = new THREE.Mesh(geo, mat)
    const home = -0.024 + i * 0.008
    const spread = -0.52 + i * 0.175
    slab.position.z = home
    slabHome.push(home)
    slabSpread.push(spread)

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x9fc2e2, transparent: true, opacity: 0 }),
    )
    slab.add(edges)

    const anchor = new THREE.Object3D()
    anchor.position.set((W - 0.12) / 2 + 0.03, 0, 0)
    slab.add(anchor)

    group.add(slab)
    slabs.push(slab)
    slabEdges.push(edges)
    labelAnchors.push(anchor)
  }

  const shellMaterials = [frameMat, backGlassMat, frontGlassMat]

  return {
    group,
    shellMaterials,
    screenMaterial: screenMat,
    slabs,
    slabEdges,
    slabHome,
    slabSpread,
    labelAnchors,
    setShellOpacity(v: number) {
      for (const m of shellMaterials) m.opacity = v
      frame.visible = backGlass.visible = frontGlass.visible = v > 0.02
    },
    setScreenOpacity(v: number) {
      screenMat.opacity = v
      screen.visible = v > 0.02
    },
  }
}

/* Small ambient particle field — barely-there data dust. */
export function buildParticles(count = 340): THREE.Points {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 1.35 + Math.random() * 1.9
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.8
    pos[i * 3 + 2] = r * Math.cos(phi) * 0.7
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    color: 0x6f8db0,
    size: 0.0075,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    sizeAttenuation: true,
  })
  return new THREE.Points(geo, mat)
}

/* Soft radial ground shadow. */
export function buildGroundShadow(): THREE.Mesh {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 8, 128, 128, 126)
  grad.addColorStop(0, 'rgba(0,0,0,0.62)')
  grad.addColorStop(0.55, 'rgba(0,0,0,0.22)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.5),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  )
  mesh.rotation.x = -Math.PI / 2
  return mesh
}
