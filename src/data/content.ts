/* ==========================================================================
   Content model — bilingual (EN/AR). English data below; Arabic mirror in
   content-ar.ts; `deepBi` zips them into {en, ar} leaf strings.
   Language is deliberately careful in both: layers "raise cost" and
   "shrink surface"; nothing is ever claimed to be absolute.
   ========================================================================== */

import AR from './content-ar'

export type Lang = 'en' | 'ar'
export interface L { en: string; ar: string }
export interface LArr { en: string[]; ar: string[] }

/** Recursively zip EN/AR structures: every string leaf becomes {en, ar}. */
function deepBi(en: any, ar: any): any {
  if (typeof en === 'string') return { en, ar: typeof ar === 'string' ? ar : en }
  if (Array.isArray(en)) {
    // arrays of strings zip wholesale into {en[], ar[]}; arrays of objects zip item-by-item
    if (en.length === 0 || typeof en[0] === 'string') {
      return { en, ar: Array.isArray(ar) ? ar : en }
    }
    return en.map((v, i) => deepBi(v, Array.isArray(ar) ? ar[i] : undefined))
  }
  if (en && typeof en === 'object') {
    const keep = new Set(['id', 'icon', 'tone', 'matrix', 'ext', 'tunnel', 'plain', 'flow', 'dashed', 'kind', 'num'])
    const out: any = {}
    for (const k of Object.keys(en)) {
      out[k] = keep.has(k) ? en[k] : deepBi(en[k], ar ? ar[k] : undefined)
    }
    return out
  }
  return en
}

/* ---------- 04 · Trust boundaries -------------------------------------- */

export interface BoundLayer {
  id: string
  name: L
  sub: L
  tag: L
  role: L
  desc: L
  access: LArr
  constrained: LArr
  isolated: LArr
  note: L
}

const EN_BOUND = [
  {
    id: 'apps',
    name: 'Applications',
    sub: 'Every third-party app',
    tag: 'UNTRUSTED',
    role: 'Confined tenant',
    desc: 'Each app runs as its own UID inside a sandbox. It owns its private storage and nothing else — every reach beyond it requires an explicit, revocable grant.',
    access: ['Its own sandboxed data', 'APIs behind granted permissions', 'IPC surfaces the framework exposes'],
    constrained: ['Permission model (deny by default)', 'App sandbox / UID isolation', 'SELinux policy over its process'],
    isolated: ["Other apps' private data", 'Kernel internals', 'TEE and key material'],
    note: 'IF THIS LAYER FAILS → one compromised app; not the device.',
  },
  {
    id: 'framework',
    name: 'Android Framework',
    sub: 'System services · Binder',
    tag: 'VERIFIED',
    role: 'Policy decision point',
    desc: 'The framework arbitrates every request between components: permission checks on Binder calls, permission grants at runtime, and sandbox enforcement for each app.',
    access: ['System services and hardware via HAL', 'Permission state and grant records', 'Routing of all inter-process calls'],
    constrained: ['SELinux domain policy', 'Kernel memory protection', 'Verified boot (signed system image)'],
    isolated: ['Kernel address space', 'TEE key operations', 'Apps from each other'],
    note: 'IF THIS LAYER FAILS → privilege escalation becomes possible; deeper layers must still hold.',
  },
  {
    id: 'kernel',
    name: 'Kernel · SELinux',
    sub: 'Linux kernel + MAC policy',
    tag: 'ENFORCING',
    role: 'Mandatory enforcement',
    desc: 'The kernel enforces what no userspace component can opt out of: process isolation, memory boundaries, syscall filtering (seccomp), and SELinux mandatory access control in enforcing mode.',
    access: ['Hardware resources through drivers', 'All process memory and scheduling', 'Filesystem and network stack'],
    constrained: ['SELinux policy (deny by default)', 'Locked, signature-verified boot', 'Kernel attack-surface reduction'],
    isolated: ['Userspace processes from each other', 'Userspace from kernel memory', 'The radio firmware (modem)'],
    note: 'IF THIS LAYER FAILS → the strongest software boundary is gone; hardware-backed keys remain.',
  },
  {
    id: 'tee',
    name: 'TEE · KeyMint',
    sub: 'TrustZone secure world',
    tag: 'SECURE WORLD',
    role: 'Key custodian',
    desc: 'A separate execution environment on the same SoC. Key operations happen here; raw key material is never exposed to the rich OS — not even to a fully compromised kernel.',
    access: ['Key material it generates and stores', 'Authentication state (Gatekeeper)', 'Attestation signing keys'],
    constrained: ['Its own verified firmware', 'Hardware isolation (TrustZone)', 'Rate limits on authentication tries'],
    isolated: ['The entire rich OS, including the kernel', 'Debug interfaces', 'Arbitrary code execution'],
    note: 'THE OS CAN ASK FOR AN OPERATION. IT CANNOT READ THE KEY.',
  },
  {
    id: 'se',
    name: 'Secure Element',
    sub: 'StrongBox-class chip',
    tag: 'TAMPER-RESISTANT',
    role: 'Deep vault',
    desc: 'An independent tamper-resistant chip for the most sensitive keys. Even a compromised TEE on the main SoC is outside its trust domain.',
    access: ['Its own internally generated keys', 'Limited, rate-controlled operations'],
    constrained: ['Physical tamper resistance', 'Its own certified firmware'],
    isolated: ['The main SoC, including the TEE', 'All software layers above'],
    note: 'OPTIONAL HARDWARE — WHERE PRESENT, IT RAISES EXTRACTION COST SHARPLY.',
  },
  {
    id: 'boot',
    name: 'Secure Boot Chain',
    sub: 'Boot ROM → AVB → kernel',
    tag: 'VERIFIED',
    role: 'Integrity gatekeeper',
    desc: 'Each boot stage verifies the signature of the next before running it. With a locked bootloader, only signed firmware executes, and rollback fuses resist downgrades.',
    access: ['The next-stage image and its metadata', 'Rollback index state'],
    constrained: ['Hardware root of trust beneath it', 'Vendor signing keys'],
    isolated: ['Unsigned or modified firmware', 'Recovery paths that skip verification'],
    note: 'ANSWERS ONE QUESTION: IS THE OS THAT BOOTS THE OS THAT WAS BUILT?',
  },
  {
    id: 'hardware',
    name: 'Silicon Root of Trust',
    sub: 'SoC · fuses · ROM',
    tag: 'ROOT',
    role: 'The anchor',
    desc: 'Immutable code in ROM and hardware-unique secrets fused at manufacture. Nothing above can rewrite them; every higher layer derives its legitimacy from here.',
    access: ['Hardware-unique key material', 'Fuses and immutable boot ROM'],
    constrained: ['Physics and fabrication — by design'],
    isolated: ['Every software layer, without exception'],
    note: 'IF THIS LAYER IS COMPROMISED, IT IS COMPROMISED BEFORE THE OS EXISTS.',
  },
  {
    id: 'modem',
    name: 'Baseband Modem',
    sub: 'Separate processor · own firmware',
    tag: 'SIDE DOMAIN',
    role: 'Radio agent',
    desc: 'The modem runs its own firmware and talks to the cellular network directly. Android can command it through a narrow interface, but cannot verify everything it reports or prevent it identifying itself.',
    access: ['Radio interface and signalling', 'SIM identity (IMSI) and device identity (IMEI)', 'Cell selection and handover'],
    constrained: ['Its own signed firmware', 'Carrier network authentication'],
    isolated: ['From the Android kernel, in practice', 'OS-level hardening and permissions'],
    note: 'HARDENING ANDROID DOES NOT SILENCE THE RADIO.',
  },
  {
    id: 'network',
    name: 'Network · Carrier',
    sub: 'Everything off-device',
    tag: 'EXTERNAL',
    role: 'Outside all trust',
    desc: 'Wi-Fi infrastructure, ISPs, cell towers, and the carrier sit beyond every boundary the device controls. They observe what crosses them unless traffic is protected end-to-end.',
    access: ['Traffic that crosses their infrastructure', 'Radio-level identifiers and timing', 'Coarse location via cell association'],
    constrained: ['Nothing the device controls directly', 'Regulation and contract — not technology'],
    isolated: ['From the device’s security model entirely'],
    note: 'THE DEVICE CAN ONLY CHOOSE WHAT IT REVEALS — AND TO WHICH OBSERVER.',
  },
] as const

