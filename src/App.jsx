import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Edit3,
  Save,
  FileText,
  Check,
  Copy,
  TrendingUp,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  AlertCircle,
  RefreshCw,
  Smartphone,
  X,
  Key,
  Eye,
  EyeOff,
  Loader2,
  Download,
  ExternalLink,
  SlidersHorizontal,
  Info,
  Plus,
  Zap,
  MessageSquare,
  Sun,
  Moon,
  Sparkles,
  Clipboard,
  Mic
} from 'lucide-react';

const translations = {
  ar: {
    appTitle: 'ViralForge',
    gameNameLabel: 'اسم اللعبة',
    gameNamePlaceholder: 'مثال: إلدن رينغ، سايبربانك 2077',
    episodeLabel: 'رقم الحلقة / الجزء',
    episodePlaceholder: 'مثال: 01، الجزء 5',
    generateBtn: 'توليد البيانات الوصفية',
    generatingBtn: 'جارٍ توليد البيانات...',
    templateTitle: 'قالب وصف الفيديو',
    editTemplateBtn: 'تعديل القالب',
    saveTemplateBtn: 'حفظ القالب',
    readOnlyBadge: 'للقراءة فقط',
    savedText: 'تم الحفظ',
    placeholdersInfo: 'المتغيرات:',
    templatePlaceholder: 'أدخل قالب وصف يوتيوب...',
    imageUploadTitle: 'رفع صورة',
    maxSizeText: '(الحد الأقصى 10 ميغابايت)',
    dragDropText: 'اسحب وأفلت لقطة شاشة اللعب أو الصورة المصغرة هنا',
    browseText: 'أو انقر للاستعراض من جهازك (JPG, PNG, WebP حتى 10 ميغابايت)',
    removeImageBtn: 'إزالة الصورة',
    outputPlaceholder: 'ستظهر النتائج هنا',
    titlesHeader: 'عناوين يوتيوب',
    shortsHeader: 'عناوين يوتيوب شورتس',
    descHeader: 'الوصف',
    thumbnailsHeader: 'صور مصغرة بالذكاء الاصطناعي',
    regenerateBtn: 'إعادة توليد',
    regeneratingBtn: 'جارٍ إعادة التوليد...',
    regenerateThumbnailsBtn: 'إعادة توليد الصور',
    copyBtn: 'نسخ',
    copyTitlesBtn: 'نسخ العناوين',
    copyShortsBtn: 'نسخ الشورتس',
    copyDescBtn: 'نسخ الوصف',
    copiedText: 'تم النسخ!',
    viralScore: 'مقياس الانتشار',
    conceptsBadge: '3 نماذج',
    conceptNum: 'النموذج',
    emptyPlaceholder: 'عنصر نائب فارغ',
    generatingConcept: 'جارٍ توليد النموذج',
    failedToLoadThumbnail: 'فشل التحميل — انقر لإعادة التوليد',
    downloadBtn: 'تنزيل',
    downloadingBtn: 'جارٍ التنزيل...',
    settingsTitle: 'إعدادات Gemini و Groq API',
    settingsSubtitle: 'تهيئة مفاتيح API الخاصة بك لتوليد النصوص والبدائل',
    apiKeyLabel: 'مفتاح Gemini API',
    apiKeyPlaceholder: 'أدخل مفتاح Gemini API هنا...',
    groqApiKeyLabel: 'مفتاح Groq API (الاحتياطي)',
    groqApiKeyPlaceholder: 'أدخل مفتاح Groq API هنا (احتياطي اختياري)...',
    warningText: 'يتم تخزين كلا المفتاحين في هذا المتصفح فقط. لا تستخدمهما على أجهزة مشتركة.',
    saveBtn: 'حفظ',
    clearBtn: 'مسح',
    cancelBtn: 'إلغاء',
    toastKeyRequired: 'يرجى إدخال مفتاح Gemini API في الإعدادات أولاً.',
    toastInvalidKey: 'مفتاح API غير صالح. تحقق من الإعدادات.',
    toastRateLimit: 'تم تجاوز حد الطلبات. انتظر لحظة.',
    toastTextGenFailed: 'فشل توليد النصوص:',
    toastThumbGenFailed: 'فشل توليد الصور المصغرة. انقر لإعادة التوليد.',
    toastMetadataSuccess: 'تم توليد البيانات الوصفية بنجاح!',
    toastTitlesRegenerated: 'تمت إعادة توليد العناوين بنجاح!',
    toastShortsRegenerated: 'تمت إعادة توليد عناوين الشورتس بنجاح!',
    toastDescRegenerated: 'تمت إعادة توليد الوصف بنجاح!',
    toastThumbnailsRegenerating: 'جارٍ إعادة توليد الصور المصغرة...',
    toastDownloaded: 'تم التنزيل!',
    toastDownloadFailed: 'فشل التنزيل',
    toastApiKeySaved: 'تم حفظ مفاتيح API!',
    toastApiKeyCleared: 'تم مسح مفاتيح API!',
    toastCopied: 'تم النسخ!',
    toastCopyFailed: 'فشل النسخ — يرجى تحديد النص يدوياً',
    toastImageOnly: 'يتم قبول ملفات الصور فقط (image/*).',
    toastImageSize: 'حجم الملف يتجاوز 10 ميغابايت. يرجى اختيار صورة أصغر.',
    toastTimeout: 'انتهت مهلة الطلب. حاول مرة أخرى.',
    toastAttemptsFailed: 'فشل توليد النصوص بعد 3 محاولات:',
    toastFallbackToGroq: 'فشل Gemini. جارٍ استخدام Groq كبديل.',
    toastBothFailed: 'فشل كل من Gemini و Groq. حاول مرة أخرى لاحقاً.',
    toastGroqFallbackFailed: 'فشل بديل Groq:',
    modelSelectionTitle: 'اختيار النماذج',
    geminiModelLabel: 'نموذج Gemini',
    groqModelLabel: 'نموذج Groq',
    openrouterModelLabel: 'نموذج OpenRouter',
    openrouterNote: 'إذا اخترت موديل مجاني، قد يكون أبطأ. الموديلات المدفوعة تحتاج رصيد في حسابك على OpenRouter.',
    freeLabel: 'مجاني',
    paidLabel: 'يتطلب الدفع',
    getKeyBtn: 'احصل على مفتاح (مجاني)',
    openrouterApiKeyLabel: 'مفتاح OpenRouter API',
    openrouterApiKeyPlaceholder: 'أدخل مفتاح OpenRouter API هنا (اختياري)...',
    quotaWarningNote1: "ملاحظة مهمة: كلمة 'مجاني' تعني أن الموديل مجاني ضمن حدود يومية. إذا وصلت للحد الأقصى، سيتوقف عن العمل مؤقتاً حتى يتم تجديد الحد. اختر دائماً الموديلات المجانية إذا كنت لا تريد الدفع.",
    quotaWarningNote2: "إذا وصلت للحد الأقصى اليومي للمفتاح، يمكنك حذف المفتاح من هنا وتوليد مفتاح جديد من حساب آخر (أو نفس الحساب) وإضافته في الحقل المخصص لاستكمال العمل دون انتظار.",
    exportAllBtn: 'تصدير الكل',
    toastExportSuccess: 'تم التصدير بنجاح',
    generationOptionsTitle: 'خيارات التوليد',
    toggleTitles: 'توليد العناوين',
    toggleShorts: 'توليد الشورتس',
    toggleDescription: 'توليد الوصف',
    toggleThumbnails: 'توليد الصور',
    toggleCustomTemplate: 'استخدام القالب المخصص',
    customTemplateNote: 'ملاحظة: عند التفعيل، سيتم بناء الوصف بناءً على القالب المكتوب بالأعلى. عند الإيقاف، سيكتب الذكاء الاصطناعي وصفاً حراً.',
    noteTitles: 'يقوم بتوليد 3 عناوين جذابة بناءً على اسم اللعبة.',
    noteShorts: 'يقوم بتوليد 3 عناوين قصيرة مع هاشتاقات فيديوهات الشورتس.',
    noteDescription: 'يقوم بتوليد وصف كامل للفيديو (يعتمد على القالب إذا كان مفعلاً).',
    noteThumbnails: 'يقوم بتوليد صورة مصغرة واحدة. يمكنك إضافة المزيد بعد ذلك للمقارنة.',
    generateAnotherThumbnailBtn: 'توليد صورة أخرى',
    compareThumbnailNote: 'اضغط لإضافة صورة جديدة للمقارنة.',
    maxThumbnailsReached: 'لقد وصلت للحد الأقصى (3 صور)',
    noImageNote: 'لم ترفع صورة. سيتم توليد الصورة من اسم اللعبة.',
    failedToLoadThumbnailText: 'فشل تحميل الصورة - جرب مرة أخرى',
    toastTextGenFailedLimits: 'Text generation failed. Check your API keys or daily limits.',
    openaiApiKeyLabel: 'مفتاح OpenAI (ChatGPT) API',
    openaiApiKeyPlaceholder: 'أدخل مفتاح OpenAI API هنا (sk-...)...',
    textProviderLabel: 'مزود النصوص',
    imageProviderLabel: 'مزود الصور',
    providerSectionTitle: 'اختيار مزودي الخدمة',
    providerNote1: 'ملاحظة: Gemini و ChatGPT يقدمان نصوصاً وصوراً. Groq يقدم نصوصاً فقط. Pollinations يقدم صوراً فقط.',
    providerNote2: 'الحدود المجانية: Gemini (~20 صورة/يوم)، ChatGPT (2-3 صور/يوم)، Groq (نصوص فقط، مجاني وسريع).',
    toastOpenAiKeyRequired: 'مفتاح OpenAI API مطلوب لاستخدام ChatGPT.',
    toastGeminiKeyRequired: 'مفتاح Gemini API مطلوب.',
    toastGroqKeyRequired: 'مفتاح Groq API مطلوب.',
    geminiImageBillingNote: 'ملاحظة: موديل صور Gemini يحتاج تفعيل الفوترة (Billing) في حساب Google Cloud. إذا لم يكن مفعلاً، سيستخدم البرنامج Pollinations تلقائياً.',
    toastGeminiImageQuotaFallback: 'Gemini image quota exceeded. Using Pollinations as fallback.',
    quickModeTab: 'الوضع السريع',
    chatStudioTab: 'استوديو المحادثة',
    chatStudioPlaceholder: 'اكتب طلبك هنا... (مثال: أبي صورة مصغرة مع اسم اللعبة، وتعطيني 3 عناوين فيديو، و3 عناوين شورت، ووصف واحد بنفس الأسلوب...)',
    chatStudioNote: 'ملاحظة: سيتم استخدام طلبك كما هو لتوليد النصوص والصور. إذا أردت استخدام اسم اللعبة ورقم الحلقة، استخدم الوضع السريع.',
    outputSummaryText: 'تم توليد الصورة والعناوين والوصف بناءً على طلبك',
    clearKeyBtn: 'حذف المفتاح',
    keyClearedSuccess: 'تم حذف المفتاح بنجاح',
    presetTemplatesLabel: 'قوالب جاهزة',
    selectPresetPlaceholder: 'اختر قالباً جاهزاً...',
    presetTemplateLoaded: 'تم تطبيق القالب بنجاح',
    resetOptionsBtn: 'إعادة تعيين',
    optionsResetToast: 'تم إعادة تعيين جميع الخيارات إلى الإيقاف',
    toastImageToImageFallback: 'فشل استخدام الصورة المرفوعة، تم توليد صورة من النص.',
    generateInGeminiBtn: 'توليد في Gemini',
    generateInChatGPTBtn: 'توليد في ChatGPT',
    toastGeminiCopiedPrompt: 'تم نسخ الطلب! ارفع صورتك في Gemini والصق الطلب.',
    toastChatGptCopiedPrompt: 'تم نسخ الطلب! ارفع صورتك في ChatGPT والصق الطلب.',
    imagePromptTitle: 'برومبت الصورة المصغرة (قابل للتعديل)',
    imagePromptPlaceholder: 'سيظهر برومبت الصورة المصغرة هنا تلقائياً بعد توليد العناوين...',
    copyAndOpenGeminiBtn: 'نسخ وفتح Gemini',
    copyAndOpenChatGptBtn: 'نسخ وفتح ChatGPT',
    toastGeminiPromptCopied: 'تم نسخ البرومبت! ارفع صورتك في Gemini والصقه.',
    toastChatGptPromptCopied: 'تم نسخ البرومبت! ارفع صورتك في ChatGPT والصقه.',
    pasteKeyBtn: 'لصق',
    pastedToast: 'تم اللصق',
    speechNotSupportedToast: 'المتصفح لا يدعم الإدخال الصوتي.',
    channelNameLabel: 'اسم القناة',
    channelUrlLabel: 'رابط القناة',
    footerDevelopedBy: 'تم التطوير بواسطة'
  },
  en: {
    appTitle: 'ViralForge',
    gameNameLabel: 'Game Name',
    gameNamePlaceholder: 'e.g. Elden Ring, Cyberpunk 2077',
    episodeLabel: 'Episode/Part Number',
    episodePlaceholder: 'e.g. 01, Part 5',
    generateBtn: 'Generate Metadata',
    generatingBtn: 'Generating Metadata...',
    templateTitle: 'Description Template',
    editTemplateBtn: 'Edit Template',
    saveTemplateBtn: 'Save Template',
    readOnlyBadge: 'Read Only',
    savedText: 'Saved',
    placeholdersInfo: 'Placeholders:',
    templatePlaceholder: 'Enter YouTube description template...',
    imageUploadTitle: 'Image Upload',
    maxSizeText: '(Max 10MB)',
    dragDropText: 'Drag & drop your gameplay screenshot or thumbnail here',
    browseText: 'or click to browse from device (JPG, PNG, WebP up to 10MB)',
    removeImageBtn: 'Remove image',
    outputPlaceholder: 'Output will appear here',
    titlesHeader: 'YouTube Titles',
    shortsHeader: 'YouTube Shorts Titles',
    descHeader: 'Description',
    thumbnailsHeader: 'AI Thumbnails',
    regenerateBtn: 'Regenerate',
    regeneratingBtn: 'Regenerating...',
    regenerateThumbnailsBtn: 'Regenerate Thumbnails',
    copyBtn: 'Copy',
    copyTitlesBtn: 'Copy Titles',
    copyShortsBtn: 'Copy Shorts',
    copyDescBtn: 'Copy Description',
    copiedText: 'Copied!',
    viralScore: 'Viral Score',
    conceptsBadge: '3 Concepts',
    conceptNum: 'Concept',
    emptyPlaceholder: 'Empty placeholder',
    generatingConcept: 'Generating concept',
    failedToLoadThumbnail: 'Failed to load — click Regenerate',
    downloadBtn: 'Download',
    downloadingBtn: 'Downloading...',
    settingsTitle: 'Gemini & Groq API Settings',
    settingsSubtitle: 'Configure your API keys for text generation & fallback',
    apiKeyLabel: 'Gemini API Key',
    apiKeyPlaceholder: 'Enter your Gemini API key...',
    groqApiKeyLabel: 'Groq API Key (Fallback)',
    groqApiKeyPlaceholder: 'Enter your Groq API key (optional fallback)...',
    warningText: 'Both keys are stored in this browser only. Do not use on shared computers.',
    saveBtn: 'Save',
    clearBtn: 'Clear',
    cancelBtn: 'Cancel',
    toastKeyRequired: 'Set your Gemini API key in Settings first.',
    toastInvalidKey: 'Invalid API key. Check Settings.',
    toastRateLimit: 'Rate limit hit. Wait a moment.',
    toastTextGenFailed: 'Text generation failed:',
    toastThumbGenFailed: 'Thumbnail generation failed. Click Regenerate.',
    toastMetadataSuccess: 'Metadata generated successfully!',
    toastTitlesRegenerated: 'Titles regenerated successfully!',
    toastShortsRegenerated: 'Shorts titles regenerated successfully!',
    toastDescRegenerated: 'Description regenerated successfully!',
    toastThumbnailsRegenerating: 'Regenerating thumbnails...',
    toastDownloaded: 'Downloaded!',
    toastDownloadFailed: 'Download failed',
    toastApiKeySaved: 'API Keys saved!',
    toastApiKeyCleared: 'API Keys cleared!',
    toastCopied: 'Copied!',
    toastCopyFailed: 'Copy failed — select text manually',
    toastImageOnly: 'Only image files (image/*) are accepted.',
    toastImageSize: 'File exceeds 10MB limit. Please choose a smaller image.',
    toastTimeout: 'Request timed out. Try again.',
    toastAttemptsFailed: 'Text generation failed after 3 attempts:',
    toastFallbackToGroq: 'Gemini failed. Using Groq as fallback.',
    toastBothFailed: 'Both Gemini and Groq failed. Try again later.',
    toastGroqFallbackFailed: 'Groq fallback failed:',
    modelSelectionTitle: 'Model Selection',
    geminiModelLabel: 'Gemini Model',
    groqModelLabel: 'Groq Model',
    openrouterModelLabel: 'OpenRouter Model',
    openrouterNote: 'إذا اخترت موديل مجاني، قد يكون أبطأ. الموديلات المدفوعة تحتاج رصيد في حسابك على OpenRouter.',
    freeLabel: 'مجاني',
    paidLabel: 'يتطلب الدفع',
    getKeyBtn: 'احصل على مفتاح (مجاني)',
    openrouterApiKeyLabel: 'OpenRouter API Key',
    openrouterApiKeyPlaceholder: 'Enter your OpenRouter API key (optional)...',
    quotaWarningNote1: "ملاحظة مهمة: كلمة 'مجاني' تعني أن الموديل مجاني ضمن حدود يومية. إذا وصلت للحد الأقصى، سيتوقف عن العمل مؤقتاً حتى يتم تجديد الحد. اختر دائماً الموديلات المجانية إذا كنت لا تريد الدفع.",
    quotaWarningNote2: "إذا وصلت للحد الأقصى اليومي للمفتاح، يمكنك حذف المفتاح من هنا وتوليد مفتاح جديد من حساب آخر (أو نفس الحساب) وإضافته في الحقل المخصص لاستكمال العمل دون انتظار.",
    exportAllBtn: 'Export All',
    toastExportSuccess: 'Export successful',
    generationOptionsTitle: 'Generation Options',
    toggleTitles: 'Generate Titles',
    toggleShorts: 'Generate Shorts',
    toggleDescription: 'Generate Description',
    toggleThumbnails: 'Generate Thumbnails',
    toggleCustomTemplate: 'Use Custom Template',
    customTemplateNote: 'Note: When enabled, the description will be built based on the template above. When disabled, AI will write a free-form description.',
    noteTitles: 'Generates 3 catchy video titles based on the game name.',
    noteShorts: 'Generates 3 short titles with hashtags for YouTube Shorts.',
    noteDescription: 'Generates a full video description (depends on template if enabled).',
    noteThumbnails: 'Generates one thumbnail. You can add more later for comparison.',
    generateAnotherThumbnailBtn: 'Generate Another Image',
    compareThumbnailNote: 'Click to add a new image for comparison.',
    maxThumbnailsReached: 'Maximum reached (3 images)',
    noImageNote: 'No image uploaded. Thumbnail will be generated from game name.',
    failedToLoadThumbnailText: 'Failed to load image - try again',
    toastTextGenFailedLimits: 'Text generation failed. Check your API keys or daily limits.',
    openaiApiKeyLabel: 'OpenAI (ChatGPT) API Key',
    openaiApiKeyPlaceholder: 'Enter your OpenAI API key here (sk-...)...',
    textProviderLabel: 'Text Provider',
    imageProviderLabel: 'Image Provider',
    providerSectionTitle: 'Provider Selection',
    providerNote1: 'Note: Gemini and ChatGPT provide both text and images. Groq provides text only. Pollinations provides images only.',
    providerNote2: 'Free Limits: Gemini (~20 images/day), ChatGPT (2-3 images/day), Groq (text only, free and fast).',
    toastOpenAiKeyRequired: 'OpenAI API key is required for ChatGPT.',
    toastGeminiKeyRequired: 'Gemini API key is required.',
    toastGroqKeyRequired: 'Groq API key is required.',
    geminiImageBillingNote: 'Note: Gemini image model requires billing enabled in Google Cloud. If not enabled, the app will automatically use Pollinations.',
    toastGeminiImageQuotaFallback: 'Gemini image quota exceeded. Using Pollinations as fallback.',
    quickModeTab: 'Quick Mode',
    chatStudioTab: 'Chat Studio',
    chatStudioPlaceholder: 'Write your request here... (e.g. I want a thumbnail with the game name, 3 video titles, 3 shorts titles, and 1 description in the same style...)',
    chatStudioNote: 'Note: Your request will be used as-is to generate text and images. If you want to use Game Name and Episode number, use Quick Mode.',
    outputSummaryText: 'Generated image, titles, and description based on your request',
    clearKeyBtn: 'Clear Key',
    keyClearedSuccess: 'API key cleared successfully',
    presetTemplatesLabel: 'Pre-made Templates',
    selectPresetPlaceholder: 'Choose a pre-made template...',
    presetTemplateLoaded: 'Template applied successfully',
    resetOptionsBtn: 'Reset',
    optionsResetToast: 'All generation options reset to OFF',
    toastImageToImageFallback: 'Failed to use uploaded image, generated from text.',
    generateInGeminiBtn: 'Generate in Gemini',
    generateInChatGPTBtn: 'Generate in ChatGPT',
    toastGeminiCopiedPrompt: 'Prompt copied! Upload your image in Gemini and paste the prompt.',
    toastChatGptCopiedPrompt: 'Prompt copied! Upload your image in ChatGPT and paste the prompt.',
    imagePromptTitle: 'Thumbnail Image Prompt (Editable)',
    imagePromptPlaceholder: 'Thumbnail image prompt will appear here automatically after generating titles...',
    copyAndOpenGeminiBtn: 'Copy & Open Gemini',
    copyAndOpenChatGptBtn: 'Copy & Open ChatGPT',
    toastGeminiPromptCopied: 'Prompt copied! Upload your image in Gemini and paste it.',
    toastChatGptPromptCopied: 'Prompt copied! Upload your image in ChatGPT and paste it.',
    pasteKeyBtn: 'Paste',
    pastedToast: 'Pasted successfully',
    speechNotSupportedToast: 'Browser does not support voice input.',
    channelNameLabel: 'Channel Name',
    channelUrlLabel: 'Channel URL',
    footerDevelopedBy: 'Developed by'
  }
};

