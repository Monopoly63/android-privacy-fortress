/* Static UI strings — English / Arabic. Dynamic data lives in data/content. */

export interface Bi { en: string; ar: string }

export const UI: Record<string, Bi> = {
  /* meta */
  'meta.title': { en: 'Android Privacy Fortress — A Layered Security System', ar: 'حصن أندرويد للخصوصية — نظام أمان متعدد الطبقات' },
  'meta.desc': { en: 'An interactive study of the smartphone as a layered security system: hardware trust, verified boot, isolation, cryptography, network control, identity separation, metadata protection and physical security.', ar: 'دراسة تفاعلية للهاتف الذكي بوصفه نظام أمان متعدد الطبقات: الثقة العتادية، الإقلاع المتحقَّق منه، العزل، التشفير، التحكم بالشبكة، فصل الهويات، حماية البيانات الوصفية، والأمن المادي.' },

  /* chrome */
  'skip': { en: 'Skip to content', ar: 'تخطَّ إلى المحتوى' },
  'nav.sub': { en: 'SYSTEMS VIEW', ar: 'منظور معماري' },
  'nav.menu': { en: 'Open section menu', ar: 'افتح قائمة الأقسام' },
  'lang.group': { en: 'Language', ar: 'اللغة' },

  /* hero */
  'hero.eyebrow': { en: 'Android Privacy Fortress · An interactive architecture study', ar: 'حصن أندرويد للخصوصية · دراسة معمارية تفاعلية' },
  'hero.title': { en: 'A smartphone engineered<br />as a <em>layered security system.</em>', ar: 'هاتف مصمَّم هندسياً<br />كنظام أمان <em>متعدِّد الطبقات.</em>' },
  'hero.lede': { en: 'Privacy is not a single feature. It is the combined result of hardware trust, verified boot, operating-system isolation, cryptography, network control, identity separation, metadata protection, and physical security.', ar: 'الخصوصية ليست ميزة واحدة، بل نتيجة تكامل: الثقة العتادية، الإقلاع المُتحقَّق منه، عزل نظام التشغيل، التشفير، التحكم بالشبكة، فصل الهويات، حماية البيانات الوصفية، والأمن المادي.' },
  'hero.cta1': { en: 'Explore the architecture', ar: 'استكشف المعمارية' },
  'hero.cta2': { en: 'Run the simulation', ar: 'شغِّل المحاكاة' },
  'hero.m1': { en: 'trust layers', ar: 'طبقات ثقة' },
  'hero.m2': { en: 'security domains', ar: 'مجالات أمنية' },
  'hero.m3': { en: 'attack simulations', ar: 'محاكاة هجوم' },
  'cue.scroll': { en: 'SCROLL', ar: 'مرِّر' },

  /* 02 why */
  'why.eyebrow': { en: '02 · First principles', ar: '02 · المبادئ الأولى' },
  'why.title': { en: 'One boundary is never enough.', ar: 'حدٌّ واحد لا يكفي أبداً.' },
  'why.lede': { en: 'A single control — a VPN, a password, a permission prompt — protects one surface and leaves the rest exposed. Real privacy emerges from layers, where each layer constrains a different kind of failure.', ar: 'إجراء واحد — شبكة VPN أو كلمة مرور أو نافذة أذونات — يحمي سطحاً واحداً ويترك الباقي مكشوفاً. الخصوصية الحقيقية تنشأ من الطبقات؛ كل طبقة تحتوي نوعاً مختلفاً من الاخفاق.' },
  'why.p1h': { en: 'A VPN alone', ar: 'شبكة VPN وحدها' },
  'why.p1': { en: 'Hides traffic from the local network — not your device identifiers, not your metadata, and nothing an installed app already knows about you.', ar: 'تُخفي حركتك عن الشبكة المحلية — لا عن مُعرِّفات جهازك، ولا عن بياناتك الوصفية، ولا عمّا تعرفه التطبيقات المثبَّتة عنك أصلاً.' },
  'why.p2h': { en: 'Encryption alone', ar: 'التشفير وحده' },
  'why.p2': { en: 'Protects data at rest. It does not stop an unlocked session, a compromised app, or a radio that keeps announcing who you are to the network.', ar: 'يحمي البيانات المخزَّنة، لكنه لا يوقف جلسة مفتوحة، ولا تطبيقاً مخترَقاً، ولا موجات راديو تواصل إعلان هويتك للشبكة.' },
  'why.p3h': { en: 'Permissions alone', ar: 'الأذونات وحدها' },
  'why.p3': { en: 'Consent prompts are not isolation. Without sandboxing and mandatory policy, one app’s bug becomes every other app’s breach.', ar: 'نوافذ الموافقة ليست عزلاً. بدون صناديق العزل والسياسة الإلزامية، تتحول ثغرة تطبيق واحد إلى اختراق لكل التطبيقات.' },
  'term.conf': { en: 'CONFIDENTIALITY', ar: 'السرية' },
  'term.conf.d': { en: 'Data is readable only by who holds the key.', ar: 'تُقرأ البيانات فقط لمن يملك المفتاح.' },
  'term.int': { en: 'INTEGRITY', ar: 'السلامة' },
  'term.int.d': { en: 'Software and data remain unmodified and verifiable.', ar: 'تبقى البرمجيات والبيانات بلا عبث وقابلة للتحقق.' },
  'term.priv': { en: 'PRIVACY', ar: 'الخصوصية' },
  'term.priv.d': { en: 'Control over what is revealed, to whom, and when.', ar: 'التحكم بما يُكشف، ولمن، ومتى.' },
  'term.anon': { en: 'ANONYMITY', ar: 'إخفاء الهوية' },
  'term.anon.d': { en: 'Action without a stable, linkable identity. Distinct from privacy.', ar: 'العمل دون هوية ثابتة قابلة للربط — وهو مفهوم يختلف عن الخصوصية.' },

  /* 03 story */
  'story.eyebrow': { en: '03 · The device, opened', ar: '03 · الجهاز مفتوحاً' },
  'story.title': { en: 'Seven layers between you and the silicon.', ar: 'سبع طبقات بينك وبين الرقاقة.' },
  'story.cue': { en: 'SCROLL TO OPEN THE DEVICE', ar: 'مرِّر لفتح الجهاز' },
  'story.s1t': { en: 'Hardware', ar: 'العتاد' },
  'story.s1d': { en: 'SoC, fuses, boot ROM. The root software cannot rewrite.', ar: 'معالج وفيوزات عتادية وذاكرة إقلاع ROM — جذرٌ لا تستطيع البرمجيات إعادة كتابته.' },
  'story.s2t': { en: 'Secure boot', ar: 'الإقلاع الآمن' },
  'story.s2d': { en: 'Each stage verifies the next signature before it may run.', ar: 'كل مرحلة تتحقق من توقيع المرحلة التالية قبل السماح لها بالعمل.' },
  'story.s3t': { en: 'Kernel · SELinux', ar: 'النواة · SELinux' },
  'story.s3d': { en: 'Mandatory policy decides what every process may touch.', ar: 'سياسة إلزامية تقرر ما يستطيع كل عملية لمسه.' },
  'story.s4t': { en: 'TEE · Key custody', ar: 'TEE · حفظ المفاتيح' },
  'story.s4d': { en: 'A processor inside the processor; keys never leave it.', ar: 'معالج داخل المعالج؛ المفاتيح لا تغادره أبداً.' },
  'story.s5t': { en: 'Android framework', ar: 'إطار أندرويد' },
  'story.s5d': { en: 'Permission decisions and audited IPC between components.', ar: 'قرارات الأذونات واتصالات IPC خاضعة للتدقيق بين المكوِّنات.' },
  'story.s6t': { en: 'App sandboxes', ar: 'صناديق عزل التطبيقات' },
  'story.s6d': { en: 'Every application is its own failure domain.', ar: 'كل تطبيق نطاق فشل مستقل بذاته.' },
  'story.s7t': { en: 'You', ar: 'أنت' },
  'story.s7d': { en: 'Identity, choices, intent. The layer all of it serves.', ar: 'الهوية والخيارات والنية — الطبقة التي تخدمها كل الطبقات.' },

  /* WebGL layer labels */
  'gl.0': { en: 'HARDWARE', ar: 'العتاد' },
  'gl.1': { en: 'SECURE BOOT', ar: 'الإقلاع الآمن' },
  'gl.2': { en: 'KERNEL · SELINUX', ar: 'النواة · SELinux' },
  'gl.3': { en: 'TEE · KEY CUSTODY', ar: 'TEE · حفظ المفاتيح' },
  'gl.4': { en: 'FRAMEWORK', ar: 'الإطار' },
  'gl.5': { en: 'APP SANDBOXES', ar: 'عزل التطبيقات' },
  'gl.6': { en: 'USER / IDENTITY', ar: 'المستخدم / الهوية' },

  /* 04 boundaries */
  'bounds.eyebrow': { en: '04 · Trust boundaries & attack surface', ar: '04 · حدود الثقة وسطح الهجوم' },
  'bounds.title': { en: 'Every layer draws a line.', ar: 'كل طبقة ترسم خطاً فاصلاً.' },
  'bounds.lede': { en: 'Select a layer to see what it can reach, what constrains it, and what stays outside its authority. The boundaries — not the features — are the product.', ar: 'اختر طبقة لترى ما تستطيع الوصول إليه، وما يقيِّدها، وما يبقى خارج سلطتها. الحدود — لا الميزات — هي المنتج الحقيقي.' },
  'bounds.note': { en: 'HOVER OR FOCUS A LAYER · CLICK TO LOCK SELECTION · ESC TO RELEASE', ar: 'مرِّر أو ركِّز على طبقة · انقر لتثبيت الاختيار · ESC للتحرير' },
  'bounds.cAccess': { en: 'Can access', ar: 'ما تستطيع الوصول إليه' },
  'bounds.cConstr': { en: 'Constrained by', ar: 'ما يقيِّدها' },
  'bounds.cIso': { en: 'Isolated from', ar: 'ما تبقى معزولاً عنها' },

  /* 05 architecture */
  'arch.eyebrow': { en: '05 · Two stacks, one device', ar: '05 · رصيفان في جهاز واحد' },
  'arch.title': { en: 'The radio lives a separate life.', ar: 'الراديو يعيش حياة منفصلة.' },
  'arch.lede': { en: 'The application stack and the network path are related but not equivalent trust domains. Data crosses between them through narrow, audited interfaces — and what the radio must reveal, the OS cannot veto.', ar: 'رصيف التطبيقات ومسار الشبكة نطاقا ثقة مترابطان لكنهما غير متكافئين. تنتقل البيانات بينهما عبر واجهات ضيقة خاضعة للتدقيق — وما يجب على الراديو كشفه لا يستطيع نظام التشغيل الاعتراض عليه.' },
  'arch.bridge': { en: 'RIL · NARROW AUDITED INTERFACE', ar: 'RIL · واجهة ضيقة مُدقَّقة' },
  'arch.sep': { en: 'TRUST<br/>BOUNDARY', ar: 'حدّ<br/>الثقة' },

  /* 06 domains */
  'dom.eyebrow': { en: '06 · Ten security domains', ar: '06 · عشرة مجالات أمنية' },
  'dom.title': { en: 'The system, domain by domain.', ar: 'النظام، مجالاً بمجال.' },
  'dom.lede': { en: 'Each domain protects different assets against different failures. Select one to inspect its objective, attack surface, and dependencies.', ar: 'كل مجال يحمي أصولاً مختلفة من اخفاق مختلف. اختر مجالاً لتفحص هدفه وسطح هجومه واعتمادياته.' },
  'dom.note': { en: '↑ ↓ ARROW KEYS MOVE SELECTION · ENTER OPENS', ar: 'الأسهم ↑ ↓ لتحريك الاختيار · Enter للفتح' },
  'dom.hSurface': { en: 'Attack surface', ar: 'سطح الهجوم' },
  'dom.hAssets': { en: 'Protected assets', ar: 'الأصول المحمية' },
  'dom.hTech': { en: 'Key technologies', ar: 'التقنيات الأساسية' },
  'dom.hExample': { en: 'Example attack &amp; mitigation', ar: 'مثال هجوم ووسائل التصدّي' },
  'dom.attackLbl': { en: 'Attack ·', ar: 'هجوم ·' },
  'dom.defLbl': { en: 'Defense ·', ar: 'دفاع ·' },
  'dom.relLbl': { en: 'RELATIONS →', ar: 'العلاقات ←' },

  /* 07 simulator */
  'sim.eyebrow': { en: '07 · Miniature functional model', ar: '07 · نموذج وظيفي مصغَّر' },
  'sim.title': { en: 'Watch the boundaries hold.', ar: 'شاهد الحدود وهي تصمد.' },
  'sim.lede': { en: 'Three common threat scenarios traced through the architecture. An educational model of how the layers interact — not a security guarantee.', ar: 'ثلاثة سيناريوهات تهديد شائعة متتبَّعة عبر المعمارية. نموذج تعليمي لتفاعل الطبقات — لا ضمانة أمنية.' },
  'sim.play': { en: 'Run scenario', ar: 'شغِّل السيناريو' },
  'sim.running': { en: 'Running…', ar: 'جارٍ التنفيذ…' },
  'sim.replay': { en: 'Replay scenario', ar: 'أعد تشغيل السيناريو' },
  'sim.logTitle': { en: 'EVENT LOG', ar: 'سجل الأحداث' },

  /* 08 network */
  'net.eyebrow': { en: '08 · Network &amp; metadata', ar: '08 · الشبكة والبيانات الوصفية' },
  'net.title': { en: 'Where does your traffic actually go?', ar: 'إلى أين تذهب حركتك فعلاً؟' },
  'net.lede': { en: 'Switch the routing mode and watch what changes — and, more importantly, what doesn’t.', ar: 'بدِّل نمط التوجيه ولاحظ ما يتغير — والأهم، ما لا يتغير.' },
  'net.direct': { en: 'Direct', ar: 'مباشر' },
  'net.vpn': { en: 'VPN', ar: 'شبكة VPN' },
  'net.tor': { en: 'Tor', ar: 'تور (Tor)' },
  'net.directSub': { en: 'NO TUNNEL', ar: 'بلا نفق' },
  'net.vpnSub': { en: 'ONE ENCRYPTED TUNNEL', ar: 'نفق مشفَّر واحد' },
  'net.torSub': { en: 'ONION ROUTING · 3 HOPS', ar: 'توجيه بصلي · 3 قفزات' },
  'meta.h3': { en: 'Content privacy <span class="neq mono">≠</span> metadata privacy.', ar: 'خصوصية المحتوى <span class="neq mono">≠</span> خصوصية البيانات الوصفية.' },
  'meta.lede': { en: 'Even a perfectly encrypted message leaves a shape behind.', ar: 'حتى الرسالة المشفَّرة بإتقان تترك وراءها شكلاً يمكن قراءته.' },
  'meta.contentTitle': { en: 'CONTENT — SEALED', ar: 'المحتوى — مختوم' },
  'meta.contentNote': { en: 'Unreadable without the key. This is what encryption buys you.', ar: 'لا تُقرأ دون المفتاح — هذا ما يمنحك إياه التشفير.' },
  'meta.metaTitle': { en: 'METADATA — STILL VISIBLE', ar: 'البيانات الوصفية — ما تزال مرئية' },
  'meta.metaNote': { en: 'Often enough to reconstruct who, when, where and how often.', ar: 'غالباً ما تكفي لإعادة بناء: مَن، متى، أين، وكم مرة.' },

  /* 09 baseband */
  'bb.eyebrow': { en: '09 · Cellular / baseband', ar: '09 · الخلوي / النطاق الأساسي' },
  'bb.title': { en: 'A second computer in your pocket.', ar: 'حاسوب ثانٍ في جيبك.' },
  'bb.lede': { en: 'The cellular modem is its own processor with its own firmware, and it must identify itself to the network. Hardening Android does not make the device invisible to the cellular network — this is an architectural fact, not a configuration oversight.', ar: 'مودم الشبكة الخلوية معالج مستقل ببرامج ثابتة خاصة به، ويجب أن يُعرِّف عن نفسه للشبكة. تقوية أندرويد لا تجعل جهازك غير مرئي للشبكة الخلوية — هذه حقيقة معمارية لا سهوٌ في الإعدادات.' },
  'bb.card1Title': { en: 'ANDROID OS — HARDENED', ar: 'نظام أندرويد — مُقسَّى' },
  'bb.t1': { en: '├── APPS <span class="bb-ok">· sandboxed</span>', ar: '├── التطبيقات <span class="bb-ok">· معزولة</span>' },
  'bb.t2': { en: '├── KERNEL <span class="bb-ok">· SELinux enforcing</span>', ar: '├── النواة <span class="bb-ok">· SELinux بوضع الإلزام</span>' },
  'bb.t3': { en: '└── SYSTEM SERVICES <span class="bb-ok">· least privilege</span>', ar: '└── خدمات النظام <span class="bb-ok">· أقل امتياز</span>' },
  'bb.card1Note': { en: 'Controls what software may do on the device.', ar: 'يتحكم بما تستطيع البرمجيات فعله على الجهاز.' },
  'bb.linkTag': { en: 'COMMANDS ONLY —<br/>NOT RADIO TRUTH', ar: 'أوامر فقط —<br/>لا حقيقة راديو' },
  'bb.card2Title': { en: 'CELLULAR MODEM — SEPARATE TRUST DOMAIN', ar: 'المودم الخلوي — نطاق ثقة منفصل' },
  'bb.card2Note': { en: 'Controls what the radio says. The OS can ask; it cannot verify.', ar: 'يتحكم بما يقوله الراديو؛ النظام يستطيع الطلب ولا يستطيع التحقق.' },
  'bb.mit': { en: 'MITIGATIONS · AIRPLANE MODE (RADIO OFF) · NO-SIM / DISABLED eSIM · TREAT TOR &amp; VPN AS CONTENT PROTECTION, NOT RADIO SILENCE', ar: 'وسائل التخفيف · وضع الطيران (إيقاف الراديو) · بدون شريحة أو تعطيل eSIM · تعامل مع Tor وVPN كحماية للمحتوى لا كصمت راديو' },
  'bb.imei': { en: 'The device’s radio identity — announced to register on any network.', ar: 'هوية الجهاز الراديوية — تُعلن للتسجيل في أي شبكة.' },
  'bb.imsi': { en: 'Subscriber identity — ties the radio to an account and a person.', ar: 'هوية المشترك — تربط الراديو بحساب وشخص.' },
  'bb.cellT': { en: 'Cell association', ar: 'اقتران الخلايا' },
  'bb.cell': { en: 'Towers know when you are near, and for how long. That is coarse location, continuously.', ar: 'الأبراج تعرف متى تكون قريباً وإلى متى — وهذا موقع تقريبي متواصل.' },
  'bb.sigT': { en: 'Signalling', ar: 'الإشارات' },
  'bb.sig': { en: 'Registration and paging happen even with no apps running at all.', ar: 'التسجيل والاستدعاء يحدثان حتى دون أي تطبيق يعمل.' },
  'bb.nModem': { en: 'MODEM', ar: 'المودم' },
  'bb.nTower': { en: 'CELL TOWER', ar: 'برج خلوي' },
  'bb.nCarrier': { en: 'CARRIER', ar: 'المشغّل' },

  /* 10 physical */
  'phys.eyebrow': { en: '10 · Physical / forensic security', ar: '10 · الأمن المادي والجنائي' },
  'phys.title': { en: 'When the device changes hands.', ar: 'حين ينتقل الجهاز إلى أيدي غيرك.' },
  'phys.lede': { en: 'Assume the phone is physically held by someone hostile. What is still protected depends entirely on the state the device is in.', ar: 'افترض أن الهاتف بيده طرف معادٍ فعلاً. ما يبقى محمياً يتوقف كلياً على الحالة التي يكون فيها الجهاز.' },
  'phys.matrixTitle': { en: 'PROTECTION LEVEL BY THREAT', ar: 'مستوى الحماية حسب التهديد' },
  'phys.lHigh': { en: 'PROTECTED', ar: 'محمي' },
  'phys.lMid': { en: 'LIMITED', ar: 'محدود' },
  'phys.lLow': { en: 'EXPOSED', ar: 'مكشوف' },

  /* 11 side channels */
  'sc.eyebrow': { en: '11 · Side channels', ar: '11 · القنوات الجانبية' },
  'sc.title': { en: 'Information escapes through behaviour.', ar: 'المعلومات تتسرب عبر السلوك.' },
  'sc.lede': { en: 'Even when direct access is restricted, observable behaviour can sometimes reveal information — through time, energy, radiation, or rhythm. The advanced edge of the discipline.', ar: 'حتى عندما يكون الوصول المباشر مقيَّداً، قد يكشف السلوك المُلاحَظ أحياناً معلومات — عبر الزمن أو الطاقة أو الإشعاع أو الإيقاع. هذه الحافة المتقدمة للتخصص.' },
  'sc.note': { en: 'RESEARCH-LEVEL SURFACE · USUALLY REQUIRES PROXIMITY, EQUIPMENT, OR COMPROMISED CODE RUNNING ON-DEVICE', ar: 'سطح بحثي متقدم · يتطلب عادةً قرباً فيزيائياً أو معدات أو شيفرة مخترَقة تعمل على الجهاز' },

  /* 12 supply chain */
  'chain.eyebrow': { en: '12 · Supply chain', ar: '12 · سلسلة التوريد' },
  'chain.title': { en: 'Security begins before first boot.', ar: 'الأمان يبدأ قبل أول إقلاع.' },
  'chain.lede': { en: 'If the software that ships is not the software that was reviewed, every later layer stands on sand. Follow the chain from source to silicon.', ar: 'إن لم يكن البرنامج المشحون هو البرنامج الذي رُوجع، فإن كل طبقة لاحقة تقف على الرمل. تتبَّع السلسلة من الشيفرة إلى الرقاقة.' },

  /* 13 defaults */
  'def.eyebrow': { en: '13 · Privacy by default', ar: '13 · الخصوصية افتراضياً' },
  'def.title': { en: 'Trust nothing until it is granted.', ar: 'لا تثق بشيء قبل منحه صراحة.' },
  'def.lede': { en: 'A secure system minimizes trust by default and grants access intentionally. Set the baseline, then watch the exposure counter respond.', ar: 'النظام الآمن يقلِّل الثقة افتراضياً ويمنح الوصول عن قصد. اضبط خط الأساس وراقب عدّاد التعرض يستجيب.' },
  'def.figureNote': { en: 'AN ILLUSTRATIVE POLICY PANEL — THE PRINCIPLE, NOT A REAL SETTINGS SCREEN', ar: 'لوحة سياسات توضيحية — المبدأ لا شاشة إعدادات حقيقية' },
  'def.countLabel': { en: 'SENSITIVE SURFACES CLOSED BY DEFAULT', ar: 'سطحاً حساساً مغلق افتراضياً' },
  'def.sum0': { en: 'Baseline posture: every sensitive surface denied until a deliberate, specific grant. This is what “secure by default” means in practice.', ar: 'الوضع الأساسي: كل سطح حساس مرفوض حتى يُمنح منحاً محدداً مقصوداً — هذا هو معنى «آمن افتراضياً» عملياً.' },
  'def.sumN': { en: '{n} surface(s) currently granted. Each open radio or permission is a door that must be justified — and can be revoked.', ar: '{n} من الأسطح ممنوح حالياً. كل راديو مفتوح أو إذن هو باب يجب تبريره — ويمكن سحبه.' },

  /* 14 compartments */
  'comp.eyebrow': { en: '14 · Application compartments', ar: '14 · حجرات التطبيقات' },
  'comp.title': { en: 'Divide, so nothing conquers all.', ar: 'قسِّم، كي لا يعبر شيءٌ إلى كل شيء.' },
  'comp.lede': { en: 'Profiles are floor plans: separate rooms with separate keys. Compromise of one compartment is not compromise of the device.', ar: 'الملفات الشخصية مخططات طوابق: غرف منفصلة بمفاتيح منفصلة. اختراق حجرة واحدة ليس اختراقاً للجهاز.' },
  'comp.root': { en: 'DEVICE · COMPARTMENT MAP', ar: 'الجهاز · خريطة الحجرات' },
  'comp.hPerms': { en: 'Permissions granted', ar: 'الأذونات الممنوحة' },
  'comp.none': { en: 'NONE — by design', ar: 'لا شيء — بالتصميم' },
  'comp.hNet': { en: 'Network boundary', ar: 'حد الشبكة' },

  /* 15 system */
  'sys.eyebrow': { en: '15 · The complete system', ar: '15 · النظام الكامل' },
  'sys.title': { en: 'Every layer, one architecture.', ar: 'كل الطبقات، معمارياً واحداً.' },
  'sys.lede': { en: 'Hardware, boot integrity, isolation, keys, profiles, tunnels, identifiers, the modem, the carrier, backups, monitoring, recovery — assembled.', ar: 'العتاد وسلامة الإقلاع والعزل والمفاتيح والملفات الشخصية والأنفاق والمُعرِّفات والمودم والمشغّل والنسخ الاحتياطي والمراقبة والاسترجاع — مجتمعة.' },

  /* playbook page */
  'pb.nav.arch': { en: 'Architecture', ar: 'المعمارية' },
  'pb.nav.baseline': { en: 'Baseline', ar: 'خط الأساس' },
  'pb.nav.moves': { en: 'Moves', ar: 'الخطوات' },
  'pb.nav.myths': { en: 'Myths', ar: 'الخرافات' },
  'pb.nav.reading': { en: 'Reading', ar: 'قراءات' },
  'pb.eyebrow': { en: 'The Hardening Playbook · From architecture to action', ar: 'دليل التحصين · من المعمارية إلى التنفيذ' },
  'pb.title': { en: 'Hardening begins<br />with a <em>move.</em>', ar: 'التحصين يبدأ<br />بـ<em>خطوة.</em>' },
  'pb.lede': { en: 'The architecture study explained why the layers exist. This playbook turns them into concrete steps — ordered by impact against effort, grounded in real tools, and tracked so progress survives the browser.', ar: 'دراسة المعمارية شرحت لماذا توجد الطبقات. هذا الدليل يحوّلها إلى خطوات محددة — مرتبة بالأثر مقابل الجهد، مؤسسة على أدوات حقيقية، مع تتبع يبقى تقدمك في متصفحك.' },
  'pb.cta1': { en: 'Start with the moves', ar: 'ابدأ بالخطوات' },
  'pb.cta2': { en: 'Back to the architecture', ar: 'العودة إلى المعمارية' },
  'pb.s1': { en: 'concrete moves', ar: 'خطوات محددة' },
  'pb.s2': { en: 'phases', ar: 'مراحل' },
  'pb.s3': { en: 'device baselines', ar: 'مستويات جهاز' },
  'pb.tiersEyebrow': { en: '01 · Pick your baseline', ar: '01 · اختر خط الأساس' },
  'pb.tiersTitle': { en: 'Three honest starting points.', ar: 'ثلاث نقاط انطلاق صادقة.' },
  'pb.tiersLede': { en: 'Hardening options depend on what the device allows. Pick the row that matches your constraints — every move below applies to all three unless noted.', ar: 'خيارات التحصين تعتمد على ما يسمح به الجهاز. اختر الصف المطابق لقيودك — كل خطوة أدناه تنطبق على الثلاثة ما لم يُذكر خلاف ذلك.' },
  'pb.tierBest': { en: 'STRONGEST POSTURE', ar: 'أقوى وضعية' },
  'pb.movesEyebrow': { en: '02 · The moves', ar: '02 · الخطوات' },
  'pb.movesTitle': { en: 'Highest impact first.', ar: 'الأثر الأعلى أولاً.' },
  'pb.movesLede': { en: 'Every move is a real action on a real device. Check them off as you go — the progress is kept in this browser, never sent anywhere.', ar: 'كل خطوة فعل حقيقي على جهاز حقيقي. ضع علامة كلما أنجزت — يُحفظ التقدم في هذا المتصفح ولا يُرسل لأي مكان.' },
  'pb.progressLabel': { en: 'MOVES DONE', ar: 'خطوات منجزة' },
  'pb.progressSaved': { en: 'STORED LOCALLY · NEVER SENT', ar: 'محفوظ محلياً · لا يُرسل أبداً' },
  'pb.progressReset': { en: 'Reset progress', ar: 'تصفير التقدم' },
  'pb.phaseAll': { en: 'All', ar: 'الكل' },
  'pb.impact': { en: 'Impact', ar: 'الأثر' },
  'pb.effort': { en: 'Effort', ar: 'الجهد' },
  'pb.i1': { en: 'basic', ar: 'أساسي' },
  'pb.i2': { en: 'high', ar: 'عالٍ' },
  'pb.i3': { en: 'critical', ar: 'حاسم' },
  'pb.e1': { en: 'low', ar: 'منخفض' },
  'pb.e2': { en: 'medium', ar: 'متوسط' },
  'pb.e3': { en: 'high', ar: 'مرتفع' },
  'pb.how': { en: 'How to execute', ar: 'كيف تنفذها' },
  'pb.tools': { en: 'Tools', ar: 'الأدوات' },
  'pb.example': { en: 'example, not endorsement', ar: 'مثال لا توصية' },
  'pb.deviceCallout': { en: 'IF THIS MOVE IS ON YOUR PATH', ar: 'إن كانت هذه الخطوة على طريقك' },
  'pb.deviceNote': { en: 'GENERAL DIRECTIONS, NOT ENDORSEMENTS — VERIFY EVERYTHING AGAINST CURRENT SOURCES', ar: 'اتجاهات عامة لا توصيات — تحقق من كل شيء مقابل المصادر الحالية' },
  'pb.mythsEyebrow': { en: '03 · Calibration', ar: '03 · معايرة' },
  'pb.mythsTitle': { en: 'Four myths worth retiring.', ar: 'أربع خرافات تستحق التقاعد.' },
  'pb.mythsLede': { en: 'Hardening is also about not spending trust on things that do not deliver it.', ar: 'التحصين أيضاً عدم إنفاق الثقة على ما لا يمنحها.' },
  'pb.mythLabel': { en: 'MYTH', ar: 'خرافة' },
  'pb.realityLabel': { en: 'REALITY', ar: 'الواقع' },
  'pb.readEyebrow': { en: '04 · Primary sources', ar: '04 · المصادر الأولى' },
  'pb.readTitle': { en: 'Go to the source, always.', ar: 'عد إلى المصدر، دائماً.' },
  'pb.readLede': { en: 'This playbook is a map. These are the territories — maintained by the projects and organizations that build and research the actual systems.', ar: 'هذا الدليل خريطة. وهذه هي الأراضي — يصونها المشاريع والمنظمات التي تبني الأنظمة الحقيقية وتبحثها.' },
  'pb.backEyebrow': { en: 'NEXT STEP', ar: 'الخطوة التالية' },
  'pb.backTitle': { en: 'Know the move.<br />Now learn why it holds.', ar: 'تعرفت على الخطوة.<br />الآن اعرف لماذا تصمد.' },
  'pb.backLede': { en: 'The architecture study walks the seven layers of the device — from silicon root of trust to metadata — and shows what each one actually contains.', ar: 'دراسة المعمارية تمشي في طبقات الجهاز السبع — من جذر الثقة في السيليكون إلى البيانات الوصفية — وتُظهر ما تحويه كل طبقة فعلاً.' },
  'pb.backBtn': { en: 'Explore the architecture', ar: 'استكشف المعمارية' },
  'pb.footerLine': { en: 'THE HARDENING PLAYBOOK · A COMPANION TO THE ANDROID PRIVACY FORTRESS', ar: 'دليل التحصين · رفيق حصن أندرويد للخصوصية' },
  'pb.footerFine': { en: 'Educational guidance, not security advice, and no endorsement of any product. Steps describe general Android capabilities at the time of writing — verify against current official documentation before acting. No step makes a device “unhackable”.', ar: 'إرشاد تعليمي لا نصيحة أمنية، ولا تأييد لأي منتج. تصف الخطوات قدرات أندرويد العامة وقت الكتابة — تحقق من الوثائق الرسمية الحالية قبل التنفيذ. لا خطوة تجعل الجهاز «مستحيلاً اختراقه».' },

  'fin.pbBtn': { en: 'Open the Hardening Playbook', ar: 'افتح دليل التحصين' },

  /* finale */
  'fin.quote': { en: 'Security is not a feature.<br/>It is an architecture of trust.', ar: 'الأمان ليس ميزة.<br/>إنه معماريّة ثقة.' },
  'fin.sub': { en: 'A privacy-focused Android device is not protected by one feature. It is protected by layers of trust, isolation, cryptography, controlled communication, identity separation, and carefully defined boundaries.', ar: 'جهاز أندرويد يضع الخصوصية في المقام الأول لا تحميه ميزة واحدة، بل تحميه طبقات من الثقة والعزل والتشفير، واتصال منضبط، وفصل للهويات، وحدود مدروسة بعناية.' },
  'footer.line': { en: 'ANDROID PRIVACY FORTRESS · AN INTERACTIVE ESSAY ON LAYERED MOBILE SECURITY', ar: 'حصن أندرويد للخصوصية · مقال تفاعلي في أمان الجوال متعدد الطبقات' },
  'footer.designed': { en: 'Designed &amp; engineered by', ar: 'تصميم وهندسة' },
  'footer.fine': { en: 'Educational visualization. Describes general Android security architecture; not affiliated with Google or any device maker, and not security advice. No feature makes a device “unhackable” — layers raise costs and shrink surfaces. Licensed under the terms described in the project LICENSE.', ar: 'عرض تعليمي يشرح المعمارية العامة لأمن أندرويد؛ غير تابع لجوجل أو أي صانع أجهزة، وليس نصيحة أمنية. لا ميزة تجعل الجهاز «مستحيلاً اختراقه» — الطبقات ترفع الكلفة وتقلص الأسطح. مرخّص وفق الشروط المبينة في ملف LICENSE.' },
}

/** Look up a UI string for a language. */
export function ui(key: string, lang: string): string {
  const entry = UI[key]
  return entry ? entry[lang === 'ar' ? 'ar' : 'en'] : key
}