export const BOUND_LAYERS = deepBi(EN_BOUND, AR.bound) as BoundLayer[]

/* ---------- 05 · Architecture stacks ------------------------------------ */

export interface ArchNode { name: L; sub: L; ext?: boolean }

const EN_ARCH_DEVICE = [
  { name: 'USER / IDENTITY', sub: 'accounts, profiles, intent' },
  { name: 'APPLICATION LAYER', sub: 'sandboxed apps, profiles, compartments' },
  { name: 'ANDROID FRAMEWORK', sub: 'permissions, Binder IPC, services' },
  { name: 'KERNEL / SELINUX', sub: 'mandatory policy, memory protection' },
  { name: 'CRYPTO / TEE', sub: 'Keystore, KeyMint, FBE keys' },
  { name: 'SECURE BOOT', sub: 'AVB, signed images, rollback fuses' },
  { name: 'HARDWARE', sub: 'SoC, fuses, secure element, sensors' },
]

const EN_ARCH_NETWORK = [
  { name: 'NETWORK STACK', sub: 'DNS, TLS, routing, egress rules' },
  { name: 'VPN / TOR / DNS', sub: 'tunnels, onion routing, DoT/DoH' },
  { name: 'CELLULAR MODEM', sub: 'baseband firmware, own trust domain' },
  { name: 'CELL TOWER', sub: 'radio interface, signalling', ext: true },
  { name: 'CARRIER', sub: 'subscriber records, metadata', ext: true },
]

export const ARCH_DEVICE = deepBi(EN_ARCH_DEVICE, AR.archDevice) as ArchNode[]
export const ARCH_NETWORK = deepBi(EN_ARCH_NETWORK, AR.archNetwork) as ArchNode[]

/* ---------- 06 · Ten security domains ----------------------------------- */

export interface Domain {
  num: string
  title: L
  tagline: L
  objective: L
  surface: LArr
  assets: LArr
  tech: LArr
  attack: L
  mitigation: L
  relations: L
}

