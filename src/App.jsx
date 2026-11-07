import { useState, useEffect, useRef } from 'react';
import {
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
  Loader2,
  Download,
  SlidersHorizontal,
  Info,
  Zap,
  MessageSquare,
  Sparkles,
  Mic
} from 'lucide-react';

import { translations } from './i18n/translations';
import { STORAGE_KEY, DEFAULT_TEMPLATE, PRESET_TEMPLATES } from './config/templates';
import { YOUTUBE_TITLE_VARIANTS, SHORTS_TITLE_VARIANTS, DESCRIPTION_HOOKS } from './config/titleVariants';
import { USER_CONFIG } from './config/userConfig';
import { safeGetLocalStorage } from './utils/storage';
import ToggleSwitch from './components/ToggleSwitch';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import { getSecret, setSecret } from './services/secrets';
import { executeTextGeneration, getSpecificApiErrorMessage } from './services/ai';

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
    return safeGetLocalStorage('channel_name', USER_CONFIG.channelName);
  });
  const [channelLink, setChannelLink] = useState(() => {
    return safeGetLocalStorage('channel_link', USER_CONFIG.channelUrl);
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
        localStorage.setItem('channel_name', USER_CONFIG.channelName);
      } catch {}
    }
    if (localStorage.getItem('channel_link') === null) {
      try {
        localStorage.setItem('channel_link', USER_CONFIG.channelUrl);
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

  const uiHooks = { t, showToast };

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
    const cName = safeGetLocalStorage('channel_name', channelName || USER_CONFIG.channelName);
    const cLink = safeGetLocalStorage('channel_link', channelLink || USER_CONFIG.channelUrl);
    return text
      .replace(/{channel_name}/gi, cName)
      .replace(/{channel_link}/gi, cLink);
  };

  const handleClearSingleKey = (provider) => {
    try {
      if (provider === 'gemini') {
        setSecret('gemini_api_key', '');
        setApiKeyInput('');
      } else if (provider === 'openai') {
        setSecret('openai_api_key', '');
        setOpenaiApiKeyInput('');
      } else if (provider === 'groq') {
        setSecret('groq_api_key', '');
        setGroqApiKeyInput('');
      } else if (provider === 'openrouter') {
        setSecret('openrouter_api_key', '');
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
    const savedKey = getSecret('gemini_api_key');
    const savedOpenaiKey = getSecret('openai_api_key');
    const savedGroqKey = getSecret('groq_api_key');
    const savedOpenRouterKey = getSecret('openrouter_api_key');
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
      setSecret('gemini_api_key', apiKeyInput.trim());
      setSecret('openai_api_key', openaiApiKeyInput.trim());
      setSecret('groq_api_key', groqApiKeyInput.trim());
      setSecret('openrouter_api_key', openRouterApiKeyInput.trim());
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
      setSecret('gemini_api_key', '');
      setSecret('openai_api_key', '');
      setSecret('groq_api_key', '');
      setSecret('openrouter_api_key', '');
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
    const geminiKey = getSecret('gemini_api_key').trim();
    const openaiKey = getSecret('openai_api_key').trim();
    const groqKey = getSecret('groq_api_key').trim();

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

      const result = await executeTextGeneration(prompt, requestBody, uiHooks);
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
    const geminiKey = getSecret('gemini_api_key').trim();
    const openaiKey = getSecret('openai_api_key').trim();
    const groqKey = getSecret('groq_api_key').trim();

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

      const result = await executeTextGeneration(prompt, requestBody, uiHooks);
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
    const geminiKey = getSecret('gemini_api_key').trim();
    const openaiKey = getSecret('openai_api_key').trim();
    const groqKey = getSecret('groq_api_key').trim();

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

      const result = await executeTextGeneration(prompt, requestBody, uiHooks);
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
    const geminiKey = getSecret('gemini_api_key').trim();
    const openaiKey = getSecret('openai_api_key').trim();
    const groqKey = getSecret('groq_api_key').trim();

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

      const result = await executeTextGeneration(prompt, requestBody, uiHooks);
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
      <Header lang={lang} theme={theme} toggleTheme={toggleTheme} setLang={setLang} openSettings={openSettings} />

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
                placeholder={USER_CONFIG.channelName}
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
                placeholder={USER_CONFIG.channelUrl}
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
            href={USER_CONFIG.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            {USER_CONFIG.channelName}
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

      <SettingsModal isSettingsOpen={isSettingsOpen} handleBackdropClick={handleBackdropClick} lang={lang} setIsSettingsOpen={setIsSettingsOpen} handlePasteKey={handlePasteKey} handleClearSingleKey={handleClearSingleKey} showApiKey={showApiKey} apiKeyInput={apiKeyInput} setApiKeyInput={setApiKeyInput} setShowApiKey={setShowApiKey} showOpenaiApiKey={showOpenaiApiKey} openaiApiKeyInput={openaiApiKeyInput} setOpenaiApiKeyInput={setOpenaiApiKeyInput} setShowOpenaiApiKey={setShowOpenaiApiKey} showGroqApiKey={showGroqApiKey} groqApiKeyInput={groqApiKeyInput} setGroqApiKeyInput={setGroqApiKeyInput} setShowGroqApiKey={setShowGroqApiKey} showOpenRouterApiKey={showOpenRouterApiKey} openRouterApiKeyInput={openRouterApiKeyInput} setOpenRouterApiKeyInput={setOpenRouterApiKeyInput} setShowOpenRouterApiKey={setShowOpenRouterApiKey} textProviderInput={textProviderInput} setTextProviderInput={setTextProviderInput} handleClearApiKey={handleClearApiKey} handleSaveApiKey={handleSaveApiKey} />
    </div>
  );
}
