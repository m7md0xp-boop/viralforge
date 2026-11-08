// English interface text. Must have exactly the same keys as ar.js (tests/i18n.test.js checks it).
export default {
  common: {
    appTitle: 'ViralForge',
    copy: 'Copy',
    copied: 'Copied!',
    copyAll: 'Copy all',
    regenerate: 'Regenerate',
    regenerating: 'Regenerating...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    optional: 'optional',
    paste: 'Paste',
    exportAll: 'Export all',
    exportDone: 'Export successful',
    exportFailed: 'Export failed',
    copyFailed: 'Copy failed — select the text manually',
    clipboardEmpty: 'Clipboard is empty.',
    clipboardFailed: 'Could not read the clipboard. Copy the text and try again.',
    outputPlaceholder: 'Output will appear here',
    outputSummary: 'Done. Review the results and copy what you need.'
  },
  header: {
    create: 'Create',
    dashboard: 'Dashboard',
    myChannel: 'My channel',
    addChannel: 'Add your channel',
    switchUser: 'Switch user',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    toggleLanguage: 'Switch the language to Arabic',
    languageButton: 'ع',
    settings: 'Settings'
  },
  footer: {
    openSource: 'Open-source project'
  },
  studios: {
    ariaLabel: 'Studios',
    video: {
      tab: 'Long video',
      title: 'Long video studio',
      blurb: 'YouTube titles, a description with your template, and a thumbnail',
      detailsLabel: 'Episode / part',
      detailsPlaceholder: 'e.g. 01, Part 5'
    },
    short: {
      tab: 'Shorts & Reels',
      title: 'Shorts studio',
      blurb: 'A Shorts title, a short caption with per-platform counters, and hashtags',
      detailsLabel: 'What happens in the clip? (optional)',
      detailsPlaceholder: 'e.g. I won with one hit in the last second'
    },
    live: {
      tab: 'Live stream',
      title: 'Live studio',
      blurb: 'Stream titles with per-platform counters, plus a category and tags for Twitch and Kick',
      detailsLabel: 'Stream idea (optional)',
      detailsPlaceholder: 'e.g. Beat the game without dying'
    }
  },
  input: {
    quickTab: 'Quick Mode',
    chatTab: 'Chat Studio',
    gameLabel: 'Game name',
    gamePlaceholder: 'e.g. Elden Ring, Cyberpunk 2077',
    chatPlaceholder: 'Write your request here... (e.g. a late-night Minecraft horror stream, survive until dawn)',
    chatNote: 'Note: your request is used as the topic in the open studio, for the selected platforms.',
    writeRequestFirst: 'Write your request first.',
    voiceStart: 'Voice input',
    voiceStop: 'Stop voice recording',
    generate: 'Generate Metadata',
    generating: 'Generating Metadata...'
  },
  platforms: {
    title: 'Platforms',
    titleLimit: 'title',
    captionLimit: 'caption',
    hint: 'Content is written for the strictest limits of the selected platforms; each result shows a counter per platform.'
  },
  template: {
    title: 'Description Template',
    placeholders: 'Placeholders:',
    edit: 'Edit Template',
    save: 'Save Template',
    saved: 'Saved',
    readOnly: 'Read Only',
    placeholder: 'Enter a YouTube description template...',
    presets: 'Pre-made Templates',
    presetPlaceholder: 'Choose a pre-made template...',
    presetLoaded: 'Template applied successfully',
    usePreset: 'Use template',
    channelNone: 'No channel added yet',
    channelLinksHint: 'Add your links to fill them into descriptions',
    editChannel: 'Edit channel'
  },
  presets: {
    'gaming-challenge-ar': 'Gaming challenges (Arabic)',
    'gameplay-walkthrough': 'Gameplay & Walkthrough (Arabic)',
    'default-template': 'Default English Template'
  },
  image: {
    uploadTitle: 'Image Upload',
    maxSize: '(Max 10MB)',
    dragDrop: 'Drag & drop your photo or a gameplay screenshot here',
    browse: 'or click to browse from your device (JPG, PNG, WebP up to 10MB)',
    remove: 'Remove image',
    noImage: 'No image uploaded. The thumbnail prompt will describe a generic gamer.',
    onlyImages: 'Only image files (image/*) are accepted.',
    tooBig: 'File exceeds 10MB. Please choose a smaller image.',
    previewAlt: 'Uploaded image preview'
  },
  options: {
    title: 'Generation Options',
    reset: 'Restore defaults',
    resetDone: 'Generation options restored to defaults',
    titles: 'Generate Titles',
    titlesNote: 'Generates 3 catchy video titles based on the game name.',
    description: 'Generate Description',
    descriptionNote: 'Generates a full video description (uses the template when enabled).',
    thumbnails: 'Generate Thumbnails',
    thumbnailsNote: 'Prepares a thumbnail prompt you can generate here or in Gemini and ChatGPT.',
    customTemplate: 'Use Custom Template',
    customTemplateNote: 'When on, the description is built from the template above. When off, the AI writes a free-form description.',
    nothingSelected: 'Turn on at least one option (titles, description or thumbnail).'
  },
  video: {
    titlesHeader: 'YouTube Titles',
    copyTitles: 'Copy Titles',
    viralScore: 'Viral Score',
    descriptionHeader: 'Description',
    copyDescription: 'Copy Description',
    thumbTitle: 'Thumbnail Image Prompt (Editable)',
    thumbPlaceholder: 'The thumbnail prompt will appear here after generating...',
    imageProvider: 'Image provider:',
    generateImage: 'Generate image',
    generatingImage: 'Generating…',
    downloadImage: 'Download image',
    generatedAlt: 'Generated image',
    imageGenerated: 'Image generated.',
    refWarning: 'This provider does not use your reference photo, so your face will not appear.',
    refNotSupported: '{provider} does not support your reference photo. Generating without it.',
    copyOpenGemini: 'Copy & Open Gemini',
    copyOpenChatGpt: 'Copy & Open ChatGPT',
    geminiCopied: 'Prompt copied! Upload your image in Gemini and paste it.',
    chatGptCopied: 'Prompt copied! Upload your image in ChatGPT and paste it.'
  },
  shorts: {
    titles: 'YouTube Shorts titles',
    noTitle: 'TikTok, Reels and X have no title field. Select YouTube Shorts to generate a title.',
    caption: 'Caption',
    hashtags: 'hashtags'
  },
  live: {
    titles: 'Stream titles',
    category: 'Category',
    tags: 'Tags',
    copyTags: 'Copy tags',
    tagRule: 'Up to {max} tags, {len} characters each, letters and digits only',
    metaTitle: '{name} category & tags',
    overLimit: 'Over the limit'
  },
  settings: {
    title: 'AI Provider Settings',
    subtitle: 'Pick a text provider and an image provider, then add your keys',
    textProvider: 'Text provider',
    imageProvider: 'Image provider',
    keyLabel: '{name} API key',
    getKey: 'Get a {name} key',
    showKey: 'Show API key',
    hideKey: 'Hide API key',
    clearKey: 'Clear Key',
    keyCleared: 'API key cleared successfully',
    keysSaved: 'API keys saved!',
    keySaveFailed: 'Could not save the key:',
    keyRequired: 'Add your {provider} API key in Settings first.',
    usageHint: 'Limits change over time. Check the provider pricing page.',
    imageRefHint: 'This provider does not use your reference photo, so the face will be generic.',
    warning: 'The desktop app stores keys encrypted on your computer. The browser version keeps them in this browser only, so do not use it on a shared computer.'
  },
  usage: {
    free: 'Fully free',
    'free-limit': 'Free with a usage limit',
    'free-then-paid': 'Free, then paid',
    paid: 'Paid'
  },
  onboarding: {
    welcomeTitle: 'Welcome to ViralForge',
    welcomeText: 'Tell us about your channel once. We use it to fill your links into descriptions, and it stays on this device only.',
    editTitle: 'My channel',
    editText: 'These values fill template placeholders such as {channel_link} and {discord_link}.',
    channelName: 'Channel name',
    channelNamePlaceholder: 'e.g. My Gaming Channel',
    channelUrl: 'Channel link',
    linktreeUrl: 'All your links (Linktree or similar)',
    discordUrl: 'Discord server link',
    style: 'Writing style',
    invalidUrl: 'This link is not valid. Use a link that starts with https://',
    nameRequired: 'Enter your channel name.',
    start: 'Get started',
    skip: 'Skip for now'
  },
  styles: {
    energetic: 'Energetic',
    funny: 'Funny',
    calm: 'Calm',
    informative: 'Informative'
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Local stats for this user only.',
    clear: 'Clear',
    clearConfirm: 'Clear this user’s usage history?',
    total: 'Total generations',
    withDescription: 'Results with a description',
    platformsUsed: 'Platforms used',
    topPlatforms: 'Most-used platforms',
    byType: 'By studio',
    recent: 'Recent generations',
    empty: 'No generations yet. Create your first one.',
    untitled: 'Untitled'
  },
  picker: {
    subtitle: 'Choose a workspace. Each user has their own keys and settings on this device.',
    newUser: 'New user',
    newUserPlaceholder: 'e.g. My Gaming Channel',
    create: 'Create'
  },
  voice: {
    notSupported: 'This browser does not support voice input.',
    notAllowed: 'Microphone access was blocked. Allow it in the browser settings.',
    noSpeech: 'No speech was heard. Try again.',
    audioCapture: 'No microphone was found.',
    network: 'The speech service is not reachable. Check your connection.'
  },
  errors: {
    unknown: 'An unknown error occurred.',
    timeout: 'The AI request timed out ({seconds}s). Try again.',
    invalidKey: '{provider} API key is invalid or not allowed.',
    noCredit: '{provider}: insufficient balance or credits.',
    rateLimited: '{provider}: quota exceeded or rate limited. Try again later.',
    generic: '{provider}: {message}',
    network: '{provider}: connection error ({status})',
    imageTimeout: '{provider}: the image request timed out ({seconds}s). Try again.',
    imageBilling: '{provider}: free quota or credit used up, or billing is required.'
  }
};