const EN_DOMAINS = [
  {
    num: '01',
    title: 'Threat Modeling',
    tagline: 'Assets · adversaries · goals',
    objective: 'Define what is worth protecting, against whom, and at what cost — before any control is chosen. Every other domain answers to this one.',
    surface: ['Unstated assumptions', 'An unspecified adversary', 'Overlooked channels (radio, metadata, physical)'],
    assets: ['Communications content', 'Identity and location history', 'Device integrity', 'Credentials and keys'],
    tech: ['Asset inventories', 'Adversary capability tiers', 'Data-flow analysis', 'Goal separation: confidentiality / privacy / anonymity'],
    attack: 'Choosing defenses for the wrong adversary — e.g. optimizing for remote attackers while the device is physically seized.',
    mitigation: 'Explicit asset lists, named adversary tiers, reviewed assumptions, and periodic re-evaluation as circumstances change.',
    relations: 'Upstream of every other domain: it decides which layers must hold, and how hard.',
  },
  {
    num: '02',
    title: 'Hardware Root of Trust',
    tagline: 'SoC · TEE · Secure Element',
    objective: 'Anchor trust in silicon that software cannot rewrite: immutable boot ROM, fused hardware-unique secrets, and isolated execution environments.',
    surface: ['Debug and test ports', 'Firmware update paths', 'Fault injection and physical probing', 'Supply-chain implants'],
    assets: ['Hardware-unique key material', 'Attestation keys', 'Fused rollback and identity state'],
    tech: ['ARM TrustZone (secure world)', 'Secure Element / StrongBox', 'Hardware key derivation', 'Key attestation'],
    attack: 'Attempts to read fused keys via debug interfaces, voltage glitching, or chip-level probing — increasingly expensive on modern locked-down SoCs.',
    mitigation: 'Fused-off debug ports, keys that never leave hardware, tamper-resistant packaging, and attestation so the OS can prove where a key lives.',
    relations: 'Foundation for Secure Boot and KeyMint; the floor beneath the entire stack.',
  },
  {
    num: '03',
    title: 'Secure / Verified Boot',
    tagline: 'Boot ROM · AVB · rollback',
    objective: 'Guarantee that every stage of boot is signed and verified before execution — the OS that runs is the OS that was built.',
    surface: ['Bootloader and recovery paths', 'Update slots and firmware images', 'Downgrades to vulnerable versions'],
    assets: ['The chain of trust from ROM to userspace', 'Verified-boot state visible to the OS'],
    tech: ['Immutable Boot ROM', 'Android Verified Boot (AVB 2.0)', 'dm-verity for system partitions', 'Rollback-index fuses', 'Locked bootloader'],
    attack: 'Persistent implants via modified boot images, or forced downgrades to firmware with known vulnerabilities.',
    mitigation: 'Locked bootloader with signature verification at every stage, rollback protection, and a visible boot state the OS can refuse to ignore.',
    relations: 'Depends on the hardware root; its verdict is what OS hardening stands on.',
  },
  {
    num: '04',
    title: 'OS Hardening',
    tagline: 'Kernel · SELinux · seccomp',
    objective: 'Constrain every component — daemon, service, and driver — to the minimum authority it needs, enforced below userspace where no app can opt out.',
    surface: ['Kernel syscall surface', 'System services and HAL', 'Binder interfaces', 'Driver code'],
    assets: ['Process isolation itself', 'Policy enforcement', 'Memory safety boundaries'],
    tech: ['SELinux mandatory access control (enforcing)', 'seccomp-BPF syscall filtering', 'Namespaces and capabilities', 'Binder permission checks', 'Compiler mitigations (CFI, shadow call stack)'],
    attack: 'Privilege escalation through kernel vulnerabilities, confused-deputy calls into system services, or exposed HAL interfaces.',
    mitigation: 'Deny-by-default MAC policy per service, shrinking syscall exposure, least-privilege daemons, and fast security patching.',
    relations: 'Enforces the boundaries that application sandboxing assumes; verified boot keeps it unmodified.',
  },
  {
    num: '05',
    title: 'App Sandboxing & Isolation',
    tagline: 'UIDs · permissions · IPC',
    objective: 'Make every application its own failure domain: untrusted code that can touch only what it is explicitly granted.',
    surface: ['Permission requests', 'Intents, content providers, services (IPC)', 'Shared files and deep links'],
    assets: ["Other apps' private data", 'User data and sensors', 'Accounts on the device'],
    tech: ['Per-app UID sandboxes', 'Runtime permission model', 'Scoped storage', 'SELinux confinement per app domain', 'Binder-mediated IPC'],
    attack: 'A malicious app over-requesting permissions, abusing exposed intents (confused deputy), or exploiting a co-installed app’s exported components.',
    mitigation: 'Deny by default, grants that are specific and revocable, sandbox plus MAC confinement so a single bug stays local, and review of what is installed.',
    relations: 'Sits on the framework; assumes kernel MAC beneath it; feeds the compartment model above it.',
  },
  {
    num: '06',
    title: 'Encryption & Key Management',
    tagline: 'FBE · Keystore · KeyMint',
    objective: 'Make data meaningless without keys that live in hardware and are bound to the user’s credential — with different keys for different states and profiles.',
    surface: ['Key-management APIs', 'Data stored outside encrypted areas', 'Key availability while the device is unlocked'],
    assets: ['User data at rest', 'Key material itself', 'Per-profile and per-file key hierarchies'],
    tech: ['File-Based Encryption (AES-256)', 'KeyMint / Android Keystore', 'Gatekeeper (credential verification in TEE)', 'Weaver (rate-limit budget)', 'Per-profile and per-file keys'],
    attack: 'Offline decryption of extracted storage chips; online brute force of the lock credential; key-extraction attempts against hardware.',
    mitigation: 'Hardware-bound keys wrapped by the passcode, throttled guesses, and key states that are discarded on reboot until the credential is entered again.',
    relations: 'Rooted in hardware; it is what physical security relies on when the device changes hands.',
  },
  {
    num: '07',
    title: 'Network Security & Anonymity',
    tagline: 'DNS · VPN · Tor · kill switch',
    objective: 'Control what leaves the device, through which path, in what form — and fail closed when the path breaks.',
    surface: ['Plain DNS queries', 'Tunnel endpoints', 'Traffic timing and volume', 'Apps that bypass the tunnel'],
    assets: ['Content in transit', 'Destination privacy', 'The device’s source address'],
    tech: ['DNS-over-TLS / DNS-over-HTTPS', 'WireGuard / always-on VPN', 'Tor (onion routing)', 'Kill switch (block traffic outside the tunnel)', 'Per-app routing and egress rules'],
    attack: 'Passive observation on hostile Wi-Fi, DNS poisoning, endpoint correlation, and traffic analysis across a tunnel.',
    mitigation: 'Encrypted DNS, an always-on tunnel with kill switch, per-app routing, and Tor where destination anonymity matters — with realistic expectations about traffic analysis.',
    relations: 'Orthogonal to device hardening: it protects the wire, not the endpoint.',
  },
  {
    num: '08',
    title: 'Metadata & Identity Privacy',
    tagline: 'IMEI · MAC · Android ID',
    objective: 'Separate who you are from what you do: shrink the identifier surface and make identifiers per-context instead of global.',
    surface: ['IMEI/IMSI announced to the network', 'MAC addresses on Wi-Fi and Bluetooth', 'Android ID and advertising ID', 'App-specific tracking identifiers'],
    assets: ['Stable identity across time', 'Cross-service correlation', 'Location patterns from radio metadata'],
    tech: ['Per-network MAC randomization', 'Resettable / zeroed advertising ID', 'Per-app identifier isolation', 'Profile and account separation'],
    attack: 'Correlating the same device across networks and services; profiling via advertising IDs; cell-site history reconstructing movement.',
    mitigation: 'Randomized MACs, zeroed or reset ad IDs, distinct accounts per compartment — while accepting that carrier-level radio metadata is outside the OS’s control.',
    relations: 'Persists even when content is encrypted; pairs directly with the network domain.',
  },
  {
    num: '09',
    title: 'Physical / Forensic Security',
    tagline: 'Lock states · BFU · USB',
    objective: 'Keep data sealed when the device is lost, seized, or inspected — the strength depends on which state the device is in at that moment.',
    surface: ['USB and accessory ports', 'Recovery and fastboot modes', 'Lock credential strength', 'Extraction tooling'],
    assets: ['All data at rest', 'Credentials and sessions', 'Biometric templates'],
    tech: ['Before-first-unlock (BFU) key state', 'FBE credential-bound keys', 'Gatekeeper/Weaver guess throttling', 'USB data restriction while locked', 'Strong passphrase over short PIN'],
    attack: 'Forensic extraction tooling, passcode guessing under time pressure, malicious chargers or accessories, and border-style inspection.',
    mitigation: 'A long credential, rebooting before a high-risk moment (returns the device to BFU), USB restricted while locked, and prompt updates.',
    relations: 'Depends on encryption and the hardware root; defines how strong the lock credential must be.',
  },
  {
    num: '10',
    title: 'Supply Chain · Monitoring · Recovery',
    tagline: 'Builds · updates · backups',
    objective: 'Ensure the software that runs is the software that was built — then detect anomalies, respond to incidents, and restore safely.',
    surface: ['Build infrastructure and toolchains', 'Third-party dependencies', 'Update channels', 'Logging that itself becomes sensitive data'],
    assets: ['Firmware and OS provenance', 'Integrity over time', 'Recoverability without exposure'],
    tech: ['Reproducible builds', 'Signed OTA updates with rollback protection', 'Audit logging with retention limits', 'Encrypted backups with offline key custody', 'An incident-response plan'],
    attack: 'Poisoned updates or dependencies, silent tampering with firmware, and recovery processes that leak more than they restore.',
    mitigation: 'Signature verification end-to-end, build reproducibility for audit, logs scoped and minimized, backups encrypted client-side, rehearsed recovery.',
    relations: 'Extends trust across time — before first boot and long after it.',
  },
] as const