const STORAGE_KEY = 'yt_creator_template';

const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'gemini', free: true },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'gemini', free: true },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', provider: 'gemini', free: true },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', provider: 'gemini', free: true },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', provider: 'gemini', free: false },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', provider: 'gemini', free: false },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'groq', free: true },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'groq', free: true },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', provider: 'groq', free: true },
  { id: 'openrouter/free', name: 'OpenRouter Free Router', provider: 'openrouter', free: true }
];

const DEFAULT_TEMPLATE = `🎮 Welcome to {game} - Episode {episode}!

In today's video, we are jumping back into {game} for another epic adventure!

Drop a LIKE and SUBSCRIBE if you enjoy the video!

📺 Check out {channel_name} and subscribe:
🔗 {channel_link}

⏱️ Timestamps:
00:00 - Introduction
01:30 - {game} Gameplay
10:00 - Highlights
15:00 - Outro & Next Episode

#gaming #{game}`;

const PRESET_TEMPLATES = [
  {
    id: 'roblox-challenge',
    name: {
      ar: 'قالب روبلوكس وتحديات الألعاب',
      en: 'Roblox & Gaming Challenges'
    },
    text: `بسم الله الرحمن الرحيم، سبحان الله وبحمده، سبحان الله العظيم. 🤍

في الحلقة {episode} من ماب "{game}" في روبلوكس.. رجعنا بتحدي أقوى وأسرع! ⛳😱 صرنا نجمع كميات أكبر ونحمل الكور بأسرع وقت ممكن عشان نفتح مناطق الـ Yards المتقدمة ونحطم أرقام قياسية جديدة! 🔥🚀

📺 لا تنسون تشيكون على قناة المبدع {channel_name} وتدعمونه بالاشتراك:
🔗 {channel_link}

🔔 اشترك بالقناة وفعل جرس التنبيهات عشان ما يفوتك أي جديد:
https://www.youtube.com/@IZEROXP?sub_confirmation=1

👍 لا تنسى اللايك إذا عجبك المقطع!

#Roblox #روبلوكس #{game} #gaming`
  },
  {
    id: 'gameplay-walkthrough',
    name: {
      ar: 'قالب تختيم ومغامرات ألعاب',
      en: 'Gameplay & Walkthrough'
    },
    text: `🎮 مرحباً بكم في الحلقة {episode} من تختيم لعبة {game}!

في هذه الحلقة نستكمل رحلتنا ونواجه تحديات جديدة ومثيرة! شاركوني رأيكم في التعليقات.

👍 إذا عجبك المقطع لا تنسى تضغط لايك وتشترك بالقناة وتفعل جرس التنبيهات 🔔

━━━━━━━━━━━━━━━
📺 لا تنسون تشيكون على قناة {channel_name} وتدعمونه بالاشتراك:
🔗 {channel_link}

🌐 جميع حساباتي وروابط البث:
🔗 {linktree_link}

💬 سيرفر الديسكورد:
🔗 {discord_link}
━━━━━━━━━━━━━━━
#{game} #تختيم #العاب`
  },
  {
    id: 'default-template',
    name: {
      ar: 'القالب الإنجليزي الافتراضي',
      en: 'Default English Template'
    },
    text: DEFAULT_TEMPLATE
  }
];

