import { useState, useEffect, useRef } from 'react';
import {
  Check,
  AlertCircle
} from 'lucide-react';

import { translations } from './i18n/translations';
import { STORAGE_KEY, DEFAULT_TEMPLATE, PRESET_TEMPLATES } from './config/templates';
import { USER_CONFIG } from './config/userConfig';
import { safeGetLocalStorage } from './utils/storage';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import InputCard from './components/InputCard';
import { loadContentPlan, buildPlanRules, strictestLimits } from './config/platforms';
import OutputArea from './components/OutputArea';
import { setSecret, hasDesktopSecrets, revealSecret } from './services/secrets';
import { getActiveProviderId, setActiveProviderId } from './services/ai';
import { getProvider } from './config/aiProviders';
import { getCurrentProfile, openProfilePicker } from './services/profiles';
import Dashboard from './components/Dashboard';
import { useGeneration } from './hooks/useGeneration';

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
  const [contentPlan, setContentPlan] = useState(() => loadContentPlan());
  const contentType = contentPlan.contentType;
  const selectedPlatforms = contentPlan.platforms;
  // Each section (long video / short / live) keeps its own output while the user switches tabs
  const sectionCache = useRef({});
  const setContentType = (type) => {
    if (type === contentType) return;
    sectionCache.current[contentType] = { videoTitles, shortsTitles, description, imagePrompt };
    const saved = sectionCache.current[type] || { videoTitles: [], shortsTitles: [], description: '', imagePrompt: '' };
    setVideoTitles(saved.videoTitles);
    setShortsTitles(saved.shortsTitles);
    setDescription(saved.description);
    setImagePrompt(saved.imagePrompt);
    setContentPlan((prev) => ({ ...prev, contentType: type }));
  };
  const setSelectedPlatforms = (platforms) => setContentPlan((prev) => ({ ...prev, platforms }));
  const planRules = buildPlanRules(selectedPlatforms);
  const limits = strictestLimits(selectedPlatforms);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);

  // Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [providerInput, setProviderInput] = useState(() => getActiveProviderId());
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);

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

  useEffect(() => {
    try {
      localStorage.setItem('content_plan', JSON.stringify(contentPlan));
    } catch {}
  }, [contentPlan]);

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

  const handleClearSingleKey = (providerId) => {
    setSecret(getProvider(providerId).keyName, '');
    if (providerId === providerInput) setKeyInput('');
    showToast(translations[lang]['keyClearedSuccess'], 'success');
  };

  // Phase 35: Read from clipboard and paste into API key field

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

  const [view, setView] = useState('create');
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    getCurrentProfile().then(setProfile);
  }, []);

  // Loads the saved key for the chosen provider into the field, so it stays visible
  const changeProviderInput = async (id) => {
    setProviderInput(id);
    setKeyInput(await revealSecret(getProvider(id).keyName));
    setShowKey(false);
  };

  const openSettings = async () => {
    const id = getActiveProviderId();
    setProviderInput(id);
    setKeyInput(await revealSecret(getProvider(id).keyName));
    setShowKey(false);
    setIsSettingsOpen(true);
  };

  // Desktop: an empty field keeps the saved key. Browser: an empty field clears it (old behaviour).

  const handleSaveApiKey = () => {
    const provider = getProvider(providerInput);
    const value = keyInput.trim();
    // Desktop: an empty field keeps the saved key (use Clear to remove it). Browser: empty clears it.
    if (value || !hasDesktopSecrets()) setSecret(provider.keyName, value);
    setActiveProviderId(providerInput);
    showToast(t('toastApiKeySaved'), 'success');
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

  const {
    handleGenerationError,
    handleGenerate,
    handleRegenerateTitles,
    handleRegenerateShorts,
    handleRegenerateDescription,
    handleExportAll,
    copyToClipboard,
    handleCopyAndOpenGemini,
    handleCopyAndOpenChatGPT
  } = useGeneration({
    section: contentType,
    selectedPlatforms,
    gameName,
    episode,
    template,
    applyChannelPlaceholders,
    activeTab,
    chatPrompt,
    videoTitles,
    showToast,
    genTitles,
    genShorts,
    genDescription,
    genThumbnails,
    setVideoTitles,
    setShortsTitles,
    setDescription,
    setImagePrompt,
    t,
    setIsLoading,
    lang,
    useCustomTemplate,
    planRules,
    uiHooks,
    setIsRegeneratingTitles,
    description,
    setIsRegeneratingShorts,
    setIsRegeneratingDescription,
    shortsTitles,
    imagePrompt,
    setCopiedSection
  });

  const hasGenerated = videoTitles.length > 0 || shortsTitles.length > 0 || Boolean(description) || Boolean(imagePrompt);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${lang === 'ar' ? 'font-arabic' : 'font-english'} min-h-screen bg-[#0d0f14] dark:bg-[#0d0f14] text-gray-100 dark:text-gray-100 flex flex-col relative w-full overflow-x-hidden transition-colors duration-200`}
    >
      <Header lang={lang} theme={theme} toggleTheme={toggleTheme} setLang={setLang} openSettings={openSettings} view={view} setView={setView} profileName={profile?.name} onSwitchUser={openProfilePicker} />

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 pb-16 sm:pb-20">
        {view === 'dashboard' && <Dashboard lang={lang} />}
        {view !== 'dashboard' && <InputCard showToast={showToast} setActiveTab={setActiveTab} activeTab={activeTab} lang={lang} gameName={gameName} setGameName={setGameName} episode={episode} setEpisode={setEpisode} chatPrompt={chatPrompt} setChatPrompt={setChatPrompt} isRecording={isRecording} handleToggleVoiceInput={handleToggleVoiceInput} contentType={contentType} setContentType={setContentType} selectedPlatforms={selectedPlatforms} setSelectedPlatforms={setSelectedPlatforms} handleGenerate={handleGenerate} isLoading={isLoading} saveStatus={saveStatus} isEditing={isEditing} handleSaveClick={handleSaveClick} handleToggleEdit={handleToggleEdit} handleSelectPresetTemplate={handleSelectPresetTemplate} channelName={channelName} handleChannelNameChange={handleChannelNameChange} channelLink={channelLink} handleChannelLinkChange={handleChannelLinkChange} template={template} setTemplate={setTemplate} fileInputRef={fileInputRef} handleFileChange={handleFileChange} handleDragOver={handleDragOver} handleDragEnter={handleDragEnter} handleDragLeave={handleDragLeave} handleDrop={handleDrop} uploadedImage={uploadedImage} isDragging={isDragging} imageDetails={imageDetails} handleRemoveImage={handleRemoveImage} imageError={imageError} handleResetGenerationOptions={handleResetGenerationOptions} genTitles={genTitles} setGenTitles={setGenTitles} genShorts={genShorts} setGenShorts={setGenShorts} genDescription={genDescription} setGenDescription={setGenDescription} genThumbnails={genThumbnails} setGenThumbnails={setGenThumbnails} useCustomTemplate={useCustomTemplate} setUseCustomTemplate={setUseCustomTemplate} />}
        {view !== 'dashboard' && <OutputArea section={contentType} limits={limits} hasGenerated={hasGenerated} lang={lang} handleExportAll={handleExportAll} genThumbnails={genThumbnails} imagePrompt={imagePrompt} setImagePrompt={setImagePrompt} handleCopyAndOpenGemini={handleCopyAndOpenGemini} handleCopyAndOpenChatGPT={handleCopyAndOpenChatGPT} genTitles={genTitles} videoTitles={videoTitles} handleRegenerateTitles={handleRegenerateTitles} isRegeneratingTitles={isRegeneratingTitles} copyToClipboard={copyToClipboard} copiedSection={copiedSection} genShorts={genShorts} shortsTitles={shortsTitles} handleRegenerateShorts={handleRegenerateShorts} isRegeneratingShorts={isRegeneratingShorts} genDescription={genDescription} description={description} handleRegenerateDescription={handleRegenerateDescription} isRegeneratingDescription={isRegeneratingDescription} />}
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

      <SettingsModal isSettingsOpen={isSettingsOpen} handleBackdropClick={handleBackdropClick} lang={lang} setIsSettingsOpen={setIsSettingsOpen} providerInput={providerInput} setProviderInput={changeProviderInput} keyInput={keyInput} setKeyInput={setKeyInput} showKey={showKey} setShowKey={setShowKey} showToast={showToast} handleClearSingleKey={handleClearSingleKey} handleSaveApiKey={handleSaveApiKey} />
    </div>
  );
}