export const DOMAINS = deepBi(EN_DOMAINS, AR.domains) as Domain[]

/* ---------- 07 · Simulator scenarios ------------------------------------ */

export type SimTone = 'ok' | 'block' | 'warn' | 'neutral'

export interface SimNode {
  icon: string
  label: L
  sub?: L
  status: L
  tone: SimTone
}

export interface Scenario {
  id: string
  title: L
  sub: L
  note: L
  nodes: SimNode[]
  log: Array<{ t: L; tone?: 'ok' | 'bad' | 'warn' }>
}

const EN_SCENARIOS = [
  {
    id: 'malicious-app',
    title: 'Malicious app',
    sub: 'Attempts to read another app’s private data',
    note: 'Three independent boundaries must fail before data crosses.',
    nodes: [
      { icon: 'APK', label: 'Malicious app', sub: 'installed, running in its sandbox', status: 'RUNNING', tone: 'neutral' },
      { icon: '→', label: 'Requests another app’s data', sub: 'direct file / IPC access attempt', status: 'ATTEMPT', tone: 'neutral' },
      { icon: '⛊', label: 'Permission model', sub: 'no grant was ever given', status: 'NO GRANT', tone: 'block' },
      { icon: '⛊', label: 'App sandbox', sub: 'UID isolation — different failure domain', status: 'ISOLATED', tone: 'block' },
      { icon: '⛊', label: 'SELinux policy', sub: 'mandatory denial, event logged', status: 'DENIED', tone: 'block' },
      { icon: '✓', label: 'Access blocked', sub: 'nothing crossed a boundary', status: 'BLOCKED', tone: 'ok' },
    ],
    log: [
      { t: 'app_process spawned, uid=10231, domain=untrusted_app' },
      { t: 'open(/data/data/victim.app/…) → EACCES (sandbox)', tone: 'bad' },
      { t: 'binder call to victim service → permission check FAILED', tone: 'bad' },
      { t: 'avc: denied { read } for scontext=u:untrusted_app', tone: 'bad' },
      { t: 'denial logged to audit; app remains confined', tone: 'ok' },
      { t: 'RESULT: zero bytes crossed. Layers held independently.', tone: 'ok' },
    ],
  },
  {
    id: 'stolen-device',
    title: 'Stolen locked device',
    sub: 'Attacker holds the phone after reboot (BFU)',
    note: 'Before first unlock, credential-bound keys stay sealed in hardware.',
    nodes: [
      { icon: 'ATK', label: 'Attacker', sub: 'physical possession of the device', status: 'PHYSICAL', tone: 'neutral' },
      { icon: '→', label: 'Attempts unlock / extraction', sub: 'guessing, tooling, or chip-off', status: 'ATTEMPT', tone: 'neutral' },
      { icon: '⛊', label: 'Gatekeeper · Weaver', sub: 'guesses throttled in the TEE', status: 'THROTTLED', tone: 'block' },
      { icon: '⛊', label: 'Encrypted storage (FBE)', sub: 'data on flash is ciphertext', status: 'SEALED', tone: 'block' },
      { icon: '⛊', label: 'Hardware-backed key', sub: 'key bound to credential, lives in silicon', status: 'UNREACHABLE', tone: 'block' },
      { icon: '✓', label: 'Data remains protected', sub: 'before first unlock (BFU) the strongest state', status: 'PROTECTED', tone: 'ok' },
    ],
    log: [
      { t: 'device state: BFU (rebooted, never unlocked)' },
      { t: 'attempt 1..5 → gatekeeper delay escalating', tone: 'bad' },
      { t: 'weaver budget exhausted; further guesses stalled', tone: 'bad' },
      { t: 'flash contents: AES-256 ciphertext, no key resident', tone: 'ok' },
      { t: 'credential-bound key remains inside secure hardware', tone: 'ok' },
      { t: 'RESULT: possession ≠ access. Time and cost, not data.', tone: 'ok' },
    ],
  },
  {
    id: 'network-observer',
    title: 'Compromised network observer',
    sub: 'Adversary watches the local network path',
    note: 'Content can be sealed; metadata only shrinks with routing choices.',
    nodes: [
      { icon: 'DEV', label: 'Device sends a message', sub: 'app with transport encryption', status: 'SENDING', tone: 'neutral' },
      { icon: '⛊', label: 'TLS transport', sub: 'payload sealed in transit', status: 'ENCRYPTED', tone: 'ok' },
      { icon: '⛊', label: 'VPN / Tor routing', sub: 'path hidden from local observer', status: 'TUNNELED', tone: 'ok' },
      { icon: '◉', label: 'Observer on the path', sub: 'hostile Wi-Fi or upstream vantage', status: 'WATCHING', tone: 'neutral' },
      { icon: '◐', label: 'What remains visible', sub: 'tunnel endpoint, timing, volume', status: 'PARTIAL', tone: 'warn' },
      { icon: '✓', label: 'Content protected', sub: 'metadata reduced, not erased', status: 'REDUCED', tone: 'warn' },
    ],
    log: [
      { t: 'outbound flow: app → TLS 1.3 → tunnel → destination' },
      { t: 'observer sees: encrypted datagrams, one endpoint', tone: 'warn' },
      { t: 'observer does NOT see: content, final destination', tone: 'ok' },
      { t: 'residual: timing, volume, tunnel endpoint address', tone: 'warn' },
      { t: 'without tunnel: DNS + destinations fully exposed', tone: 'bad' },
      { t: 'RESULT: content privacy achieved; metadata only reduced.', tone: 'warn' },
    ],
  },
] as const

