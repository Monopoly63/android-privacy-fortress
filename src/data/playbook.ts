/* ==========================================================================
   The Hardening Playbook — bilingual content (EN/AR zipped via deepBi).
   Concrete, real-world steps. Tools are named as examples, not endorsements.
   ========================================================================== */

import { deepBi, type L, type LArr } from './content'

export interface Tier {
  id: string
  name: L
  sub: L
  bullets: LArr
  best?: boolean
}

export interface Tool { name: L; url: string; note: L }

export interface Move {
  id: string
  phase: number
  impact: 1 | 2 | 3
  effort: 1 | 2 | 3
  title: L
  why: L
  how: LArr
  tools?: Tool[]
  devices?: boolean
}

export interface Myth { myth: L; reality: L }
export interface Read { name: L; url: string; note: L }

/* ---------- tiers ---------- */

const EN_TIERS = [
  {
    id: 'any',
    name: 'Any Android device',
    sub: 'No bootloader changes · everyone starts here',
    bullets: [
      'Prompt security updates for as long as the vendor supports the device',
      'Long screen-lock credential, deny-by-default permission hygiene',
      'Encrypted DNS, always-on VPN for untrusted networks',
    ],
  },
  {
    id: 'aosp',
    name: 'AOSP-adjacent setup',
    sub: 'Stock OS, chosen deliberately',
    bullets: [
      'Everything above, on hardware with long update commitments',
      'Fewer preinstalled privileged apps; Play services scoped, optional, or replaced',
      'User profiles as compartments; per-app network decisions',
    ],
  },
  {
    id: 'fortress',
    name: 'Custom-verified device',
    sub: 'The strongest consumer posture today',
    bullets: [
      'Supported device with a hardening-focused, verified-boot-preserving OS (e.g. GrapheneOS on Pixel)',
      'Hardware-backed attestation, per-app sandboxing leaks reduced, sensor/permission toggles',
      'Requires comfort with installation and update discipline — verify signatures yourself',
    ],
    best: true,
  },
]

/* ---------- moves (phase 0..5, impact 1..3, effort 1..3) ---------- */

