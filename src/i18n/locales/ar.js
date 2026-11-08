// Arabic interface text. Keys are grouped by screen area; en.js must have exactly the same keys
// (tests/i18n.test.js checks it). Use {name} for values filled in at runtime.
export default {
  common: {
    appTitle: 'ViralForge',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    copyAll: 'نسخ الكل',
    regenerate: 'إعادة توليد',
    regenerating: 'جارٍ إعادة التوليد...',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    optional: 'اختياري',
    paste: 'لصق سريع',
    exportAll: 'تصدير الكل',
    exportDone: 'تم التصدير بنجاح',
    exportFailed: 'فشل التصدير',
    copyFailed: 'فشل النسخ — يرجى تحديد النص يدوياً',
    clipboardEmpty: 'الحافظة فارغة.',
    clipboardFailed: 'تعذّر قراءة الحافظة. انسخ النص أولاً ثم حاول مرة أخرى.',
    outputPlaceholder: 'ستظهر النتائج هنا',
    outputSummary: 'تم التوليد. راجع النتائج وانسخ ما تحتاجه.'
  },
  header: {
    create: 'إنشاء',
    dashboard: 'المتابعة',
    myChannel: 'بيانات قناتي',
    addChannel: 'أضف قناتك',
    switchUser: 'تبديل المستخدم',
    lightMode: 'الوضع المضيء',
    darkMode: 'الوضع الداكن',
    toggleLanguage: 'تغيير اللغة إلى الإنجليزية',
    languageButton: 'EN',
    settings: 'الإعدادات'
  },
  footer: {
    openSource: 'مشروع مفتوح المصدر'
  },
  studios: {
    ariaLabel: 'الاستوديوهات',
    video: {
      tab: 'فيديو طويل',
      title: 'استوديو الفيديو الطويل',
      blurb: 'عناوين يوتيوب، وصف بقالبك وروابطك، وصورة مصغرة',
      detailsLabel: 'رقم الحلقة / الجزء',
      detailsPlaceholder: 'مثال: 01، الجزء 5'
    },
    short: {
      tab: 'شورتس وريلز',
      title: 'استوديو الشورتس',
      blurb: 'عنوان للشورتس، ووصف قصير بعدّاد لكل منصة، وهاشتاقات',
      detailsLabel: 'ماذا يحدث في المقطع؟ (اختياري)',
      detailsPlaceholder: 'مثال: فزت بآخر ثانية بضربة واحدة'
    },
    live: {
      tab: 'بث مباشر',
      title: 'استوديو البث المباشر',
      blurb: 'عناوين بث بعدّاد لكل منصة، وفئة ووسوم لـ Twitch و Kick',
      detailsLabel: 'فكرة البث (اختياري)',
      detailsPlaceholder: 'مثال: تحدي إنهاء اللعبة بدون موت'
    }
  },
  input: {
    quickTab: 'الوضع السريع',
    chatTab: 'استوديو المحادثة',
    gameLabel: 'اسم اللعبة',
    gamePlaceholder: 'مثال: إلدن رينغ، سايبربانك 2077',
    chatPlaceholder: 'اكتب طلبك هنا... (مثال: بث رعب ليلي في ماينكرافت مع تحدي النجاة حتى الفجر)',
    chatNote: 'ملاحظة: يُستخدم طلبك كموضوع للمحتوى في الاستوديو المفتوح وحسب المنصات المختارة.',
    writeRequestFirst: 'اكتب طلبك أولاً.',
    voiceStart: 'إدخال صوتي',
    voiceStop: 'إيقاف التسجيل الصوتي',
    generate: 'توليد البيانات الوصفية',
    generating: 'جارٍ توليد البيانات...'
  },
  platforms: {
    title: 'المنصات',
    titleLimit: 'عنوان',
    captionLimit: 'وصف',
    hint: 'يُكتب المحتوى ليناسب أشد حدود المنصات المختارة، ويظهر عدّاد لكل منصة في النتائج.'
  },
  template: {
    title: 'قالب وصف الفيديو',
    placeholders: 'المتغيرات:',
    edit: 'تعديل القالب',
    save: 'حفظ القالب',
    saved: 'تم الحفظ',
    readOnly: 'للقراءة فقط',
    placeholder: 'أدخل قالب وصف يوتيوب...',
    presets: 'قوالب جاهزة',
    presetPlaceholder: 'اختر قالباً جاهزاً...',
    presetLoaded: 'تم تطبيق القالب بنجاح',
    usePreset: 'استخدام القالب',
    channelNone: 'لم تُضف قناتك بعد',
    channelLinksHint: 'أضف روابطك لتُعبّأ في الأوصاف تلقائياً',
    editChannel: 'تعديل بيانات القناة'
  },
  presets: {
    'gaming-challenge-ar': 'قالب تحديات الألعاب',
    'gameplay-walkthrough': 'قالب تختيم ومغامرات ألعاب',
    'default-template': 'القالب الإنجليزي الافتراضي'
  },
  image: {
    uploadTitle: 'رفع صورة',
    maxSize: '(الحد الأقصى 10 ميغابايت)',
    dragDrop: 'اسحب وأفلت صورتك أو لقطة شاشة اللعب هنا',
    browse: 'أو انقر للاستعراض من جهازك (JPG, PNG, WebP حتى 10 ميغابايت)',
    remove: 'إزالة الصورة',
    noImage: 'لم ترفع صورة. سيتم وصف شخصية لاعب عامة في برومبت الصورة المصغرة.',
    onlyImages: 'يتم قبول ملفات الصور فقط (image/*).',
    tooBig: 'حجم الملف يتجاوز 10 ميغابايت. يرجى اختيار صورة أصغر.',
    previewAlt: 'معاينة الصورة المرفوعة'
  },
  options: {
    title: 'خيارات التوليد',
    reset: 'استعادة الافتراضي',
    resetDone: 'تمت استعادة خيارات التوليد الافتراضية',
    titles: 'توليد العناوين',
    titlesNote: 'يقوم بتوليد 3 عناوين جذابة بناءً على اسم اللعبة.',
    description: 'توليد الوصف',
    descriptionNote: 'يقوم بتوليد وصف كامل للفيديو (يعتمد على القالب إذا كان مفعلاً).',
    thumbnails: 'توليد الصور',
    thumbnailsNote: 'يجهّز برومبت صورة مصغرة يمكنك توليدها هنا أو في Gemini و ChatGPT.',
    customTemplate: 'استخدام القالب المخصص',
    customTemplateNote: 'عند التفعيل يُبنى الوصف من القالب بالأعلى. عند الإيقاف يكتب الذكاء الاصطناعي وصفاً حراً.',
    nothingSelected: 'فعّل خياراً واحداً على الأقل (العناوين، الوصف، أو الصورة).'
  },
  video: {
    titlesHeader: 'عناوين يوتيوب',
    copyTitles: 'نسخ العناوين',
    viralScore: 'مقياس الانتشار',
    descriptionHeader: 'الوصف',
    copyDescription: 'نسخ الوصف',
    thumbTitle: 'برومبت الصورة المصغرة (قابل للتعديل)',
    thumbPlaceholder: 'سيظهر برومبت الصورة المصغرة هنا تلقائياً بعد التوليد...',
    imageProvider: 'مزوّد الصور:',
    generateImage: 'توليد الصورة',
    generatingImage: 'جارٍ التوليد…',
    downloadImage: 'تحميل الصورة',
    generatedAlt: 'الصورة المولّدة',
    imageGenerated: 'تم توليد الصورة.',
    refWarning: 'هذا المزوّد لا يستخدم صورتك المرجعية، لذلك لن يظهر وجهك في الصورة.',
    refNotSupported: '{provider} لا يدعم صورتك المرجعية، سيتم التوليد بدونها.',
    copyOpenGemini: 'نسخ وفتح Gemini',
    copyOpenChatGpt: 'نسخ وفتح ChatGPT',
    geminiCopied: 'تم نسخ البرومبت! ارفع صورتك في Gemini والصقه.',
    chatGptCopied: 'تم نسخ البرومبت! ارفع صورتك في ChatGPT والصقه.'
  },
  shorts: {
    titles: 'عناوين YouTube Shorts',
    noTitle: 'TikTok و Reels و X لا تحتوي حقل عنوان. اختر YouTube Shorts لتوليد عنوان.',
    caption: 'الوصف القصير',
    hashtags: 'هاشتاق'
  },
  live: {
    titles: 'عناوين البث',
    category: 'الفئة',
    tags: 'الوسوم',
    copyTags: 'نسخ الوسوم',
    tagRule: 'حتى {max} وسوم، كل وسم حتى {len} حرفاً، حروف وأرقام فقط',
    metaTitle: 'فئة ووسوم {name}',
    overLimit: 'تجاوز الحد'
  },
  settings: {
    title: 'إعدادات مزوّدي الذكاء الاصطناعي',
    subtitle: 'اختر مزوّد النصوص ومزوّد الصور وأدخل مفاتيحك',
    textProvider: 'مزوّد النصوص',
    imageProvider: 'مزوّد الصور',
    keyLabel: 'مفتاح {name} API',
    getKey: 'احصل على مفتاح {name}',
    showKey: 'إظهار المفتاح',
    hideKey: 'إخفاء المفتاح',
    clearKey: 'حذف المفتاح',
    keyCleared: 'تم حذف المفتاح بنجاح',
    keysSaved: 'تم حفظ مفاتيح API!',
    keySaveFailed: 'تعذّر حفظ المفتاح:',
    keyRequired: 'يرجى إدخال مفتاح {provider} في الإعدادات أولاً.',
    usageHint: 'القيود تتغير من وقت لآخر، تحقّق من صفحة الأسعار عند المزوّد.',
    imageRefHint: 'هذا المزوّد لا يستخدم صورتك المرجعية، لذلك سيُولَّد الوجه بشكل عام.',
    warning: 'نسخة سطح المكتب تحفظ المفاتيح مشفّرة على جهازك. نسخة المتصفح تحفظها في هذا المتصفح فقط، فلا تستخدمها على جهاز مشترك.'
  },
  usage: {
    free: 'مجانية بالكامل',
    'free-limit': 'مجانية بحد استخدام',
    'free-then-paid': 'مجانية ثم مدفوعة',
    paid: 'مدفوعة'
  },
  onboarding: {
    welcomeTitle: 'أهلاً بك في ViralForge',
    welcomeText: 'عرّفنا على قناتك مرة واحدة. نستخدم هذه البيانات لتعبئة روابطك في الأوصاف تلقائياً، وتبقى محفوظة على جهازك فقط.',
    editTitle: 'بيانات قناتي',
    editText: 'تُستخدم هذه البيانات لتعبئة متغيرات القالب مثل {channel_link} و {discord_link}.',
    channelName: 'اسم القناة',
    channelNamePlaceholder: 'مثال: قناة الألعاب',
    channelUrl: 'رابط القناة',
    linktreeUrl: 'رابط حساباتك (Linktree أو غيره)',
    discordUrl: 'رابط سيرفر الديسكورد',
    style: 'أسلوب الكتابة',
    invalidUrl: 'الرابط غير صالح. استخدم رابطاً يبدأ بـ https://',
    nameRequired: 'اكتب اسم القناة.',
    start: 'ابدأ',
    skip: 'تخطّي الآن'
  },
  styles: {
    energetic: 'حماسي وسريع',
    funny: 'كوميدي وخفيف',
    calm: 'هادئ ومريح',
    informative: 'تعليمي وشارح'
  },
  dashboard: {
    title: 'لوحة المتابعة',
    subtitle: 'إحصائيات محلية تخص هذا المستخدم فقط.',
    clear: 'مسح السجل',
    clearConfirm: 'حذف سجل الاستخدام لهذا المستخدم؟',
    total: 'إجمالي عمليات التوليد',
    withDescription: 'نتائج بوصف مولّد',
    platformsUsed: 'المنصات المستخدمة',
    topPlatforms: 'أكثر المنصات استخداماً',
    byType: 'حسب الاستوديو',
    recent: 'آخر العمليات',
    empty: 'لا توجد عمليات بعد. ابدأ بتوليد أول محتوى.',
    untitled: 'بدون اسم'
  },
  picker: {
    subtitle: 'اختر مساحة العمل. كل مستخدم له مفاتيحه وإعداداته الخاصة على هذا الجهاز.',
    newUser: 'مستخدم جديد',
    newUserPlaceholder: 'مثال: قناة الألعاب',
    create: 'إنشاء'
  },
  voice: {
    notSupported: 'المتصفح لا يدعم الإدخال الصوتي.',
    notAllowed: 'لم يُسمح بالوصول إلى الميكروفون. فعّل الإذن من إعدادات المتصفح.',
    noSpeech: 'لم يُسمع أي كلام. حاول مرة أخرى.',
    audioCapture: 'لا يوجد ميكروفون متصل.',
    network: 'خدمة التعرف على الصوت غير متاحة الآن. تحقق من الاتصال.'
  },
  errors: {
    unknown: 'حدث خطأ غير معروف.',
    timeout: 'انتهت مهلة طلب الذكاء الاصطناعي ({seconds} ثانية). حاول مرة أخرى.',
    invalidKey: 'مفتاح {provider} غير صالح أو غير مسموح.',
    noCredit: '{provider}: الرصيد أو الحد المجاني انتهى.',
    rateLimited: '{provider}: تم تجاوز حد الطلبات. حاول لاحقاً.',
    generic: '{provider}: {message}',
    network: '{provider}: خطأ في الاتصال ({status})',
    imageTimeout: '{provider}: انتهت مهلة توليد الصورة ({seconds} ثانية). حاول مرة أخرى.',
    imageBilling: '{provider}: انتهى الحد المجاني أو الرصيد، أو يلزم تفعيل الفوترة.'
  }
};