export const SCENARIOS = deepBi(EN_SCENARIOS, AR.scenarios) as Scenario[]

/* ---------- 08 · Network modes ------------------------------------------ */

export interface NetNodeDef { label: L; sub: L; x: number; y: number; ext?: boolean }
export interface NetEdgeDef { from: number; to: number; tunnel?: boolean; plain?: boolean }

export interface NetMode {
  id: 'direct' | 'vpn' | 'tor'
  label: L
  sub: L
  caption: L
  nodes: NetNodeDef[]
  edges: NetEdgeDef[]
  facts: Array<{ k: L; v: L }>
}

const EN_NET = [
  {
    id: 'direct',
    label: 'Direct',
    sub: 'NO TUNNEL',
    caption: 'Plain path — every intermediary on the route can see the destination and, without TLS, the content.',
    nodes: [
      { label: 'APP', sub: 'your device', x: 100, y: 210 },
      { label: 'DNS', sub: 'plain query', x: 320, y: 110 },
      { label: 'ISP', sub: 'your provider', x: 540, y: 210 },
      { label: 'DESTINATION', sub: 'server', x: 810, y: 210, ext: true },
    ],
    edges: [
      { from: 0, to: 1, plain: true },
      { from: 1, to: 2, plain: true },
      { from: 2, to: 3 },
    ],
    facts: [
      { k: 'Local network & ISP see', v: 'Destination IPs, plain DNS queries, volume and timing of every connection.' },
      { k: 'Destination sees', v: 'Your real source address and whatever identifiers the app sends.' },
      { k: 'Content protection', v: 'Only where the app itself uses TLS — and TLS hides content, not destinations.' },
      { k: 'Residual metadata', v: 'DNS alone can reveal most of what you do, even with HTTPS everywhere.' },
    ],
  },
  {
    id: 'vpn',
    label: 'VPN',
    sub: 'ONE ENCRYPTED TUNNEL',
    caption: 'The local path becomes a sealed tunnel to one trusted endpoint. The ISP loses sight of destinations — the VPN provider gains it.',
    nodes: [
      { label: 'APP', sub: 'your device', x: 100, y: 210 },
      { label: 'VPN SERVER', sub: 'tunnel endpoint', x: 500, y: 210 },
      { label: 'DESTINATION', sub: 'server', x: 810, y: 210, ext: true },
    ],
    edges: [
      { from: 0, to: 1, tunnel: true },
      { from: 1, to: 2 },
    ],
    facts: [
      { k: 'Local network & ISP see', v: 'One encrypted stream to the VPN endpoint. Volume and timing remain visible.' },
      { k: 'Destination sees', v: 'The VPN’s address instead of yours — identity shifts to the provider.' },
      { k: 'Trust shift', v: 'The VPN provider now sees destinations, and content wherever TLS is absent.' },
      { k: 'Residual metadata', v: 'Leaks around the tunnel (DNS, IPv6, captive portals) unless the kill switch fails closed.' },
    ],
  },
  {
    id: 'tor',
    label: 'Tor',
    sub: 'ONION ROUTING · 3 HOPS',
    caption: 'No single relay knows both origin and destination. Each hop peels one layer of encryption.',
    nodes: [
      { label: 'APP', sub: 'your device', x: 90, y: 210 },
      { label: 'GUARD', sub: 'knows you', x: 290, y: 120 },
      { label: 'MIDDLE', sub: 'knows neither', x: 490, y: 280 },
      { label: 'EXIT', sub: 'knows destination', x: 690, y: 120 },
      { label: 'DESTINATION', sub: 'server', x: 860, y: 210, ext: true },
    ],
    edges: [
      { from: 0, to: 1, tunnel: true },
      { from: 1, to: 2, tunnel: true },
      { from: 2, to: 3, tunnel: true },
      { from: 3, to: 4 },
    ],
    facts: [
      { k: 'Each relay sees', v: 'Only its immediate neighbors — no single point links you to the destination.' },
      { k: 'The exit sees', v: 'Traffic as it leaves Tor. Keep TLS on, or the exit reads the content.' },
      { k: 'The guard sees', v: 'Your address — which is why guard selection is long-lived and deliberate.' },
      { k: 'Residual metadata', v: 'End-to-end timing correlation remains a research-level concern against global observers.' },
    ],
  },
] as const

export const NET_MODES = deepBi(EN_NET, AR.net) as NetMode[]

/* ---------- 08b · Metadata rows ------------------------------------------ */

export interface KV { k: L; v: L }