const EN_MOVES = [
  {
    id: 'threat-model',
    phase: 0, impact: 3, effort: 1,
    title: 'Write your threat model',
    why: 'Every later decision depends on it. One page: what you protect, from whom, and what you will give up to protect it.',
    how: [
      'List your assets: messages, accounts, location history, identity.',
      'Name your adversaries honestly — opportunistic thief, tracker, platform, forensic examiner.',
      'Decide your trade-offs: convenience you accept losing, and where you stop.',
    ],
    devices: true,
  },
  {
    id: 'updates',
    phase: 0, impact: 3, effort: 1,
    title: 'Make updates non-negotiable',
    why: 'Most real-world compromises use known, already-patched vulnerabilities. The update is the patch.',
    how: [
      'Enable automatic system security updates.',
      'Update apps from the store weekly; remove apps the vendor no longer updates.',
      'Know your device’s support end date — plan replacement before it arrives.',
    ],
    devices: true,
  },
  {
    id: 'lockscreen',
    phase: 0, impact: 3, effort: 1,
    title: 'Upgrade the lock credential',
    why: 'The passphrase is the root of on-device encryption. A 4-digit PIN gives brute-force a weekend; a long passphrase gives it years.',
    how: [
      'Switch to a password or long alphanumeric code you can still type daily.',
      'Disable biometrics for high-risk moments, or pair with Lockdown mode.',
      'Reduce lock-screen notification content to nothing sensitive.',
    ],
    devices: true,
  },
  {
    id: 'lockdown',
    phase: 0, impact: 2, effort: 1,
    title: 'Pin Lockdown to your reflexes',
    why: 'Lockdown (Android 9+) suspends biometrics and requires the credential — the fastest way back to the strongest state.',
    how: [
      'Add the Lockdown quick tile, or long-press power on supported builds.',
      'Rehearse: enter Lockdown before crossings, protests, or device hand-offs.',
      'Remember: a reboot achieves the same BFU state when Lockdown is unavailable.',
    ],
  },
  {
    id: 'permission-audit',
    phase: 0, impact: 2, effort: 2,
    title: 'Run a monthly permission purge',
    why: 'Grants accumulate silently. Every dormant camera, location, or contacts permission is standing attack surface.',
    how: [
      'Settings → Privacy → Permission manager: sort by “recently used” and revoke the rest.',
      'Prefer “only while in use” over “always” for location — audit anything set to “always”.',
      'Uninstall what you did not open this month. Reinstalling is cheap.',
    ],
  },
  {
    id: 'dns-dot',
    phase: 3, impact: 2, effort: 1,
    title: 'Encrypt your DNS',
    why: 'Plain DNS announces every site you resolve to the network. Encrypted DNS closes the cheapest dragnet.',
    how: [
      'Private DNS (Settings → Network) with a provider supporting DNS-over-TLS.',
      'Prefer a resolver with a stated no-logging policy — or run your own if able.',
      'Verify: some apps hardcode their own resolvers; a VPN closes those gaps too.',
    ],
  },
  {
    id: 'vpn-wireguard',
    phase: 3, impact: 2, effort: 2,
    title: 'Always-on VPN with a kill switch',
    why: 'On hostile networks the tunnel shields destinations from local observers — and the kill switch means “fail closed”, never “leak quietly”.',
    how: [
      'Choose a provider you can hold accountable, or self-host WireGuard.',
      'Enable Always-on VPN and “Block connections without VPN”.',
      'Re-check after OS upgrades — the toggle occasionally resets.',
    ],
    tools: [
      { name: 'WireGuard', url: 'https://www.wireguard.com/', note: 'modern, audited tunnel protocol' },
    ],
    devices: true,
  },
  {
    id: 'tor-sensitive',
    phase: 3, impact: 2, effort: 2,
    title: 'Reach for Tor on sensitive sessions',
    why: 'A VPN shifts trust to its provider; Tor removes the single point that links you to the destination.',
    how: [
      'Use Tor Browser for research and browsing you would not attach your name to.',
      'Keep TLS on inside Tor — the exit can read plaintext.',
      'Understand the residual: timing analysis against global observers remains research-level.',
    ],
    tools: [
      { name: 'Tor Project', url: 'https://www.torproject.org/', note: 'the onion router, official builds' },
    ],
  },
  {
    id: 'browser',
    phase: 3, impact: 2, effort: 1,
    title: 'Harden the browser, isolate by identity',
    why: 'The browser is where most remote code touches the device — and where cross-site identity stitching happens.',
    how: [
      'Use a privacy-focused browser with default-blocking (shields/filter lists).',
      'Separate identities per context: separate profiles or containers, never one “everything” window.',
      'Keep extensions minimal — each one is trusted code with wide visibility.',
    ],
    tools: [
      { name: 'uBlock Origin', url: 'https://ublockorigin.com/', note: 'content/filter-list blocker' },
    ],
  },
  {
    id: 'profiles',
    phase: 2, impact: 3, effort: 2,
    title: 'Split life into profiles',
    why: 'Compartments bound blast radius. Work, private, and disposable apps in one runtime is one bug away from everything.',
    how: [
      'Move sensitive communication into a separate profile with its own unlock.',
      'Put semi-trusted apps in a work profile or island with restricted grants.',
      'Keep a disposable space with zero accounts for risky installs.',
    ],
    devices: true,
  },
  {
    id: 'messenger',
    phase: 2, impact: 2, effort: 1,
    title: 'Move sensitive chat to E2EE',
    why: 'SMS is plaintext at the carrier. End-to-end encryption puts the keys with the participants, not the network.',
    how: [
      'Adopt a messenger with default end-to-end encryption and disappearing messages.',
      'Verify safety numbers with your contacts once; re-verify after reinstalls.',
      'Tighten metadata: disappearing messages, minimal group size, no phone-number exposure.',
    ],
    tools: [
      { name: 'Signal', url: 'https://signal.org/', note: 'E2EE messenger, open protocol' },
    ],
  },
  {
    id: 'os',
    phase: 1, impact: 3, effort: 3,
    title: 'The OS move: verified hardening',
    why: 'The single largest step-up available: an OS whose entire purpose is attack-surface reduction, while keeping verified boot intact.',
    how: [
      'Check your device against supported hardware lists — support quality beats feature lists.',
      'Follow the official installer only; verify every downloaded image signature.',
      'Plan the migration: encrypted backups, account re-login, a weekend of friction.',
    ],
    tools: [
      { name: 'GrapheneOS', url: 'https://grapheneos.org/', note: 'hardened Android OS, Pixel devices' },
    ],
    devices: true,
  },
  {
    id: 'identifiers',
    phase: 4, impact: 2, effort: 1,
    title: 'Shrink your identifier surface',
    why: 'Cross-service tracking needs a stable handle. Randomized MACs and reset ad IDs remove the cheapest handles.',
    how: [
      'Wi-Fi: use per-network MAC randomization (default on modern Android — verify it is on).',
      'Reset or zero the advertising ID; deny apps that break without it.',
      'Give each compartment its own accounts; never one Google identity for everything.',
    ],
  },
  {
    id: 'sim-exposure',
    phase: 4, impact: 2, effort: 1,
    title: 'Decide your SIM strategy',
    why: 'The radio registers IMSI+IMEI wherever it goes — carrier metadata is outside every OS control. Strategy, not avoidance.',
    how: [
      'For high-exposure contexts: travel without the SIM, or use a separate data-only eSIM.',
      'Know that airplane mode is the only real radio silence.',
      'Treat Tor/VPN as content protection — they do not mute the radio.',
    ],
  },
  {
    id: 'usb',
    phase: 5, impact: 1, effort: 1,
    title: 'Charge-only by default',
    why: 'USB data while locked is an accessory attack surface. Modern Android can close it entirely.',
    how: [
      'Settings → set default USB configuration to “charge only”.',
      'Keep “USB data access while locked” off; grant per-connection instead.',
      'Never accept a “trust this computer” prompt you did not initiate.',
    ],
  },
  {
    id: 'backup',
    phase: 5, impact: 3, effort: 2,
    title: 'Encrypted, offline, rehearsed backup',
    why: 'Ransomware, loss, and seizure all end the same way: without a backup you choose between paying and losing. An unencrypted backup is a second device to protect.',
    how: [
      'Client-side encryption first — the destination must never see plaintext.',
      'Keep one offline copy disconnected from the network; rotate it.',
      'Do a restore drill before you need one. Untested backups are hope, not backups.',
    ],
    devices: true,
  },
  {
    id: 'reboot-habit',
    phase: 5, impact: 2, effort: 1,
    title: 'Reboot before the risk',
    why: 'Rebooting returns the device to Before-First-Unlock: keys discarded, biometrics out, strongest state in one gesture.',
    how: [
      'Make it a ritual: crossings, checkpoints, overnight — reboot, not lock.',
      'Pair with a long credential, or BFU is throttling-only.',
      'Note what BFU does not protect: anything synced to the cloud already left the device.',
    ],
  },
  {
    id: 'supply-audit',
    phase: 1, impact: 2, effort: 2,
    title: 'Audit your sources',
    why: 'Every app is supply chain. Sideloading is a legitimate capability — treating every store listing as reviewed is not.',
    how: [
      'Prefer F-Droid-style reproducible sources or the vendor store; check the developer’s track record.',
      'Refuse APKs from links and chats — the classic delivery channel.',
      'Review installed apps monthly: anything unexplained gets researched or removed.',
    ],
  },
] as const