// Safe localStorage reader that falls back to defaults and warns if corrupted (invalid JSON)
const safeGetLocalStorage = (key, fallback) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }

    if (raw === 'undefined' || raw === 'null') {
      console.warn(`Corrupted localStorage entry for "${key}". Falling back to default.`);
      return fallback;
    }

    const trimmed = raw.trim();
    // If it starts with JSON syntax { or [, and is not a placeholder template like {game}
    const isPlaceholderStart = /^\{(game|episode|ep)\}/i.test(trimmed);
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && !isPlaceholderStart) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string') return parsed;
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.template === 'string') return parsed.template;
          if (typeof parsed.apiKey === 'string') return parsed.apiKey;
          if (typeof parsed.key === 'string') return parsed.key;
        }
        return raw;
      } catch (jsonErr) {
        console.warn(`Corrupted localStorage data for "${key}" (invalid JSON). Falling back to default.`, jsonErr);
        return fallback;
      }
    }

    return raw;
  } catch (err) {
    console.warn(`Failed to access localStorage for "${key}". Falling back to default.`, err);
    return fallback;
  }
};

const YOUTUBE_TITLE_VARIANTS = [
  [
    { template: "I Can't Believe What Happened in {game}! (Episode {ep})", baseScore: 92 },
    { template: "The ULTIMATE Secret in {game} (Part {ep})", baseScore: 85 },
    { template: "{game} Part {ep}: EVERYTHING Went Completely Wrong...", baseScore: 78 }
  ],
  [
    { template: "How I Mastered {game} in Episode {ep} (INSANE PROGRESS)", baseScore: 94 },
    { template: "DO NOT Make This Huge Mistake in {game}! (Part {ep})", baseScore: 88 },
    { template: "100 Hours of {game} Led to THIS Boss Fight (Ep {ep})", baseScore: 82 }
  ],
  [
    { template: "The Most Intense Moment in {game} History! (Episode {ep})", baseScore: 96 },
    { template: "Is {game} Actually Harder Than We Thought? (Part {ep})", baseScore: 89 },
    { template: "{game} Ep {ep} Speedrun Gone Horribly WRONG!", baseScore: 76 }
  ],
  [
    { template: "Finding The Hidden God Tier Item in {game} (Part {ep})", baseScore: 95 },
    { template: "I Challenged The Hardest Quest in {game} (Episode {ep})", baseScore: 87 },
    { template: "Why Everyone Is Playing {game} Wrong (Part {ep})", baseScore: 80 }
  ]
];

const SHORTS_TITLE_VARIANTS = [
  [
    "Wait for the ending in {game} 💀 #{gameTag} #shorts #{epTag}",
    "Only 1% of {game} players know this trick! 🔥 #shorts #gaming #{epTag}",
    "Never celebrate too early in {game}... 😭 #gaming #shorts #{gameTag}"
  ],
  [
    "The CLEANEST play in {game} so far! 🎯 #shorts #gaming #{gameTag}",
    "This {game} glitch makes zero sense 😂 #{gameTag} #shorts #{epTag}",
    "Bro thought he was safe in {game} 💀 #gaming #shorts #{epTag}"
  ],
  [
    "When your luck hits 999 in {game} ✨ #shorts #{gameTag} #gaming",
    "The hardest reflex test in {game}! ⚡ #gaming #shorts #{epTag}",
    "Top 3 {game} mistakes you are still making! ❌ #{gameTag} #shorts"
  ],
  [
    "Can we survive this insane round in {game}? 😱 #shorts #{epTag} #gaming",
    "Instant regret in {game} Episode {ep} 😭 #gaming #shorts #{gameTag}",
    "Nobody expected this in {game}! 🤯 #{gameTag} #shorts #{epTag}"
  ]
];

const DESCRIPTION_HOOKS = [
  "In today's video, we are jumping back into {game} for another epic adventure!",
  "In this episode, we push our limits, test new strategies, and uncover unbelievable secrets in {game}!",
  "Get ready for non-stop action and jaw-dropping gameplay as we tackle the hardest challenges in {game} yet!",
  "We are taking things to the next level in {game} today — drop a comment with your favorite moment!"
];