const EN_META = [
  { k: 'TIME', v: '02:14:07 UTC · every exchange timestamped' },
  { k: 'IP ADDRESS', v: 'your network location, roughly where you are' },
  { k: 'DESTINATION', v: 'who you contacted, even if content is sealed' },
  { k: 'TRAFFIC SIZE', v: '1.2 KB can distinguish a “yes” from a “no”' },
  { k: 'FREQUENCY', v: '214 exchanges/day with one counterparty' },
  { k: 'CELL TOWER', v: 'radio association places you on a map' },
  { k: 'DEVICE IDS', v: 'IMEI / MAC / Android ID correlation' },
] as const

export const METADATA_ROWS = deepBi(EN_META, AR.metaRows) as KV[]

/* ---------- 10 · Physical states ------------------------------------------ */

export type PhysLevel = 'high' | 'mid' | 'low'

export interface PhysState {
  id: string
  label: L
  sub: L
  badge: L
  desc: L
  rows: Array<LArr>
  matrix: Record<string, PhysLevel>
}

const EN_PHYS_THREATS = [
  'Storage extraction (chip-off / imaging)',
  'Passcode brute force',
  'USB / malicious accessory',
  'Live memory inspection',
  'Cold boot / key residue',
]

export const PHYS_THREATS = deepBi(EN_PHYS_THREATS, AR.physThreats) as LArr

const EN_PHYS = [
  {
    id: 'off',
    label: 'Powered off',
    sub: 'STRONGEST REST',
    badge: 'NO ACTIVE SESSION',
    desc: 'Nothing is loaded. Credential-bound keys stay sealed in hardware-backed storage, and RAM contents decay within seconds to minutes of power loss.',
    rows: [
      ['Storage', 'FBE ciphertext; credential-bound keys not derivable without unlock'],
      ['USB', 'No enumeration — the device presents nothing'],
      ['Weakest point', 'Boot path before first unlock must itself be verified'],
    ],
    matrix: { t0: 'high', t1: 'high', t2: 'high', t3: 'mid', t4: 'mid' },
  },
  {
    id: 'reboot',
    label: 'After reboot',
    sub: 'BFU',
    badge: 'BEFORE FIRST UNLOCK',
    desc: 'After any reboot the device waits for the primary credential. Biometrics alone cannot open it, and the keys that decrypt personal data are not yet resident anywhere.',
    rows: [
      ['Storage', 'Credential-encrypted: sealed until the passcode is entered once'],
      ['Biometrics', 'Cannot substitute for the credential in this state'],
      ['Why it matters', 'Rebooting before a high-risk moment returns the device to this state'],
    ],
    matrix: { t0: 'high', t1: 'high', t2: 'high', t3: 'high', t4: 'mid' },
  },
  {
    id: 'locked',
    label: 'Locked',
    sub: 'AFU',
    badge: 'AFTER FIRST UNLOCK',
    desc: 'The screen is locked, but the device has been unlocked since boot: keys are resident in memory, held by secure hardware. Guesses against the credential are throttled.',
    rows: [
      ['Storage', 'Accessible to system services; credential-bound keys resident under TEE control'],
      ['Guessing', 'Gatekeeper/Weaver escalate delays; long passcodes push this past practical'],
      ['Weakest point', 'A short PIN makes throttling the only real defense'],
    ],
    matrix: { t0: 'mid', t1: 'high', t2: 'high', t3: 'mid', t4: 'low' },
  },
  {
    id: 'unlocked',
    label: 'Unlocked',
    sub: 'IN USE',
    badge: 'ACTIVE SESSION',
    desc: 'Everything works — which is the point and the problem. Data is live and readable, so the session itself becomes the attack surface: snatching, shoulders, malicious apps.',
    rows: [
      ['Storage', 'Fully decrypted and in active use'],
      ['Exposure', 'Shoulder surfing, snatch-and-grab, malicious apps with granted permissions'],
      ['Mitigation', 'Short auto-lock, attention to grants, profile separation'],
    ],
    matrix: { t0: 'low', t1: 'low', t2: 'mid', t3: 'low', t4: 'low' },
  },
  {
    id: 'usb',
    label: 'USB connected',
    sub: 'DATA GATED',
    badge: 'ACCESSORY ATTACHED',
    desc: 'While locked, modern devices expose power only. Any data role requires an explicit, unlocked consent — so hostile chargers and extraction kits meet a closed port.',
    rows: [
      ['Default role', 'Charge only; no data lines enumerated while locked'],
      ['Consent', 'Data transfer requires an unlocked, deliberate user choice'],
      ['Residual risk', 'An unlocked device that was previously authorized can re-open the link'],
    ],
    matrix: { t0: 'mid', t1: 'high', t2: 'high', t3: 'mid', t4: 'low' },
  },
  {
    id: 'adb',
    label: 'Debugging enabled',
    sub: 'ELEVATED SURFACE',
    badge: 'DEVELOPER MODE',
    desc: 'ADB authorization still requires a pre-trusted host key, but an unlocked, debugging-enabled device presents a far larger surface. Off by default is the correct default.',
    rows: [
      ['Authorization', 'RSA host keys must be accepted on-device first'],
      ['If unlocked + authorized', 'A shell with broad reach — effectively full access'],
      ['Discipline', 'Enable per-task, disable after; never leave on for daily use'],
    ],
    matrix: { t0: 'mid', t1: 'mid', t2: 'low', t3: 'mid', t4: 'low' },
  },
] as const

export const PHYS_STATES = deepBi(EN_PHYS, AR.phys) as PhysState[]

/* ---------- 11 · Side channels --------------------------------------------- */

export interface SideChannel {
  id: string
  name: L
  desc: L
  mit: L
}

