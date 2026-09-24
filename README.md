# Android Privacy Fortress

> **By [Abdulmoin Hablas](https://hablas.tech)** · © 2026 — All rights reserved (see [LICENSE](./LICENSE)) · Live: <https://android-privacy-fortress.vercel.app>

An interactive essay on the smartphone as a **layered security system** — hardware trust,
verified boot, OS isolation, cryptography, network control, identity separation, metadata
protection, and physical security, explored through a scroll-driven 3D device and a set of
hands-on architectural instruments.

**The one idea:** a privacy-focused Android device is not protected by one feature. It is
protected by layers of trust, isolation, cryptography, controlled communication, identity
separation, and carefully defined boundaries.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle → dist/
npm run preview    # serve the production build
npx vitest run     # DOM smoke suite (15 tests)
```

> The 3D stage uses a procedural PBR device (Three.js + `RoomEnvironment`) — no external
> model files, fully self-contained and offline-capable. If WebGL is unavailable the site
> degrades to a fully readable, unpin’d narrative layout.

## Experience map

| # | Section | Interaction |
|---|---------|-------------|
| 01 | Hero | Procedural 3D flagship, pointer parallax, scroll-launched rotation |
| 02 | Why privacy is a system | Failure-mode triad + precise terminology (confidentiality ≠ anonymity …) |
| 03 | Device story | Pinned 3600px scrub: shell turns glass → 7 internal layers explode → labeled stages |
| 04 | Trust boundaries | 9 layers; hover/focus dims siblings, click locks, Esc releases |
| 05 | Architecture | Device stack vs network path, RIL bridge, radio trust boundary |
| 06 | Ten security domains | Full explorer: objective, surface, assets, tech, attack/mitigation, relations |
| 07 | Miniature functional model | 3 scenarios (malicious app / stolen BFU device / network observer) with event log |
| 08 | Network + metadata | Direct/VPN/Tor re-routing with animated packets; content ≠ metadata contrast |
| 09 | Cellular / baseband | Separate radio trust domain; IMEI/IMSI/tower facts, honest mitigations |
| 10 | Physical security | 6 device states × 5 threats protection matrix (BFU is the headline state) |
| 11 | Side channels | 6 restrained observational visualizations (timing, power, EM, cache, sensors, traffic) |
| 12 | Supply chain | Source→Compiler→Build→Signing→OTA→Device, per-stage detail |
| 13 | Privacy by default | Least-privilege toggle panel with live exposure counter + compartment map |
| 14 | Complete system | Full architecture assembled (SVG), animated on entry |
| 15 | Finale | System collapses into a single device — “Security is not a feature. It is an architecture of trust.” |

## Technology

- **Vite + TypeScript** — strict mode, no `any` in app code.
- **Three.js (vanilla)** — procedural device with metal/glass `MeshPhysicalMaterial`s,
  PMREM studio reflections, ACES tone mapping; DPR capped at 2; render loop pauses when
  the canvas is fully faded; `prefers-reduced-motion` disables parallax/idle motion and
  shortens all choreography.
- **GSAP ScrollTrigger** — hero hand-off, pinned scrub story, canvas fade-out hand-off.
- **Lenis** — inertial smoothing, skipped entirely under reduced motion.
- **Hand-rolled SVG instruments** — network packets, side-channel traces, system diagram
  (no chart libraries).
- **15-test jsdom suite** — boots the real `main.ts` and exercises every module’s wiring.

## Design system

Obsidian (`#050608`) · white type · steel-blue accent (`#8fb3d9`) · hairline borders ·
glass panels. Display: Space Grotesk · Body: Inter · Technical: JetBrains Mono.
Every animation communicates state, hierarchy, causality, depth, isolation, or transition.

## Content integrity

All copy is deliberately precise: layers *raise cost* and *shrink surface*; nothing is
claimed to be “unhackable”, “untraceable”, or “100% secure”. Content privacy, metadata
privacy, anonymity, and physical security are treated as distinct properties throughout.
Educational visualization — not affiliated with Google or any device maker, and not
security advice.

## Credits

**Android Privacy Fortress** — Designed & engineered by **[Abdulmoin Hablas](https://hablas.tech)**

© 2026 Abdulmoin Hablas. All rights reserved. This repository's code, design, and content
are protected under the custom license in [LICENSE](./LICENSE) — attribution required,
no commercial reuse without written permission.