// iOS-Style Toggle Switch Component
function ToggleSwitch({ label, note, checked, onChange }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className="min-h-[44px] flex flex-col justify-between gap-2 p-3 rounded-lg bg-[#0d0f14]/80 border border-gray-700/60 hover:border-purple-500/50 cursor-pointer transition-colors select-none focus:outline-none focus:ring-1 focus:ring-purple-500"
    >
      <div className="flex items-center justify-between gap-2.5 w-full">
        <span className="text-xs sm:text-sm font-medium text-gray-200 leading-tight">
          {label}
        </span>
        <div
          dir="ltr"
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
            checked ? 'bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.35)]' : 'bg-gray-700'
          }`}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
      {note && (
        <p className="text-xs text-gray-400 leading-relaxed">
          {note}
        </p>
      )}
    </div>
  );
}

export default function App() {
  // Phase 7: Multi-Language Support
  const [lang, setLang] = useState('ar');
  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  // Phase 28: Dark/Light Mode Theme Toggle
  const [theme, setTheme] = useState(() => {
    return safeGetLocalStorage('theme_preference', 'dark');
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme_preference', theme);
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }

    const root = document.documentElement;
    const body = document.body;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Phase 20.1: Tabbed Interface (Quick Mode vs. Chat Studio)
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'chat'
  const [chatPrompt, setChatPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false); // Phase 35: Voice recording state

  // Phase 3-A: Clean Separate States
  const [gameName, setGameName] = useState('');
  const [episode, setEpisode] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null); // string | null (objectURL or data URL)
  const [uploadedImageBase64, setUploadedImageBase64] = useState(null); // string | null
  const [videoTitles, setVideoTitles] = useState([]); // array of { title: string, score: number }
  const [shortsTitles, setShortsTitles] = useState([]); // array of string
  const [description, setDescription] = useState(''); // string
  const [thumbnails, setThumbnails] = useState([]); // array of { url: string } — empty for now
  const [imagePrompt, setImagePrompt] = useState(''); // Phase 33: Editable image prompt
  const [toastMessage, setToastMessage] = useState(null); // string | null

  // Supporting UI states
  const [imageDetails, setImageDetails] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [toastType, setToastType] = useState('success');
  const [copiedSection, setCopiedSection] = useState(null);

  // Generation Toggles (independent checkboxes, all default to true)
  const [genTitles, setGenTitles] = useState(true);
  const [genShorts, setGenShorts] = useState(true);
  const [genDescription, setGenDescription] = useState(true);
  const [genThumbnails, setGenThumbnails] = useState(true);
  const [useCustomTemplate, setUseCustomTemplate] = useState(true);

  // Template Manager state
  const [template, setTemplate] = useState(() => {
    return safeGetLocalStorage(STORAGE_KEY, DEFAULT_TEMPLATE);
  });
  const [channelName, setChannelName] = useState(() => {
    return safeGetLocalStorage('channel_name', 'iZreoXP');
  });
  const [channelLink, setChannelLink] = useState(() => {
    return safeGetLocalStorage('channel_link', 'https://www.youtube.com/@IZEROXP');
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);

  // Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [openaiApiKeyInput, setOpenaiApiKeyInput] = useState('');
  const [showOpenaiApiKey, setShowOpenaiApiKey] = useState(false);
  const [groqApiKeyInput, setGroqApiKeyInput] = useState('');
  const [showGroqApiKey, setShowGroqApiKey] = useState(false);
  const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState('');
  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false);
  const [textProviderInput, setTextProviderInput] = useState('gemini');
  const [imageProviderInput, setImageProviderInput] = useState('pollinations');
  const [geminiModelInput, setGeminiModelInput] = useState('gemini-3.8-flash');
  const [groqModelInput, setGroqModelInput] = useState('openai/gpt-oss-120b');
  const [openRouterModelInput, setOpenRouterModelInput] = useState('openrouter/free');

  // Loading state for Gemini API
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingTitles, setIsRegeneratingTitles] = useState(false);
  const [isRegeneratingShorts, setIsRegeneratingShorts] = useState(false);
  const [isRegeneratingDescription, setIsRegeneratingDescription] = useState(false);
  const [isRegeneratingThumbnails, setIsRegeneratingThumbnails] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState(null);

  // Cycle counters for independent regeneration
  const [titleCycle, setTitleCycle] = useState(0);
  const [shortsCycle, setShortsCycle] = useState(0);
  const [descCycle, setDescCycle] = useState(0);

  const fileInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const thumbnailTimeoutsRef = useRef({});
  const uploadedImageRef = useRef(uploadedImage);
  const speechRecognitionRef = useRef(null);

  // Keep uploadedImageRef in sync
  useEffect(() => {
    uploadedImageRef.current = uploadedImage;
  }, [uploadedImage]);

  // Load template on mount, check localStorage integrity, & Cleanup on unmount
  useEffect(() => {
    // Check localStorage integrity on mount for corrupted JSON
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          const val = localStorage.getItem(k);
          if (val && typeof val === 'string') {
            const trimmed = val.trim();
            const isPlaceholder = /^\{(game|episode|ep)\}/i.test(trimmed);
            if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && !isPlaceholder) {
              try {
                JSON.parse(trimmed);
              } catch (e) {
                console.warn(`Corrupted localStorage entry found for "${k}" (invalid JSON). Falling back to defaults.`, e);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }

    const saved = safeGetLocalStorage(STORAGE_KEY, DEFAULT_TEMPLATE);
    if (saved) {
      // If the saved template is the exact old default without channel placeholders, upgrade it
      if (!saved.includes('{channel_name}') && !saved.includes('{channel_link}') && saved.includes('Drop a LIKE and SUBSCRIBE if you enjoy the video!')) {
        const upgraded = saved.replace(
          'Drop a LIKE and SUBSCRIBE if you enjoy the video!',
          'Drop a LIKE and SUBSCRIBE if you enjoy the video!\n\n📺 Check out {channel_name} and subscribe:\n🔗 {channel_link}'
        );
        try {
          localStorage.setItem(STORAGE_KEY, upgraded);
        } catch {}
        setTemplate(upgraded);
      } else {
        setTemplate(saved);
      }
    }

    // Ensure default channel_name and channel_link exist in localStorage
    if (localStorage.getItem('channel_name') === null) {
      try {
        localStorage.setItem('channel_name', 'iZreoXP');
      } catch {}
    }
    if (localStorage.getItem('channel_link') === null) {
      try {
        localStorage.setItem('channel_link', 'https://www.youtube.com/@IZEROXP');
      } catch {}
    }

    return () => {
      // Clear thumbnail 20s timeouts
      Object.values(thumbnailTimeoutsRef.current).forEach((timer) => clearTimeout(timer));
      // Revoke any created objectURL on unmount to prevent memory leaks
      if (uploadedImageRef.current && uploadedImageRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImageRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastType(type);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const saveToLocalStorage = (content) => {
    try {
      localStorage.setItem(STORAGE_KEY, content);
      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 2000);
    } catch (e) {
      console.warn('Failed to save template to localStorage', e);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      saveToLocalStorage(template);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveClick = () => {
    saveToLocalStorage(template);
    setIsEditing(false);
  };

  const handleSelectPresetTemplate = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const selected = PRESET_TEMPLATES.find((p) => p.id === selectedId);
    if (selected) {
      setTemplate(selected.text);
      saveToLocalStorage(selected.text);
      showToast(translations[lang]['presetTemplateLoaded'], 'success');
    }
  };

  const handleChannelNameChange = (e) => {
    const val = e.target.value;
    setChannelName(val);
    try {
      localStorage.setItem('channel_name', val);
    } catch (err) {
      console.warn('Failed to save channel_name to localStorage', err);
    }
  };

  const handleChannelLinkChange = (e) => {
    const val = e.target.value;
    setChannelLink(val);
    try {
      localStorage.setItem('channel_link', val);
    } catch (err) {
      console.warn('Failed to save channel_link to localStorage', err);
    }
  };

  const applyChannelPlaceholders = (text) => {
    if (!text || typeof text !== 'string') return text;
    const cName = safeGetLocalStorage('channel_name', channelName || 'iZreoXP');
    const cLink = safeGetLocalStorage('channel_link', channelLink || 'https://www.youtube.com/@IZEROXP');
    return text
      .replace(/{channel_name}/gi, cName)
      .replace(/{channel_link}/gi, cLink);
  };

  const handleClearSingleKey = (provider) => {
    try {
      if (provider === 'gemini') {
        localStorage.removeItem('gemini_api_key');
        setApiKeyInput('');
      } else if (provider === 'openai') {
        localStorage.removeItem('openai_api_key');
        setOpenaiApiKeyInput('');
      } else if (provider === 'groq') {
        localStorage.removeItem('groq_api_key');
        setGroqApiKeyInput('');
      } else if (provider === 'openrouter') {
        localStorage.removeItem('openrouter_api_key');
        setOpenRouterApiKeyInput('');
      }
      showToast(translations[lang]['keyClearedSuccess'], 'success');
    } catch (e) {
      console.warn('Failed to clear API key from localStorage', e);
    }
  };

  // Phase 35: Read from clipboard and paste into API key field
  const handlePasteKey = async (provider) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.readText) {
        showToast(translations[lang]['speechNotSupportedToast'] || 'Clipboard not supported', 'error');
        return;
      }
      const text = await navigator.clipboard.readText();
      const trimmed = (text || '').trim();
      if (!trimmed) {
        showToast(lang === 'ar' ? 'الحافظة فارغة' : 'Clipboard is empty', 'info');
        return;
      }
      if (provider === 'gemini') {
        setApiKeyInput(trimmed);
      } else if (provider === 'openai') {
        setOpenaiApiKeyInput(trimmed);
      } else if (provider === 'groq') {
        setGroqApiKeyInput(trimmed);
      } else if (provider === 'openrouter') {
        setOpenRouterApiKeyInput(trimmed);
      }
      showToast(translations[lang]['pastedToast'], 'success');
    } catch (err) {
      console.warn('Clipboard read error:', err);
      showToast(lang === 'ar' ? 'يرجى السماح بالوصول إلى الحافظة' : 'Clipboard permission denied', 'error');
    }
  };

  // Phase 35: Voice Input via Web Speech API in Chat Studio
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      showToast(translations[lang]['speechNotSupportedToast'], 'error');
      return;
    }

    if (isRecording) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setChatPrompt((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
          });
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsRecording(false);
      showToast(translations[lang]['speechNotSupportedToast'], 'error');
    }
  };

  const handleResetGenerationOptions = () => {
    setGenTitles(false);
    setGenShorts(false);
    setGenDescription(false);
    setGenThumbnails(false);
    setUseCustomTemplate(false);
    showToast(translations[lang]['optionsResetToast'], 'info');
  };

  const openSettings = () => {
    const savedKey = safeGetLocalStorage('gemini_api_key', '');
    const savedOpenaiKey = safeGetLocalStorage('openai_api_key', '');
    const savedGroqKey = safeGetLocalStorage('groq_api_key', '');
    const savedOpenRouterKey = safeGetLocalStorage('openrouter_api_key', '');
    const savedTextProvider = safeGetLocalStorage('text_provider', 'gemini');
    const savedImageProvider = safeGetLocalStorage('image_provider', 'pollinations');
    const savedGeminiModel = safeGetLocalStorage('selected_gemini_model', 'gemini-3.8-flash');
    const savedGroqModel = safeGetLocalStorage('selected_groq_model', 'openai/gpt-oss-120b');
    const savedOpenRouterModel = safeGetLocalStorage('selected_openrouter_model', 'openrouter/free');

    setApiKeyInput(savedKey);
    setOpenaiApiKeyInput(savedOpenaiKey);
    setGroqApiKeyInput(savedGroqKey);
    setOpenRouterApiKeyInput(savedOpenRouterKey);
    setTextProviderInput(savedTextProvider);
    setImageProviderInput(savedImageProvider);
    setGeminiModelInput(savedGeminiModel);
    setGroqModelInput(savedGroqModel);
    setOpenRouterModelInput(savedOpenRouterModel);

    setShowApiKey(false);
    setShowOpenaiApiKey(false);
    setShowGroqApiKey(false);
    setShowOpenRouterApiKey(false);
    setIsSettingsOpen(true);
  };

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('gemini_api_key', apiKeyInput.trim());
      localStorage.setItem('openai_api_key', openaiApiKeyInput.trim());
      localStorage.setItem('groq_api_key', groqApiKeyInput.trim());
      localStorage.setItem('openrouter_api_key', openRouterApiKeyInput.trim());
      localStorage.setItem('text_provider', textProviderInput);
      localStorage.setItem('image_provider', imageProviderInput);
      localStorage.setItem('selected_gemini_model', geminiModelInput);
      localStorage.setItem('selected_groq_model', groqModelInput);
      localStorage.setItem('selected_openrouter_model', openRouterModelInput);
      showToast(t('toastApiKeySaved'), 'success');
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
    setIsSettingsOpen(false);
  };

  const handleClearApiKey = () => {
    try {
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('openai_api_key');
      localStorage.removeItem('groq_api_key');
      localStorage.removeItem('openrouter_api_key');
      setApiKeyInput('');
      setOpenaiApiKeyInput('');
      setGroqApiKeyInput('');
      setOpenRouterApiKeyInput('');
      setTextProviderInput('gemini');
      setImageProviderInput('pollinations');
      setGeminiModelInput('gemini-3.8-flash');
      setGroqModelInput('openai/gpt-oss-120b');
      setOpenRouterModelInput('openrouter/free');
      localStorage.setItem('text_provider', 'gemini');
      localStorage.setItem('image_provider', 'pollinations');
      localStorage.setItem('selected_gemini_model', 'gemini-3.8-flash');
      localStorage.setItem('selected_groq_model', 'openai/gpt-oss-120b');
      localStorage.setItem('selected_openrouter_model', 'openrouter/free');
      showToast(t('toastApiKeyCleared'), 'info');
    } catch (e) {
      console.warn('Failed to remove API keys from localStorage', e);
    }
    setIsSettingsOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsSettingsOpen(false);
    }
  };

  const handleFile = (file) => {
    setImageError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const msg = t('toastImageOnly');
      setImageError(msg);
      showToast(msg, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const msg = t('toastImageSize');
      setImageError(msg);
      showToast(msg, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Revoke previous objectURL to prevent memory leaks
    if (uploadedImage && uploadedImage.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }

    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setImageDetails({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2)
    });

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveImage = (e) => {
    if (e) e.stopPropagation();
    if (uploadedImage && uploadedImage.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    setUploadedImageBase64(null);
    setImageDetails(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCleanInputs = () => {
    const game = gameName.trim() || 'My Game';
    const ep = episode.trim();
    const gameTag = game.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'game';
    const epClean = ep.replace(/[^a-zA-Z0-9]/g, '');
    const epTag = epClean ? `ep${epClean}` : '';
    return { game, ep, gameTag, epTag };
  };

  const generateTitlesData = (cycleIndex) => {
    const { game, ep } = getCleanInputs();
    const set = YOUTUBE_TITLE_VARIANTS[cycleIndex % YOUTUBE_TITLE_VARIANTS.length];
    return set.map((item) => {
      let title = item.template
        .replace(/{game}/gi, game)
        .replace(/{ep}/gi, ep || '')
        .replace(/{episode}/gi, ep || '');
      if (!ep) {
        title = title.replace(/\s*\((?:Episode|Part|Ep)\s*\)/gi, '')
                     .replace(/\s*(?:Episode|Part|Ep)\s*:\s*/gi, ': ')
                     .replace(/\s*Part\s*$/gi, '')
                     .replace(/\s*Episode\s*$/gi, '');
      }
      return {
        title,
        score: item.baseScore
      };
    });
  };

  const generateShortsData = (cycleIndex) => {
    const { game, ep, gameTag, epTag } = getCleanInputs();
    const set = SHORTS_TITLE_VARIANTS[cycleIndex % SHORTS_TITLE_VARIANTS.length];
    return set.map((t) => {
      let text = t
        .replace(/{game}/gi, game)
        .replace(/{ep}/gi, ep || '')
        .replace(/{episode}/gi, ep || '')
        .replace(/{gameTag}/gi, gameTag)
        .replace(/{epTag}/gi, epTag);
      if (!ep) {
        text = text.replace(/#ep\b/gi, '').replace(/\s{2,}/g, ' ').trim();
      }
      return text;
    });
  };

  const generateDescriptionData = (cycleIndex) => {
    const { game, ep } = getCleanInputs();

    let activeTemplate = template;
    try {
      const saved = safeGetLocalStorage(STORAGE_KEY, template || DEFAULT_TEMPLATE);
      if (saved) {
        activeTemplate = saved;
      }
    } catch (e) {
      console.warn('Failed to read template from localStorage', e);
    }

    const hook = DESCRIPTION_HOOKS[cycleIndex % DESCRIPTION_HOOKS.length]
      .replace(/{game}/gi, game)
      .replace(/{episode}/gi, ep || '')
      .replace(/{ep}/gi, ep || '');

    let replaced = activeTemplate
      .replace(/{game}/gi, game)
      .replace(/{episode}/gi, ep || '')
      .replace(/{ep}/gi, ep || '');

    if (!ep) {
      replaced = replaced.replace(/\s*-\s*Episode\s*!/gi, '!')
                         .replace(/\s*-\s*Episode\s*/gi, '')
                         .replace(/Episode\s*!/gi, '!')
                         .replace(/#ep\b/gi, '');
    }

    if (replaced.includes("In today's video, we are jumping back into")) {
      replaced = replaced.replace(
        /In today's video, we are jumping back into [^\n]+/,
        hook
      );
    }

    replaced = applyChannelPlaceholders(replaced);

    return replaced;
  };

  // Helper to ensure uploadedImage is a valid accessible URL and avoids URL length limits
  const ensureValidImageUrl = (imageSrc) => {
    if (!imageSrc || typeof imageSrc !== 'string') return '';
    // If it's a data URL that is too long for a GET query parameter (> 2000 chars), convert to Blob URL
    if (imageSrc.startsWith('data:image/') && imageSrc.length > 2000) {
      try {
        const arr = imageSrc.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        return URL.createObjectURL(blob);
      } catch (e) {
        console.warn('Failed to convert base64 to blob URL', e);
        return imageSrc;
      }
    }
    return imageSrc;
  };

  // Phase 33: Automatically generate detailed Image Prompt based on video titles
  const generateImagePromptFromTitles = (titles, customGame, customEp) => {
    let g = (customGame !== undefined ? customGame : gameName).trim();
    if (!g && activeTab === 'chat' && chatPrompt.trim()) {
      const match = chatPrompt.match(/(?:لعبة|ماب|game)\s+["'«]?([^"'»\n,،.]+)/i);
      g = match && match[1] ? match[1].trim() : '';
    }
    const ep = (customEp !== undefined ? customEp : episode).trim();
    const epPart = ep ? ` episode ${ep}` : '';

    let firstTitle = '';
    if (Array.isArray(titles) && titles.length > 0) {
      firstTitle = typeof titles[0] === 'string' ? titles[0] : (titles[0].title || '');
    } else if (Array.isArray(videoTitles) && videoTitles.length > 0) {
      firstTitle = typeof videoTitles[0] === 'string' ? videoTitles[0] : (videoTitles[0].title || '');
    }

    const gamePart = g ? `the game ${g}${epPart}` : (ep ? `episode ${ep}` : 'the game');
    const titlePart = firstTitle ? `. Based on the title: '${firstTitle}'` : '';

    return `YouTube Thumbnail style, 16:9, vibrant, highly detailed, featuring ${gamePart}${titlePart}. Add bold text, bright colors, and a clickbait expression.`;
  };



  // Gemini API caller with up to 3 attempts and 20s global timeout via AbortController
  const callGeminiWithRetry = async (apiKey, requestBody) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 20000);

    const selectedGeminiModel = safeGetLocalStorage('selected_gemini_model', 'gemini-3.8-flash').trim() || 'gemini-3.8-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedGeminiModel}:generateContent?key=${apiKey}`;

    let lastStatus = 'Network error';
    const hasGroqFallback = Boolean(safeGetLocalStorage('groq_api_key', '').trim());
    const maxAttempts = hasGroqFallback ? 1 : 3;

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          if (controller.signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });

          if (res.ok) {
            const responseJson = await res.json();
            const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
              throw new Error('Empty response');
            }
            return JSON.parse(rawText);
          }

          lastStatus = res.status;
          if (res.status === 401 || res.status === 403 || res.status === 404 || res.status === 400 || res.status === 429) {
            let errMsg = `Status ${res.status}`;
            try {
              const errJson = await res.json();
              if (errJson?.error?.message) errMsg = errJson.error.message;
            } catch {}
            const err = new Error(errMsg);
            err.status = res.status;
            throw err;
          }

          // If retryable status (503, 500, etc.) and attempts remain
          if (attempt < maxAttempts) {
            await new Promise((resolve, reject) => {
              const timer = setTimeout(resolve, 1000 * attempt);
              controller.signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('Aborted', 'AbortError'));
              }, { once: true });
            });
          }
        } catch (err) {
          if (err.name === 'AbortError' || controller.signal.aborted) {
            throw err;
          }
          if (err.status === 401 || err.status === 403 || err.status === 404 || err.status === 400 || err.status === 429) {
            throw err;
          }
          lastStatus = err.status || err.message || 'Network error';
          if (attempt < maxAttempts) {
            await new Promise((resolve, reject) => {
              const timer = setTimeout(resolve, 1000 * attempt);
              controller.signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('Aborted', 'AbortError'));
              }, { once: true });
            });
          }
        }
      }

      // Max attempts failed
      const finalErr = new Error(`Text generation failed after ${maxAttempts} attempts: ${lastStatus}`);
      finalErr.isAllAttemptsFailed = true;
      finalErr.status = lastStatus;
      throw finalErr;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Normalizes AI response from Groq (LLaMA) or Gemini
  const normalizeAiResponse = (parsed) => {
    if (!parsed || typeof parsed !== 'object') return {};
    const result = { ...parsed };

    // Video titles normalization
    const rawVideoTitles = result.videoTitles || result.video_titles || result.titles;
    if (Array.isArray(rawVideoTitles)) {
      result.videoTitles = rawVideoTitles.map((item) => {
        if (typeof item === 'string') {
          return { title: item, score: 85 };
        }
        if (item && typeof item === 'object') {
          return {
            title: item.title || item.name || '',
            score: typeof item.score === 'number' ? item.score : (Number(item.score) || 85)
          };
        }
        return { title: String(item || ''), score: 80 };
      });
    }

    // Shorts titles normalization
    const rawShortsTitles = result.shortsTitles || result.shorts_titles || result.shorts;
    if (Array.isArray(rawShortsTitles)) {
      result.shortsTitles = rawShortsTitles.map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return item.title || item.text || String(item);
        return String(item || '');
      });
    }

    // Description normalization
    const rawDescription = result.description ?? result.youtube_description ?? result.desc;
    if (typeof rawDescription === 'string') {
      result.description = rawDescription;
    } else if (Array.isArray(rawDescription)) {
      result.description = rawDescription.join('\n\n');
    }

    return result;
  };

  // Groq API caller using selected model from localStorage
  const callGroq = async (groqApiKey, prompt) => {
    const selectedGroqModel = safeGetLocalStorage('selected_groq_model', 'openai/gpt-oss-120b').trim() || 'openai/gpt-oss-120b';
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    // Phase 34: Ensure the prompt sent to Groq explicitly tells the model to output JSON
    const groqPrompt = prompt.includes('Please output the response in JSON format.')
      ? prompt
      : `${prompt}\nPlease output the response in JSON format.`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: selectedGroqModel,
        messages: [{ role: 'user', content: groqPrompt }],
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      let errMsg = `Status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.error?.message) {
          errMsg = errJson.error.message;
        } else if (errJson?.message) {
          errMsg = errJson.message;
        }
      } catch {
        const errText = await res.text().catch(() => '');
        if (errText) errMsg = errText;
      }
      const err = new Error(errMsg);
      err.status = res.status;
      throw err;
    }

    const resJson = await res.json();
    const rawContent = resJson.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Empty content from Groq');
    }

    let parsed;
    try {
      let cleanJson = rawContent.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }
      parsed = JSON.parse(cleanJson);
    } catch {
      const firstBrace = rawContent.indexOf('{');
      const lastBrace = rawContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        parsed = JSON.parse(rawContent.substring(firstBrace, lastBrace + 1));
      } else {
        parsed = JSON.parse(rawContent);
      }
    }

    return normalizeAiResponse(parsed);
  };

  // OpenAI API caller using gpt-4o-mini
  const callOpenAI = async (openaiApiKey, prompt) => {
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const jsonInstructionPrompt = `${prompt}\nEnsure the output is a valid JSON object with keys: "videoTitles", "shortsTitles", "description" (or the specific requested fields).`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: jsonInstructionPrompt }],
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      let errMsg = `Status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.error?.message) {
          errMsg = errJson.error.message;
        } else if (errJson?.message) {
          errMsg = errJson.message;
        }
      } catch {
        const errText = await res.text().catch(() => '');
        if (errText) errMsg = errText;
      }
      throw new Error(`OpenAI: ${errMsg}`);
    }

    const resJson = await res.json();
    const rawContent = resJson.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Empty content from OpenAI');
    }

    const parsed = JSON.parse(rawContent);
    return normalizeAiResponse(parsed);
  };

  // Text generation runner with Gemini primary & Groq fallback
  const executeWithGroqFallback = async (prompt, geminiRequestBody) => {
    const geminiKey = safeGetLocalStorage('gemini_api_key', '').trim();
    const groqKey = safeGetLocalStorage('groq_api_key', '').trim();

    if (!geminiKey && !groqKey) {
      showToast(t('toastKeyRequired'), 'error');
      return null;
    }

    if (geminiKey) {
      try {
        const geminiData = await callGeminiWithRetry(geminiKey, geminiRequestBody);
        return { data: geminiData, provider: 'gemini' };
      } catch (geminiErr) {
        // Without Groq key -> throw Gemini error so only Gemini error is displayed
        if (!groqKey) {
          throw { isGeminiOnly: true, error: geminiErr };
        }

        // With Groq key -> show fallback toast and call Groq
        showToast(t('toastFallbackToGroq'), 'info');

        try {
          const groqData = await callGroq(groqKey, prompt);
          return { data: groqData, provider: 'groq' };
        } catch (groqErr) {
          console.warn('Groq fallback failed:', groqErr);
          throw { isBothFailed: true, geminiError: geminiErr, groqError: groqErr };
        }
      }
    } else {
      // geminiKey is missing but groqKey is present: trigger Groq
      showToast(t('toastFallbackToGroq'), 'info');
      try {
        const groqData = await callGroq(groqKey, prompt);
        return { data: groqData, provider: 'groq' };
      } catch (groqErr) {
        throw { isBothFailed: true, groqError: groqErr };
      }
    }
  };

  // Universal Text Generation Dispatcher
  const executeTextGeneration = async (prompt, geminiRequestBody) => {
    const textProvider = safeGetLocalStorage('text_provider', 'gemini');
    const geminiKey = safeGetLocalStorage('gemini_api_key', '').trim();
    const openaiKey = safeGetLocalStorage('openai_api_key', '').trim();
    const groqKey = safeGetLocalStorage('groq_api_key', '').trim();

    if (textProvider === 'chatgpt') {
      if (!openaiKey) {
        showToast(t('toastOpenAiKeyRequired'), 'error');
        return null;
      }
      try {
        const openAiData = await callOpenAI(openaiKey, prompt);
        return { data: openAiData, provider: 'chatgpt' };
      } catch (openAiErr) {
        throw { isChatGpt: true, error: openAiErr };
      }
    }

    if (textProvider === 'groq') {
      if (!groqKey) {
        showToast(t('toastGroqKeyRequired'), 'error');
        return null;
      }
      try {
        const groqData = await callGroq(groqKey, prompt);
        return { data: groqData, provider: 'groq' };
      } catch (groqErr) {
        throw { isGroqOnly: true, groqError: groqErr };
      }
    }

    // Default: Gemini with Groq fallback
    if (!geminiKey && !groqKey) {
      showToast(t('toastGeminiKeyRequired'), 'error');
      return null;
    }
    return executeWithGroqFallback(prompt, geminiRequestBody);
  };

  // Phase 28: Specific API Error Formatter for Gemini and Groq
  const getSpecificApiErrorMessage = (err, provider = 'gemini') => {
    if (!err) return 'Unknown error occurred.';
    const status = err?.status || (typeof err === 'number' ? err : null) || (err?.message && err.message.match(/\b(401|429|403|404|500|503)\b/)?.[1]);
    const message = err?.message || (typeof err === 'string' ? err : '');

    if (provider === 'gemini') {
      if (status == 429 || message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('resource_exhausted')) {
        return 'Gemini Quota Exceeded. Try again later or use Groq.';
      }
      if (status == 401 || message.includes('401') || message.toLowerCase().includes('api_key_invalid') || message.toLowerCase().includes('api key')) {
        return 'Gemini API Key is invalid.';
      }
      return message || `Gemini error (${status || 'Network error'})`;
    }

    if (provider === 'groq') {
      if (status == 401 || message.includes('401') || message.toLowerCase().includes('invalid_api_key')) {
        return 'Groq API Key is invalid.';
      }
      if (status == 429 || message.includes('429') || message.toLowerCase().includes('rate_limit_exceeded') || message.toLowerCase().includes('quota')) {
        return 'Groq Quota Exceeded. Try again later.';
      }
      return message || `Groq error (${status || 'Network error'})`;
    }

    return message || `${provider} error`;
  };

  // Helper for generation error handling (Gemini, ChatGPT, or Groq)
  const handleGenerationError = (err) => {
    if (!err) return;

    if (err?.isBothFailed) {
      const geminiMsg = getSpecificApiErrorMessage(err.geminiError?.error || err.geminiError, 'gemini');
      const groqMsg = getSpecificApiErrorMessage(err.groqError, 'groq');
      showToast(`Both failed: [${geminiMsg}] [${groqMsg}]`, 'error');
      return;
    }

    if (err?.isGroqOnly) {
      showToast(getSpecificApiErrorMessage(err.groqError, 'groq'), 'error');
      return;
    }

    if (err?.isGeminiOnly) {
      showToast(getSpecificApiErrorMessage(err.error, 'gemini'), 'error');
      return;
    }

    if (err?.isChatGpt) {
      showToast(err.error?.message || 'ChatGPT text generation failed', 'error');
      return;
    }

    const provider = safeGetLocalStorage('text_provider', 'gemini');
    showToast(getSpecificApiErrorMessage(err, provider), 'error');
  };

  // Full Generate button click via Gemini API with Groq Fallback & Toggles
  const handleGenerate = async () => {
    if (!genTitles && !genShorts && !genDescription && !genThumbnails) {
      setVideoTitles([]);
      setShortsTitles([]);
      setDescription('');
      setImagePrompt('');
      return;
    }

    // Clear outputs of unchecked toggles
    if (!genTitles) setVideoTitles([]);
    if (!genShorts) setShortsTitles([]);
    if (!genDescription) setDescription('');
    if (!genThumbnails) setImagePrompt('');

    const game = gameName.trim() || 'My Game';
    const ep = episode.trim();

    const needsTextGen = genTitles || genShorts || genDescription || genThumbnails;
    if (!needsTextGen) {
      return;
    }

    const textProvider = safeGetLocalStorage('text_provider', 'gemini');
    const geminiKey = safeGetLocalStorage('gemini_api_key', '').trim();
    const openaiKey = safeGetLocalStorage('openai_api_key', '').trim();
    const groqKey = safeGetLocalStorage('groq_api_key', '').trim();

    if (textProvider === 'chatgpt' && !openaiKey) {
      showToast(t('toastOpenAiKeyRequired'), 'error');
      return;
    }
    if (textProvider === 'groq' && !groqKey) {
      showToast(t('toastGroqKeyRequired'), 'error');
      return;
    }
    if (textProvider === 'gemini' && !geminiKey && !groqKey) {
      showToast(t('toastGeminiKeyRequired'), 'error');
      return;
    }

    setIsLoading(true);

    try {
      const langInstruction = lang === 'en' ? 'Respond in English.' : 'Respond in Arabic.';
      const requestedParts = [];
      if (genTitles) requestedParts.push('3 catchy video titles with viral score 0-100');
      if (genShorts) requestedParts.push('3 shorts titles with hashtags');
      if (genDescription) {
        if (useCustomTemplate) {
          const currentTemplate = safeGetLocalStorage(STORAGE_KEY, template) || template;
          const templateWithChannels = applyChannelPlaceholders(currentTemplate);
          requestedParts.push(`1 full YouTube description constructed strictly using this custom template format:\n"""\n${templateWithChannels}\n"""\n(filling in placeholders like {game} and {episode})`);
        } else {
          requestedParts.push('1 full YouTube description (free-form, written creatively without following the custom template)');
        }
      }

      const epPart = ep ? `, episode: ${ep}` : '';
      let prompt = '';
      if (activeTab === 'chat') {
        const userText = chatPrompt.trim() || 'Create YouTube metadata';
        prompt = `You are a YouTube metadata expert. The user has provided this custom request: '${userText}'. 
Based on this request, generate EXACTLY:
- 3 YouTube video titles (with viral scores 0-100).
- 3 YouTube Shorts titles (with hashtags).
- 1 YouTube description (using the provided template style if the user mentioned it).
- Return the result strictly as a JSON object with keys: videoTitles (array of {title, score}), shortsTitles (array of strings), description (string).
Do not include any image description text in the JSON. Return only the JSON. ${langInstruction}`;
      } else {
        prompt = `You are a YouTube metadata expert. Given game name: ${game}${epPart}, return ${requestedParts.join(', and ')}. ${langInstruction}`;
      }

      const properties = {};
      const required = [];

      if (activeTab === 'chat') {
        properties.videoTitles = {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              score: { type: 'INTEGER' }
            },
            required: ['title', 'score']
          }
        };
        properties.shortsTitles = {
          type: 'ARRAY',
          items: { type: 'STRING' }
        };
        properties.description = {
          type: 'STRING'
        };
        required.push('videoTitles', 'shortsTitles', 'description');
      } else {
        if (genTitles) {
          properties.videoTitles = {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                score: { type: 'INTEGER' }
              },
              required: ['title', 'score']
            }
          };
          required.push('videoTitles');
        }

        if (genShorts) {
          properties.shortsTitles = {
            type: 'ARRAY',
            items: { type: 'STRING' }
          };
          required.push('shortsTitles');
        }

        if (genDescription) {
          properties.description = {
            type: 'STRING'
          };
          required.push('description');
        }
      }

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties,
            required
          }
        }
      };

      const result = await executeTextGeneration(prompt, requestBody);
      if (!result) return;

      const parsedData = result.data;
      let newTitles = [];
      if (genTitles && Array.isArray(parsedData.videoTitles)) {
        setVideoTitles(parsedData.videoTitles);
        newTitles = parsedData.videoTitles;
      }
      if (genShorts && Array.isArray(parsedData.shortsTitles)) {
        setShortsTitles(parsedData.shortsTitles);
      }
      if (genDescription && typeof parsedData.description === 'string') {
        setDescription(applyChannelPlaceholders(parsedData.description));
      }

      // Automatically generate a detailed IMAGE PROMPT based on generated video titles
      const promptText = generateImagePromptFromTitles(newTitles, game, ep);
      setImagePrompt(promptText);

      showToast(t('toastMetadataSuccess'), 'success');
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Independent Regenerate Titles via Gemini API with Groq Fallback
  const handleRegenerateTitles = async () => {
    const textProvider = safeGetLocalStorage('text_provider', 'gemini');
    const geminiKey = safeGetLocalStorage('gemini_api_key', '').trim();
    const openaiKey = safeGetLocalStorage('openai_api_key', '').trim();
    const groqKey = safeGetLocalStorage('groq_api_key', '').trim();

    if (textProvider === 'chatgpt' && !openaiKey) {
      showToast(t('toastOpenAiKeyRequired'), 'error');
      return;
    }
    if (textProvider === 'groq' && !groqKey) {
      showToast(t('toastGroqKeyRequired'), 'error');
      return;
    }
    if (textProvider === 'gemini' && !geminiKey && !groqKey) {
      showToast(t('toastGeminiKeyRequired'), 'error');
      return;
    }

    const game = gameName.trim() || 'My Game';
    const ep = episode.trim();

    setIsRegeneratingTitles(true);

    try {
      const langInstruction = lang === 'en' ? 'Respond in English.' : 'Respond in Arabic.';
      const descContext = description.trim()
        ? `Based on this description, generate 3 new titles:\n"${description.trim()}". `
        : '';
      let prompt = '';
      if (activeTab === 'chat') {
        const userText = chatPrompt.trim() || 'Create YouTube content';
        prompt = `Based on the following request: ${userText}. ${descContext}Generate 3 catchy video titles with viral score 0-100. Ensure the output is in JSON format and follows the exact structure requested. ${langInstruction}`;
      } else {
        prompt = ep
          ? `You are a YouTube metadata expert. Given game name: ${game}, episode: ${ep}. ${descContext}Return 3 catchy video titles with viral score 0-100. ${langInstruction}`
          : `You are a YouTube metadata expert. Given game name: ${game}. ${descContext}Return 3 catchy video titles with viral score 0-100. ${langInstruction}`;
      }

      const requestBody = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              videoTitles: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    title: { type: 'STRING' },
                    score: { type: 'INTEGER' }
                  },
                  required: ['title', 'score']
                }
              }
            },
            required: ['videoTitles']
          }
        }
      };

      const result = await executeTextGeneration(prompt, requestBody);
      if (!result) return;

      if (Array.isArray(result.data.videoTitles)) {
        setVideoTitles(result.data.videoTitles);
        const promptText = generateImagePromptFromTitles(result.data.videoTitles, game, ep);
        setImagePrompt(promptText);
        showToast(t('toastTitlesRegenerated'), 'success');
      }
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingTitles(false);
    }
  };

  // Independent Regenerate Shorts via Gemini API with Groq Fallback
  const handleRegenerateShorts = async () => {
    const textProvider = safeGetLocalStorage('text_provider', 'gemini');
    const geminiKey = safeGetLocalStorage('gemini_api_key', '').trim();
    const openaiKey = safeGetLocalStorage('openai_api_key', '').trim();
    const groqKey = safeGetLocalStorage('groq_api_key', '').trim();

    if (textProvider === 'chatgpt' && !openaiKey) {
      showToast(t('toastOpenAiKeyRequired'), 'error');
      return;
    }
    if (textProvider === 'groq' && !groqKey) {
      showToast(t('toastGroqKeyRequired'), 'error');
      return;
    }
    if (textProvider === 'gemini' && !geminiKey && !groqKey) {
      showToast(t('toastGeminiKeyRequired'), 'error');
      return;
    }

    const game = gameName.trim() || 'My Game';
    const ep = episode.trim();

    setIsRegeneratingShorts(true);

    try {
      const langInstruction = lang === 'en' ? 'Respond in English.' : 'Respond in Arabic.';
      const descContext = description.trim()
        ? `Based on this description, generate 3 shorts titles:\n"${description.trim()}". `
        : '';
      let prompt = '';
      if (activeTab === 'chat') {
        const userText = chatPrompt.trim() || 'Create YouTube content';
        prompt = `Based on the following request: ${userText}. ${descContext}Generate 3 catchy shorts titles with hashtags. Ensure the output is in JSON format and follows the exact structure requested. ${langInstruction}`;
      } else {
        prompt = ep
          ? `You are a YouTube metadata expert. Given game name: ${game}, episode: ${ep}. ${descContext}Return 3 catchy shorts titles with hashtags. ${langInstruction}`
          : `You are a YouTube metadata expert. Given game name: ${game}. ${descContext}Return 3 catchy shorts titles with hashtags. ${langInstruction}`;
      }

      const requestBody = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              shortsTitles: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              }
            },
            required: ['shortsTitles']
          }
        }
      };

      const result = await executeTextGeneration(prompt, requestBody);
      if (!result) return;

      if (Array.isArray(result.data.shortsTitles)) {
        setShortsTitles(result.data.shortsTitles);
        showToast(t('toastShortsRegenerated'), 'success');
      }
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingShorts(false);
    }
  };

  // Independent Regenerate Description via Gemini API with Groq Fallback
  const handleRegenerateDescription = async () => {
    const textProvider = safeGetLocalStorage('text_provider', 'gemini');
    const geminiKey = safeGetLocalStorage('gemini_api_key', '').trim();
    const openaiKey = safeGetLocalStorage('openai_api_key', '').trim();
    const groqKey = safeGetLocalStorage('groq_api_key', '').trim();

    if (textProvider === 'chatgpt' && !openaiKey) {
      showToast(t('toastOpenAiKeyRequired'), 'error');
      return;
    }
    if (textProvider === 'groq' && !groqKey) {
      showToast(t('toastGroqKeyRequired'), 'error');
      return;
    }
    if (textProvider === 'gemini' && !geminiKey && !groqKey) {
      showToast(t('toastGeminiKeyRequired'), 'error');
      return;
    }

    const game = gameName.trim() || 'My Game';
    const ep = episode.trim();

    setIsRegeneratingDescription(true);

    try {
      const langInstruction = lang === 'en' ? 'Respond in English.' : 'Respond in Arabic.';
      const titlesList = Array.isArray(videoTitles) && videoTitles.length > 0
        ? videoTitles.map((t, idx) => `${idx + 1}. ${t.title}`).join('\n')
        : '';
      const titlesContext = titlesList
        ? `Based on these titles, write a new description:\n${titlesList}\n. `
        : '';
      const rawTemplate = safeGetLocalStorage(STORAGE_KEY, template) || template;
      const templateWithChannels = applyChannelPlaceholders(rawTemplate);
      const templateInstruction = useCustomTemplate
        ? `Use this YouTube description template format and fill in all placeholders:\n"""\n${templateWithChannels}\n"""\n`
        : `Write a creative, high-converting free-form YouTube description without following any template. `;
      let prompt = '';
      if (activeTab === 'chat') {
        const userText = chatPrompt.trim() || 'Create YouTube content';
        prompt = `Based on the following request: ${userText}. ${titlesContext}${templateInstruction}Return 1 full YouTube description. Ensure the output is in JSON format and follows the exact structure requested. ${langInstruction}`;
      } else {
        prompt = ep
          ? `You are a YouTube metadata expert. Given game name: ${game}, episode: ${ep}. ${titlesContext}${templateInstruction}Return 1 full YouTube description. ${langInstruction}`
          : `You are a YouTube metadata expert. Given game name: ${game}. ${titlesContext}${templateInstruction}Return 1 full YouTube description. ${langInstruction}`;
      }

      const requestBody = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              description: {
                type: 'STRING'
              }
            },
            required: ['description']
          }
        }
      };

      const result = await executeTextGeneration(prompt, requestBody);
      if (!result) return;

      if (typeof result.data.description === 'string') {
        setDescription(applyChannelPlaceholders(result.data.description));
        showToast(t('toastDescRegenerated'), 'success');
      }
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingDescription(false);
    }
  };

  const handleExportAll = () => {
    try {
      const gName = gameName.trim() || 'game';
      const exportData = {
        game: gameName.trim() || 'My Game',
        episode: episode.trim() || '',
        videoTitles,
        shortsTitles,
        description,
        imagePrompt: imagePrompt || '',
        thumbnails: [],
        exportedAt: new Date().toISOString()
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const objectURL = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectURL;
      a.download = `youtube_metadata_${gName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(objectURL);
      }, 100);

      showToast(t('toastExportSuccess'), 'success');
    } catch (err) {
      console.warn('Export failed', err);
      showToast('Export failed', 'error');
    }
  };

  const copyToClipboard = async (text, sectionId, customToast) => {
    let copied = false;

    // 1. Try modern navigator.clipboard API if available (HTTPS / localhost)
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        copied = false;
      }
    }

    // 2. Fallback to hidden textarea + document.execCommand('copy') for non-HTTPS / unsupported contexts
    if (!copied && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '-9999px';
        textArea.style.opacity = '0';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          copied = true;
        }
      } catch {
        copied = false;
      }
    }

    // 3. Handle toasts
    if (copied) {
      setCopiedSection(sectionId);
      showToast(customToast || t('toastCopied'), 'success');
      setTimeout(() => {
        setCopiedSection((curr) => (curr === sectionId ? null : curr));
      }, 2000);
    } else {
      showToast(t('toastCopyFailed'), 'error');
    }
    return copied;
  };



  const handleCopyAndOpenGemini = async () => {
    const textToCopy = imagePrompt || generateImagePromptFromTitles(videoTitles);
    await copyToClipboard(textToCopy, 'image-prompt', translations[lang]['toastGeminiPromptCopied']);
    window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer');
  };

  const handleCopyAndOpenChatGPT = async () => {
    const textToCopy = imagePrompt || generateImagePromptFromTitles(videoTitles);
    await copyToClipboard(textToCopy, 'image-prompt', translations[lang]['toastChatGptPromptCopied']);
    window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
  };

  const hasGenerated =
    (genTitles && videoTitles.length > 0) ||
    (genShorts && shortsTitles.length > 0) ||
    (genDescription && Boolean(description)) ||
    Boolean(imagePrompt);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${lang === 'ar' ? 'font-arabic' : 'font-english'} min-h-screen bg-[#0d0f14] dark:bg-[#0d0f14] text-gray-100 dark:text-gray-100 flex flex-col relative w-full overflow-x-hidden transition-colors duration-200`}
    >
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#151922]/80 backdrop-blur px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 ltr:pr-2 rtl:pl-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] shrink-0" />
          <h1 className="text-base sm:text-xl font-bold tracking-wide bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent truncate">
            {translations[lang]['appTitle']}
          </h1>
          <a
            href="https://www.youtube.com/@IZEROXP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:text-purple-200 hover:border-purple-400 transition-all font-medium shrink-0 cursor-pointer shadow-sm"
            title="iZreoXP YouTube Channel"
          >
            by iZreoXP
          </a>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Phase 28: Dark / Light Mode Toggle Button */}
          <button
            type="button"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_12px_rgba(251,191,36,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'الوضع المضيء' : 'الوضع الداكن'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-purple-600" />
            )}
          </button>
          <button
            type="button"
            aria-label="Toggle language"
            onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-200 hover:text-purple-400 hover:border-purple-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center font-bold text-sm shrink-0 select-none"
          >
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>
          <button
            type="button"
            aria-label={translations[lang]['settingsTitle']}
            onClick={openSettings}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 pb-16 sm:pb-20">
        {/* Input Card with Tabbed Interface */}
        <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-5">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{translations[lang]['quickModeTab']}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{translations[lang]['chatStudioTab']}</span>
            </button>
          </div>

          {/* Tab 1: Quick Mode (Game Name & Episode) */}
          {activeTab === 'quick' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <label htmlFor="game-name" className="block text-sm font-medium text-gray-300">
                  {translations[lang]['gameNameLabel']}
                </label>
                <input
                  id="game-name"
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder={translations[lang]['gameNamePlaceholder']}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="episode-number" className="block text-sm font-medium text-gray-300">
                  {translations[lang]['episodeLabel']}
                </label>
                <input
                  id="episode-number"
                  type="text"
                  value={episode}
                  onChange={(e) => setEpisode(e.target.value)}
                  placeholder={translations[lang]['episodePlaceholder']}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Chat Studio (Custom Prompt Textarea & Note) */}
          {activeTab === 'chat' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="relative">
                <textarea
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  rows={5}
                  placeholder={translations[lang]['chatStudioPlaceholder']}
                  className="w-full p-4 pb-12 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all resize-y"
                />
                <button
                  type="button"
                  aria-label={isRecording ? 'إيقاف التسجيل الصوتي' : 'إدخال صوتي'}
                  onClick={handleToggleVoiceInput}
                  className={`min-h-[36px] min-w-[36px] absolute bottom-3 right-3 p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    isRecording
                      ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                      : 'bg-gray-800/90 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-purple-300 shadow-sm'
                  }`}
                  title={isRecording ? (lang === 'ar' ? 'إيقاف التسجيل الصوتي' : 'Stop voice recording') : (lang === 'ar' ? 'إدخال صوتي' : 'Voice input')}
                >
                  <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce text-white' : 'text-purple-400'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed flex items-start gap-1.5">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{translations[lang]['chatStudioNote']}</span>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full min-h-[44px] py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-emerald-600 shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:from-purple-500 hover:to-emerald-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>{translations[lang]['generatingBtn']}</span>
              </>
            ) : (
              <span>{translations[lang]['generateBtn']}</span>
            )}
          </button>
        </div>

        {/* Template Manager */}
        <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400 shrink-0" />
              <h2 className="text-base font-semibold text-gray-200">
                {translations[lang]['templateTitle']}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                {translations[lang]['placeholdersInfo']} <code className="text-purple-300">{"{game}"}</code>, <code className="text-emerald-300">{"{episode}"}</code>, <code className="text-blue-300">{"{channel_name}"}</code>, <code className="text-amber-300">{"{channel_link}"}</code>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {saveStatus && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
                  <Check className="w-3.5 h-3.5" /> {translations[lang]['savedText']}
                </span>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={handleSaveClick}
                  className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{translations[lang]['saveTemplateBtn']}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleEdit}
                aria-pressed={isEditing}
                className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  isEditing
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200 hover:bg-purple-900/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-purple-300 hover:border-purple-500/50'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{translations[lang]['editTemplateBtn']}</span>
              </button>
            </div>
          </div>

          {/* Pre-made Description Templates Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="preset-templates-select" className="text-xs font-semibold text-gray-300 shrink-0">
                {translations[lang]['presetTemplatesLabel']}:
              </label>
              <select
                id="preset-templates-select"
                onChange={handleSelectPresetTemplate}
                defaultValue=""
                className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-xs text-purple-300 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="" disabled>{translations[lang]['selectPresetPlaceholder']}</option>
                {PRESET_TEMPLATES.map((preset) => (
                  <option key={preset.id} value={preset.id} className="bg-[#151922] text-gray-200">
                    {preset.name[lang] || preset.name['ar']}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Channel Name and URL Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label htmlFor="channel-name-field" className="block text-xs font-semibold text-gray-300">
                {translations[lang]['channelNameLabel']}
              </label>
              <input
                id="channel-name-field"
                type="text"
                value={channelName}
                onChange={handleChannelNameChange}
                placeholder="iZreoXP"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="channel-link-field" className="block text-xs font-semibold text-gray-300">
                {translations[lang]['channelUrlLabel']}
              </label>
              <input
                id="channel-link-field"
                type="text"
                value={channelLink}
                onChange={handleChannelLinkChange}
                placeholder="https://www.youtube.com/@IZEROXP"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              readOnly={!isEditing}
              rows={9}
              className={`w-full p-4 rounded-lg font-mono text-sm border transition-all resize-y ${
                isEditing
                  ? 'bg-[#0d0f14] border-purple-500 text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                  : 'bg-[#0d0f14]/60 border-gray-800 text-gray-300 cursor-default focus:outline-none'
              }`}
              placeholder={translations[lang]['templatePlaceholder']}
            />
            {!isEditing && (
              <div className="absolute top-3 ltr:right-3 rtl:left-3 pointer-events-none">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-800/90 text-gray-400 border border-gray-700/80">
                  {translations[lang]['readOnlyBadge']}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-gray-200">
              {translations[lang]['imageUploadTitle']}
            </h3>
            <span className="text-xs text-gray-500">{translations[lang]['maxSizeText']}</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-file-input"
          />

          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!uploadedImage && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center transition-all duration-200 ${
              isDragging
                ? 'border-purple-500 bg-purple-950/25 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'border-gray-700/80 bg-[#0d0f14]/70 hover:border-purple-500/50 hover:bg-[#0d0f14]'
            } ${!uploadedImage ? 'cursor-pointer min-h-[160px]' : 'min-h-[220px]'}`}
          >
            {uploadedImage ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <img
                  src={uploadedImage}
                  alt="Uploaded thumbnail preview"
                  className="max-h-[200px] w-auto max-w-full rounded-lg object-contain shadow-lg border border-gray-800"
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full pt-2 border-t border-gray-800/80 px-2">
                  <div className="text-xs text-gray-300 truncate max-w-full sm:max-w-[240px] text-center sm:ltr:text-left sm:rtl:text-right">
                    <span className="font-medium text-gray-100">{imageDetails?.name || 'Image'}</span>
                    {imageDetails?.size && (
                      <span className="text-gray-500 ltr:ml-2 rtl:mr-2">({imageDetails.size} MB)</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 hover:text-red-200 transition-all cursor-pointer w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{translations[lang]['removeImageBtn']}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center pointer-events-none p-2">
                <div className="w-12 h-12 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {translations[lang]['dragDropText']}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {translations[lang]['browseText']}
                  </p>
                </div>
              </div>
            )}
          </div>

          {imageError && (
            <p className="text-xs text-red-400 flex items-center gap-1.5 pt-1 break-words">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{imageError}</span>
            </p>
          )}

          {!uploadedImage && (
            <p className="text-xs text-purple-400/90 flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{translations[lang]['noImageNote']}</span>
            </p>
          )}
        </div>

        {/* Generation Options (Toggles) */}
        <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-gray-200">
                {translations[lang]['generationOptionsTitle']}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleResetGenerationOptions}
              className="min-h-[32px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-gray-800/80 hover:bg-red-950/50 text-gray-300 hover:text-red-300 border border-gray-700/80 hover:border-red-500/40 transition-all cursor-pointer shadow-sm"
              title={translations[lang]['resetOptionsBtn']}
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
              <span>{translations[lang]['resetOptionsBtn']}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            <ToggleSwitch
              label={translations[lang]['toggleTitles']}
              note={translations[lang]['noteTitles']}
              checked={genTitles}
              onChange={(val) => setGenTitles(val)}
            />
            <ToggleSwitch
              label={translations[lang]['toggleShorts']}
              note={translations[lang]['noteShorts']}
              checked={genShorts}
              onChange={(val) => setGenShorts(val)}
            />
            <ToggleSwitch
              label={translations[lang]['toggleDescription']}
              note={translations[lang]['noteDescription']}
              checked={genDescription}
              onChange={(val) => setGenDescription(val)}
            />
            <ToggleSwitch
              label={translations[lang]['toggleThumbnails']}
              note={translations[lang]['noteThumbnails']}
              checked={genThumbnails}
              onChange={(val) => setGenThumbnails(val)}
            />
          </div>

          {/* Template Toggle (iOS-style switch with explanatory note) */}
          <div className="pt-2 border-t border-gray-800/80">
            <ToggleSwitch
              label={translations[lang]['toggleCustomTemplate']}
              note={translations[lang]['customTemplateNote']}
              checked={useCustomTemplate}
              onChange={(val) => setUseCustomTemplate(val)}
            />
          </div>
        </div>

        {/* Output Area */}
        {!hasGenerated ? (
          <div className="bg-[#151922] border border-dashed border-gray-800 rounded-xl p-8 min-h-[180px] flex items-center justify-center text-center">
            <p className="text-gray-500 italic text-base select-none">
              {translations[lang]['outputPlaceholder']}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top of Output Area: Export All Button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleExportAll}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow-md hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{translations[lang]['exportAllBtn']}</span>
              </button>
            </div>

            {/* 1. Thumbnail Image Prompt Section (Editable) */}
            {(genThumbnails || Boolean(imagePrompt)) && (
              <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                    <h3 className="text-base font-semibold text-gray-200">
                      {translations[lang]['imagePromptTitle']}
                    </h3>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder={translations[lang]['imagePromptPlaceholder']}
                    className="w-full bg-[#0d0f14] border border-gray-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl p-3.5 text-xs sm:text-sm text-gray-200 placeholder-gray-500 transition-all outline-none resize-y font-sans leading-relaxed"
                  />
                </div>

                {/* Two buttons below the textarea */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* "نسخ وفتح Gemini" (Copy & Open Gemini) */}
                  <button
                    type="button"
                    onClick={handleCopyAndOpenGemini}
                    className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border border-indigo-500/50 shadow-md hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>{translations[lang]['copyAndOpenGeminiBtn']}</span>
                  </button>

                  {/* "نسخ وفتح ChatGPT" (Copy & Open ChatGPT) */}
                  <button
                    type="button"
                    onClick={handleCopyAndOpenChatGPT}
                    className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-teal-500/50 shadow-md hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-200" />
                    <span>{translations[lang]['copyAndOpenChatGptBtn']}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Summary Text below Image */}
            <div className="text-xs sm:text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 shadow-sm">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{translations[lang]['outputSummaryText']}</span>
            </div>

            {/* 2. YouTube Titles Section */}
            {genTitles && videoTitles.length > 0 && (
            <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h3 className="text-base font-semibold text-gray-200">
                    {translations[lang]['titlesHeader']}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRegenerateTitles}
                    disabled={isRegeneratingTitles}
                    className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gray-800 border border-gray-700 text-gray-200 transition-all ${
                      isRegeneratingTitles
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:bg-gray-700 hover:text-purple-400 cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingTitles ? 'animate-spin text-purple-400' : ''}`} />
                    <span>
                      {isRegeneratingTitles
                        ? translations[lang]['regeneratingBtn']
                        : translations[lang]['regenerateBtn']}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        videoTitles.map((t) => t.title).join('\n'),
                        'titles'
                      )
                    }
                    className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-emerald-400 transition-all cursor-pointer"
                  >
                    {copiedSection === 'titles' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">{translations[lang]['copiedText']}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{translations[lang]['copyTitlesBtn']}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {videoTitles.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-lg bg-[#0d0f14] border border-gray-800/80 hover:border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <span className="text-sm font-medium text-gray-200 flex-1 break-words">
                      {item.title}
                    </span>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-gray-800/60 sm:border-0">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        {translations[lang]['viralScore']}: {item.score}%
                      </span>
                      <button
                        type="button"
                        aria-label={`${translations[lang]['copyBtn']} ${index + 1}`}
                        onClick={() => copyToClipboard(item.title, `title-${index}`)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-emerald-400 transition-all cursor-pointer"
                      >
                        {copiedSection === `title-${index}` ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* 2. YouTube Shorts Titles Section */}
            {genShorts && shortsTitles.length > 0 && (
            <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-400 shrink-0" />
                  <h3 className="text-base font-semibold text-gray-200">
                    {translations[lang]['shortsHeader']}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRegenerateShorts}
                    disabled={isRegeneratingShorts}
                    className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gray-800 border border-gray-700 text-gray-200 transition-all ${
                      isRegeneratingShorts
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:bg-gray-700 hover:text-purple-400 cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingShorts ? 'animate-spin text-purple-400' : ''}`} />
                    <span>
                      {isRegeneratingShorts
                        ? translations[lang]['regeneratingBtn']
                        : translations[lang]['regenerateBtn']}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        shortsTitles.join('\n'),
                        'shortsTitles'
                      )
                    }
                    className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-emerald-400 transition-all cursor-pointer"
                  >
                    {copiedSection === 'shortsTitles' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">{translations[lang]['copiedText']}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{translations[lang]['copyShortsBtn']}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {shortsTitles.map((title, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-lg bg-[#0d0f14] border border-gray-800/80 hover:border-purple-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <span className="text-sm font-medium text-gray-200 flex-1 break-words">
                      {title}
                    </span>
                    <button
                      type="button"
                      aria-label={`${translations[lang]['copyBtn']} ${index + 1}`}
                      onClick={() => copyToClipboard(title, `short-${index}`)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-emerald-400 transition-all cursor-pointer shrink-0"
                    >
                      {copiedSection === `short-${index}` ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* 3. Description Section */}
            {genDescription && Boolean(description) && (
            <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                  <h3 className="text-base font-semibold text-gray-200">
                    {translations[lang]['descHeader']}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRegenerateDescription}
                    disabled={isRegeneratingDescription}
                    className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gray-800 border border-gray-700 text-gray-200 transition-all ${
                      isRegeneratingDescription
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:bg-gray-700 hover:text-purple-400 cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingDescription ? 'animate-spin text-purple-400' : ''}`} />
                    <span>
                      {isRegeneratingDescription
                        ? translations[lang]['regeneratingBtn']
                        : translations[lang]['regenerateBtn']}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(description, 'description')}
                    className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-emerald-400 transition-all cursor-pointer"
                  >
                    {copiedSection === 'description' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">{translations[lang]['copiedText']}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{translations[lang]['copyDescBtn']}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0d0f14] border border-gray-800 max-h-[350px] overflow-y-auto">
                <pre className="text-xs sm:text-sm font-mono text-gray-200 whitespace-pre-wrap font-normal leading-relaxed break-words">
                  {description}
                </pre>
              </div>
            </div>
            )}
          </div>
        )}
      </main>

      {/* Phase 37: Sticky Owner Signature / Copyright Watermark Footer */}
      <footer className="sticky bottom-0 z-30 w-full bg-[#08090d]/95 dark:bg-[#08090d]/95 backdrop-blur-md border-t border-gray-800/90 py-2.5 px-4 text-center text-xs text-gray-400 shadow-lg mt-auto select-none">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
          <span>© 2026 ViralForge.</span>
          <span>{translations[lang]['footerDevelopedBy']}</span>
          <a
            href="https://www.youtube.com/@IZEROXP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            iZreoXP
          </a>
          <span>.</span>
        </div>
      </footer>

      {/* Global Toast Notification (responsive max width 90vw on mobile, elevated above sticky footer) */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out max-w-[90vw] w-max"
        >
          <div
            className={`max-w-[90vw] px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-2.5 text-xs sm:text-sm font-medium break-words ${
              toastType === 'error'
                ? 'bg-red-950/95 border-red-500/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : toastType === 'info'
                ? 'bg-[#151922]/95 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-[#151922]/95 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {toastType === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : toastType === 'info' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="break-words">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-[#151922] border border-gray-800 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <div className="flex items-center gap-2.5 min-w-0 ltr:pr-2 rtl:pl-2">
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)] shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 id="settings-modal-title" className="text-base font-semibold text-gray-100 truncate">
                    {translations[lang]['settingsTitle']}
                  </h2>
                  <p className="text-xs text-gray-400 truncate">
                    {translations[lang]['settingsSubtitle']}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close Settings"
                onClick={() => setIsSettingsOpen(false)}
                className="min-h-[44px] min-w-[44px] p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Gemini API Key */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="gemini-api-key-input" className="block text-sm font-medium text-gray-300">
                    {translations[lang]['apiKeyLabel']}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePasteKey('gemini')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/90 hover:bg-gray-700 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 shadow-sm transition-all cursor-pointer"
                      title={translations[lang]['pasteKeyBtn']}
                    >
                      <Clipboard className="w-3 h-3 text-purple-400" />
                      <span>{translations[lang]['pasteKeyBtn']}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearSingleKey('gemini')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-red-200 border border-red-500/30 transition-all cursor-pointer"
                      title={translations[lang]['clearKeyBtn']}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>{translations[lang]['clearKeyBtn']}</span>
                    </button>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/90 hover:bg-gray-700 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 shadow-sm transition-all cursor-pointer"
                    >
                      <span>{translations[lang]['getKeyBtn']}</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="gemini-api-key-input"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={translations[lang]['apiKeyPlaceholder']}
                    className="w-full min-h-[44px] px-4 py-2.5 ltr:pr-12 rtl:pl-12 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-sm transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="min-h-[44px] min-w-[44px] absolute ltr:right-1 rtl:left-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="openai-api-key-input" className="block text-sm font-medium text-gray-300">
                    {translations[lang]['openaiApiKeyLabel']}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePasteKey('openai')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/90 hover:bg-gray-700 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 shadow-sm transition-all cursor-pointer"
                      title={translations[lang]['pasteKeyBtn']}
                    >
                      <Clipboard className="w-3 h-3 text-purple-400" />
                      <span>{translations[lang]['pasteKeyBtn']}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearSingleKey('openai')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-red-200 border border-red-500/30 transition-all cursor-pointer"
                      title={translations[lang]['clearKeyBtn']}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>{translations[lang]['clearKeyBtn']}</span>
                    </button>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/90 hover:bg-gray-700 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 shadow-sm transition-all cursor-pointer"
                    >
                      <span>{translations[lang]['getKeyBtn']}</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="openai-api-key-input"
                    type={showOpenaiApiKey ? 'text' : 'password'}
                    value={openaiApiKeyInput}
                    onChange={(e) => setOpenaiApiKeyInput(e.target.value)}
                    placeholder={translations[lang]['openaiApiKeyPlaceholder']}
                    className="w-full min-h-[44px] px-4 py-2.5 ltr:pr-12 rtl:pl-12 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-sm transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showOpenaiApiKey ? 'Hide OpenAI API key' : 'Show OpenAI API key'}
                    onClick={() => setShowOpenaiApiKey(!showOpenaiApiKey)}
                    className="min-h-[44px] min-w-[44px] absolute ltr:right-1 rtl:left-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showOpenaiApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Groq API Key */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="groq-api-key-input" className="block text-sm font-medium text-gray-300">
                    {translations[lang]['groqApiKeyLabel']}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePasteKey('groq')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/90 hover:bg-gray-700 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 shadow-sm transition-all cursor-pointer"
                      title={translations[lang]['pasteKeyBtn']}
                    >
                      <Clipboard className="w-3 h-3 text-purple-400" />
                      <span>{translations[lang]['pasteKeyBtn']}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearSingleKey('groq')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-red-200 border border-red-500/30 transition-all cursor-pointer"
                      title={translations[lang]['clearKeyBtn']}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>{translations[lang]['clearKeyBtn']}</span>
                    </button>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/90 hover:bg-gray-700 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 shadow-sm transition-all cursor-pointer"
                    >
                      <span>{translations[lang]['getKeyBtn']}</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="groq-api-key-input"
                    type={showGroqApiKey ? 'text' : 'password'}
                    value={groqApiKeyInput}
                    onChange={(e) => setGroqApiKeyInput(e.target.value)}
                    placeholder={translations[lang]['groqApiKeyPlaceholder']}
                    className="w-full min-h-[44px] px-4 py-2.5 ltr:pr-12 rtl:pl-12 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-sm transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showGroqApiKey ? 'Hide Groq API key' : 'Show Groq API key'}
                    onClick={() => setShowGroqApiKey(!showGroqApiKey)}
                    className="min-h-[44px] min-w-[44px] absolute ltr:right-1 rtl:left-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showGroqApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenRouter API Key */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="openrouter-api-key-input" className="block text-sm font-medium text-gray-300">
                    {translations[lang]['openrouterApiKeyLabel']}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePasteKey('openrouter')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/90 hover:bg-gray-700 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 shadow-sm transition-all cursor-pointer"
                      title={translations[lang]['pasteKeyBtn']}
                    >
                      <Clipboard className="w-3 h-3 text-purple-400" />
                      <span>{translations[lang]['pasteKeyBtn']}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearSingleKey('openrouter')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-red-200 border border-red-500/30 transition-all cursor-pointer"
                      title={translations[lang]['clearKeyBtn']}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>{translations[lang]['clearKeyBtn']}</span>
                    </button>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800/90 hover:bg-gray-700 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 shadow-sm transition-all cursor-pointer"
                    >
                      <span>{translations[lang]['getKeyBtn']}</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="openrouter-api-key-input"
                    type={showOpenRouterApiKey ? 'text' : 'password'}
                    value={openRouterApiKeyInput}
                    onChange={(e) => setOpenRouterApiKeyInput(e.target.value)}
                    placeholder={translations[lang]['openrouterApiKeyPlaceholder']}
                    className="w-full min-h-[44px] px-4 py-2.5 ltr:pr-12 rtl:pl-12 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-sm transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showOpenRouterApiKey ? 'Hide OpenRouter API key' : 'Show OpenRouter API key'}
                    onClick={() => setShowOpenRouterApiKey(!showOpenRouterApiKey)}
                    className="min-h-[44px] min-w-[44px] absolute ltr:right-1 rtl:left-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showOpenRouterApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-amber-400/90 bg-amber-950/30 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2 break-words">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{translations[lang]['warningText']}</span>
              </p>

              {/* Provider Selection Section */}
              <div className="pt-3 border-t border-gray-800/80 space-y-3">
                <h3 className="text-sm font-semibold text-gray-200">
                  {translations[lang]['providerSectionTitle']}
                </h3>

                {/* Text Provider Dropdown */}
                <div>
                  <label htmlFor="text-provider-select" className="block text-xs font-medium text-gray-300 mb-1.5">
                    {translations[lang]['textProviderLabel']}
                  </label>
                  <select
                    id="text-provider-select"
                    value={textProviderInput}
                    onChange={(e) => setTextProviderInput(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#0d0f14] border border-gray-700 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-sans transition-all cursor-pointer"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="chatgpt">ChatGPT</option>
                    <option value="groq">Groq</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 gap-2">
              <button
                type="button"
                onClick={handleClearApiKey}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 hover:text-red-200 transition-all cursor-pointer flex items-center justify-center"
              >
                {translations[lang]['clearBtn']}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center"
                >
                  {translations[lang]['cancelBtn']}
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
                >
                  {translations[lang]['saveBtn']}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