const EN_SC = [
  { id: 'timing', name: 'Timing', desc: 'How long an operation takes can depend on secret data. Comparing response times lets an observer infer bits without ever reading them.', mit: 'MITIGATION · CONSTANT-TIME IMPLEMENTATIONS OF COMPARISONS AND CRYPTO' },
  { id: 'power', name: 'Power draw', desc: 'Different instructions draw different current. With physical access, power traces can be statistically matched against key operations.', mit: 'MITIGATION · MASKING AND BLINDING IN HARDWARE / SECURE ELEMENTS' },
  { id: 'em', name: 'Electromagnetic', desc: 'Circuitry radiates faint emissions correlated with what it is computing. Nearby antennas can, in research settings, recover fragments.', mit: 'MITIGATION · SHIELDING, LAYOUT DISCIPLINE, AND PROXIMITY REQUIRED' },
  { id: 'cache', name: 'Cache behavior', desc: 'Which memory lines a process touches leaves footprints in shared caches. Co-located code can sometimes infer another’s access patterns.', mit: 'MITIGATION · ISOLATION, PARTITIONING, AND ACCESS-PATTERN-AWARE DESIGN' },
  { id: 'sensors', name: 'Sensor inference', desc: 'Motion, audio, and ambient sensors can be repurposed — keystroke rhythm from the accelerometer, for example — often without a “dangerous” permission.', mit: 'MITIGATION · SENSOR ACCESS GOVERNANCE AND SAMPLING RESTRICTIONS' },
  { id: 'traffic', name: 'Traffic patterns', desc: 'Encrypted flows still have size and rhythm. A burst of a characteristic size at a characteristic moment can identify an action.', mit: 'MITIGATION · PADDING, COVER TRAFFIC, AND BATCHING — AT A COST' },
] as const

export const SIDE_CHANNELS = deepBi(EN_SC, AR.sideChannels) as SideChannel[]

/* ---------- 12 · Supply chain ---------------------------------------------- */

export interface ChainStage {
  id: string
  name: L
  tag: L
  check: L
  body: L
  points: LArr
}

const EN_CHAIN = [
  { id: 'source', name: 'Source', tag: 'ORIGIN', check: 'REVIEWED', body: 'Security starts in the repository: who can merge, what dependencies are pinned, and whether a change can be traced to an author and a review.', points: ['Code review as policy', 'Pinned, audited dependencies', 'Signed commits / provenance'] },
  { id: 'compiler', name: 'Compiler', tag: 'TOOLCHAIN', check: 'PINNED', body: 'The toolchain itself is software — a compromised compiler can backdoor everything it touches. Trusted, pinned, verifiable toolchains close that door.', points: ['Reproducible toolchain versions', 'Compiler hardening flags (CFI, stack protector)', 'No ad-hoc binaries'] },
  { id: 'build', name: 'Build', tag: 'REPRODUCIBILITY', check: 'REPRODUCED', body: 'A reproducible build lets independent parties compile the same source and get bit-identical output — proof that what shipped matches what was reviewed.', points: ['Deterministic, hermetic builds', 'Independent rebuild verification', 'Signed build attestations'] },
  { id: 'signing', name: 'Signing', tag: 'CUSTODY', check: 'SIGNED', body: 'Release keys are the hinge between build and device. Their custody — hardware-backed, split, audited — decides whether an update can be forged.', points: ['Hardware-backed signing keys', 'Threshold / split custody', 'Key rotation plan'] },
  { id: 'ota', name: 'OTA', tag: 'DELIVERY', check: 'VERIFIED', body: 'Updates travel hostile networks. Each package is signature-checked on-device, staged, and protected against rollback to vulnerable versions.', points: ['Signature verification on-device', 'Rollback protection', 'Staged rollout + integrity checks'] },
  { id: 'device', name: 'Device', tag: 'RUNTIME', check: 'ATTESTED', body: 'Verified boot re-checks the chain at every power-on, and attestation lets remote parties verify which software the device is actually running.', points: ['Verified boot at every start', 'dm-verity at runtime', 'Remote attestation'] },
] as const

export const CHAIN_STAGES = deepBi(EN_CHAIN, AR.chain) as ChainStage[]

/* ---------- 13 · Privacy defaults -------------------------------------------- */

export interface DefaultToggle {
  id: string
  name: L
  note: L
  denyLabel: L
  grantLabel: L
}

const EN_DEFAULTS = [
  { id: 'camera', name: 'Camera', note: 'Grant per-use, then revoke; indicator shows when live.', denyLabel: 'DENY', grantLabel: 'GRANTED' },
  { id: 'mic', name: 'Microphone', note: 'The most ambient of sensors; default closed.', denyLabel: 'DENY', grantLabel: 'GRANTED' },
  { id: 'location', name: 'Location', note: 'Coarse over precise, approximate over exact, only while in use.', denyLabel: 'DENY', grantLabel: 'GRANTED' },
  { id: 'bluetooth', name: 'Bluetooth', note: 'Off means undiscoverable and unreachable; on is a radio surface.', denyLabel: 'OFF', grantLabel: 'ON' },
  { id: 'nfc', name: 'NFC', note: 'Enable at the terminal, not for the whole day.', denyLabel: 'OFF', grantLabel: 'ON' },
  { id: 'usb', name: 'USB data', note: 'Charge-only while locked; data requires an unlocked consent.', denyLabel: 'RESTRICTED', grantLabel: 'OPEN' },
] as const

export const DEFAULT_TOGGLES = deepBi(EN_DEFAULTS, AR.defaults) as DefaultToggle[]

/* ---------- 13.5 · Compartments ------------------------------------------------ */

export interface CompApp {
  id: string
  name: L
  perms: LArr
  net: L
  note: L
}

export interface CompProfile {
  id: string
  name: L
  sub: L
  apps: CompApp[]
}