/* ---------- device recommendations ---------- */

const EN_DEVICES: Record<string, string[]> = {
  'threat-model': [
    'If your adversary is a platform or advertiser → profiles + identifier moves matter more than the OS swap.',
    'If your adversary forensically examines devices → lock credential + BFU habits jump the queue.',
    'If your adversary is a local network → the network phase first, the rest second.',
  ],
  updates: [
    'Fair/budget hardware: verify the vendor’s stated security-update window before trusting the device.',
    'Long-support flagships (e.g. 7-year commitments) change the replacement math — count it in the price.',
  ],
  lockscreen: [
    'Pixel + hardening OS: brute-force throttling is backed by dedicated hardware budgets (Weaver).',
    'Any device: the credential length is yours to choose — hardware cannot fix a 4-digit PIN.',
  ],
  'vpn-wireguard': [
    'Any device: WireGuard runs in an official app or inside a firewall/VPN client on Android 12+.',
    'Self-hosted? One small VPS + WireGuard covers a household — mind that it concentrates trust in you.',
  ],
  profiles: [
    'Android 13+: private space gives a lighter-weight compartment than full work profiles.',
    'Samsung/Xiaomi: vendor “secure folder / second space” features are work-profile-based — check what they can see.',
  ],
  os: [
    'GrapheneOS supports Pixel devices only — verified boot, attestation, and sandbox hardening maintained upstream.',
    '/e/OS, CalyxOS and others trade hardening depth for device breadth — read their threat-model notes first.',
    'No custom OS? A debloated stock Pixel with long support is a defensible middle path.',
  ],
  backup: [
    'Seedvault (open-source backup) integrates with several custom OSes; verify encryption status of your target.',
    'Cloud backups: only with client-side encryption, or treat the cloud copy as public.',
  ],
}