const EN_COMPARTMENTS = [
  {
    id: 'owner',
    name: 'Owner',
    sub: 'everyday device functions',
    apps: [
      { id: 'phone', name: 'Phone', perms: ['Contacts', 'Microphone (in-call)'], net: 'Carrier circuit call path', note: 'Sees your call metadata by design — keep sensitive calls out of this compartment.' },
      { id: 'messages', name: 'Messages', perms: ['SMS', 'Notifications'], net: 'Carrier SMS / RCS', note: 'SMS is unencrypted transport; move sensitive conversation to end-to-end encrypted apps in the private profile.' },
      { id: 'camera', name: 'Camera', perms: ['Camera', 'Storage (media only)'], net: 'No network access', note: 'A camera with no network route cannot leak what it captures.' },
    ],
  },
  {
    id: 'private',
    name: 'Private profile',
    sub: 'separate accounts · separate keys',
    apps: [
      { id: 'signal', name: 'Signal', perms: ['Microphone (in-call)', 'Camera (opt-in)'], net: 'Routed via always-on tunnel', note: 'End-to-end encrypted content; registration still touches a server — metadata minimized, not erased.' },
      { id: 'vault', name: 'Password manager', perms: ['None beyond storage'], net: 'Sync only, client-encrypted', note: 'Vault keys derived locally; the profile’s own FBE keys add a second lock.' },
      { id: 'browser', name: 'Privacy browser', perms: ['None', 'Location: never'], net: 'Tor or tunnel, per-site identity isolation', note: 'Per-site partitioning means trackers cannot stitch sessions across sites.' },
    ],
  },
  {
    id: 'work',
    name: 'Work profile',
    sub: 'managed container',
    apps: [
      { id: 'mail', name: 'Mail', perms: ['Contacts (work only)'], net: 'Corporate gateway', note: 'Policy-managed: the organization controls this container — assume it is monitored.' },
      { id: 'docs', name: 'Documents', perms: ['Storage (container only)'], net: 'Corporate gateway', note: 'Files stay inside the container boundary; wipe removes the container without touching personal data.' },
      { id: 'mdm', name: 'MDM agent', perms: ['Device administration (scoped)'], net: 'Management channel', note: 'The price of a managed profile: a clearly scoped administrator inside this room.' },
    ],
  },
  {
    id: 'disposable',
    name: 'Disposable',
    sub: 'restricted · zero trust',
    apps: [
      { id: 'untrusted', name: 'Untrusted app', perms: ['None granted'], net: 'Egress-filtered or none', note: 'Runs with zero permissions and no accounts. If it is hostile, it is also blind and alone.' },
      { id: 'burner', name: 'Burner browser', perms: ['None'], net: 'Tunnel, throwaway identity', note: 'For the site you must visit once. Wipe the compartment after; assume it is hostile.' },
      { id: 'qr', name: 'QR / ticket viewer', perms: ['Camera (in-app only)'], net: 'Disabled', note: 'Single-purpose, offline: the smallest possible surface for a small task.' },
    ],
  },
] as const

export const COMPARTMENTS = deepBi(EN_COMPARTMENTS, AR.compartments) as CompProfile[]

/* ---------- 14 · System diagram -------------------------------------------------- */

export interface SysNodeDef {
  x: number
  y: number
  w: number
  h: number
  label: L
  sub: L
  kind?: 'accent' | 'warn' | 'ext'
}

const EN_SYS_NODES = [
  { x: 390, y: 22, w: 220, h: 46, label: 'USER / IDENTITY', sub: 'intent · accounts · profiles', kind: 'accent' },
  { x: 390, y: 92, w: 220, h: 46, label: 'APPLICATIONS', sub: 'sandboxes · compartments' },
  { x: 390, y: 162, w: 220, h: 46, label: 'ANDROID FRAMEWORK', sub: 'permissions · binder ipc' },
  { x: 390, y: 232, w: 220, h: 46, label: 'KERNEL / SELINUX', sub: 'mandatory policy' },
  { x: 170, y: 322, w: 220, h: 46, label: 'CRYPTO / TEE', sub: 'keymint · fbe keys', kind: 'accent' },
  { x: 170, y: 392, w: 220, h: 46, label: 'SECURE BOOT', sub: 'avb · rollback fuses' },
  { x: 170, y: 462, w: 220, h: 46, label: 'HARDWARE', sub: 'soc · fuses · secure element', kind: 'accent' },
  { x: 610, y: 322, w: 220, h: 46, label: 'NETWORK STACK', sub: 'dns · tls · routing' },
  { x: 610, y: 392, w: 220, h: 46, label: 'VPN / TOR / DNS', sub: 'tunnels · onion routing', kind: 'accent' },
  { x: 610, y: 462, w: 220, h: 46, label: 'CELLULAR MODEM', sub: 'separate trust domain', kind: 'warn' },
  { x: 610, y: 540, w: 220, h: 40, label: 'CELL TOWER', sub: 'radio interface', kind: 'ext' },
  { x: 610, y: 596, w: 220, h: 40, label: 'CARRIER', sub: 'subscriber records', kind: 'ext' },
]

export const SYSTEM_LINKS: Array<{ a: number; b: number; flow?: boolean; dashed?: boolean }> = [
  { a: 0, b: 1 },
  { a: 1, b: 2 },
  { a: 2, b: 3 },
  { a: 3, b: 4, flow: true },
  { a: 3, b: 7 },
  { a: 4, b: 5 },
  { a: 5, b: 6 },
  { a: 7, b: 8, flow: true },
  { a: 8, b: 9 },
  { a: 9, b: 10 },
  { a: 10, b: 11 },
  { a: 6, b: 9, dashed: true },
]

const EN_SYSTEM = {
  nodes: EN_SYS_NODES,
  strip: 'OVER TIME — SUPPLY CHAIN · MONITORING · RECOVERY · ENCRYPTED BACKUPS',
  zone1: 'DEVICE TRUST DOMAIN',
  zone2: 'RADIO PATH',
}

const SYSTEM_BI = deepBi(EN_SYSTEM, AR.system)

export const SYSTEM_NODES = SYSTEM_BI.nodes as SysNodeDef[]
export const SYSTEM_STRIP = SYSTEM_BI.strip as L
export const SYSTEM_ZONES = { z1: SYSTEM_BI.zone1 as L, z2: SYSTEM_BI.zone2 as L }

/* ---------- Finale ----------------------------------------------------------- */

export const FINALE_PHONE_SVG = `
<svg class="finale-phone" width="120" height="240" viewBox="0 0 120 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="8" y="6" width="104" height="228" rx="22" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
  <rect x="14" y="12" width="92" height="216" rx="17" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <circle cx="60" cy="206" r="3" fill="rgba(143,179,217,0.9)"/>
  <rect x="48" y="16" width="24" height="4" rx="2" fill="rgba(255,255,255,0.18)"/>
  <path d="M52 118 v-8 a8 8 0 0 1 16 0 v8" stroke="rgba(143,179,217,0.85)" stroke-width="2" fill="none"/>
  <rect x="48" y="118" width="24" height="18" rx="4" stroke="rgba(143,179,217,0.85)" stroke-width="2"/>
</svg>`