/* ---------- myths ---------- */

const EN_MYTHS = [
  {
    myth: 'Open source means secure.',
    reality: 'Openness enables verification — it does not do it for you. Security comes from reviewed, updated, correctly configured builds; plenty of open-source software ships unmaintained and insecure.',
  },
  {
    myth: 'An antivirus app makes Android safe.',
    reality: 'Modern Android’s threat model is mostly sandbox escapes and malicious apps, which Play Protect plus timely updates address better than add-on scanners. A third-party scanner adds attack surface of its own.',
  },
  {
    myth: 'Incognito mode makes you anonymous.',
    reality: 'It clears local history on your device. Your carrier, network, and the sites themselves see exactly what they always saw. Anonymity is a network- and identity-level property, not a browser toggle.',
  },
  {
    myth: 'A VPN makes you untrackable.',
    reality: 'A VPN moves visibility from your ISP to its operator and hides destinations — trackers still fingerprint your browser, apps still leak identifiers, and the provider sees enough to be a new risk.',
  },
]

/* ---------- further reading ---------- */

const EN_READS = [
  { name: 'Android security documentation', url: 'https://source.android.com/docs/security', note: 'Google’s official architecture references — verified boot, encryption, sandboxing.' },
  { name: 'GrapheneOS', url: 'https://grapheneos.org/', note: 'Hardened Android OS; their usage and security notes are first-rate regardless of your OS.' },
  { name: 'EFF — Surveillance Self-Defense', url: 'https://ssd.eff.org/', note: 'Threat modeling made practical, by the Electronic Frontier Foundation.' },
  { name: 'PrivacyGuides', url: 'https://www.privacyguides.org/en/', note: 'Community-maintained, well-argued tool and configuration recommendations.' },
  { name: 'The Tor Project', url: 'https://www.torproject.org/', note: 'Documentation worth reading even if you never open the browser.' },
]

import AR_PB from './playbook-ar'

export const TIERS = deepBi(EN_TIERS, AR_PB.tiers) as Tier[]
export const MOVES = deepBi(EN_MOVES, AR_PB.moves) as Move[]
export const MYTHS = deepBi(EN_MYTHS, AR_PB.myths) as Myth[]
export const READS = deepBi(EN_READS, AR_PB.reads) as Read[]

export const PHASE_LABELS: LArr = { en: ['Fundamentals', 'Device & OS', 'Isolation', 'Network', 'Identity & metadata', 'Physical & recovery'], ar: [...AR_PB.phases] }

export const DEVICES: Record<'en' | 'ar', Record<string, string[]>> = {
  en: EN_DEVICES,
  ar: AR_PB.devices as unknown as Record<string, string[]>,
}
