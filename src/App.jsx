import { useState, useEffect, useRef } from 'react';
import {
  Check,
  AlertCircle
} from 'lucide-react';

import { translations } from './i18n/translations';
import { STORAGE_KEY, DEFAULT_TEMPLATE, PRESET_TEMPLATES } from './config/templates';
import { safeGetLocalStorage } from './utils/storage';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import InputCard from './components/InputCard';
import { loadContentPlan, buildPlanRules, strictestLimits } from './config/platforms';
import OutputArea from './components/OutputArea';
import { setSecret, hasDesktopSecrets, revealSecret } from './services/secrets';
import { getActiveProviderId, setActiveProviderId } from './services/ai';
import { getActiveImageProviderId, setActiveImageProviderId } from './services/imageGeneration';
import { getProvider, getImageProvider, findAnyProvider } from './config/aiProviders';
import { getCurrentProfile, openProfilePicker } from './services/profiles';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import { useGeneration } from './hooks/useGeneration';
import { loadChannelProfile, saveChannelProfile } from './services/channelProfile';

const LANG_KEY = 'ui_lang';
const loadLang = () => {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
};
// Generation toggles start on. "Restore defaults" brings them back here.
const DEFAULT_OPTIONS = { titles: true, description: true, thumbnails: true, customTemplate: true };

// Removes lines that point at the developer's own channel, saved by older versions in every user's template
const stripLegacyLinks = (text) =>
  typeof text === 'string' ? text.split('\n').filter((l) => !/youtube\.com\/@izeroxp/i.test(l)).join('\n') : text;

export default function App() {
  const [lang, setLang] = useState(loadLang);
  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {}
  }, [lang]);
  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  // Dark/Light Mode Theme Toggle
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

  // Tabbed Interface (Quick Mode vs. Chat Studio)
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'chat'
  const [chatPrompt, setChatPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false); // Phase 35: Voice recording state

  // Clean Separate States
  const [gameName, setGameName] = useState('');
  const [episode, setEpisode] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null); // string | null (objectURL or data URL)
  const [uploadedImageBase64, setUploadedImageBase64] = useState(null); // string | null
  const [videoTitles, setVideoTitles] = useState([]); // array of { title: string, score: number }
  const [shortsTitles, setShortsTitles] = useState([]); // array of string
  const [description, setDescription] = useState(''); // string
  const [imagePrompt, setImagePrompt] = useState(''); // Phase 33: Editable image prompt
  const [toastMessage, setToastMessage] = useState(null); // string | null

  // Supporting UI states
  const [imageDetails, setImageDetails] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [toastType, setToastType] = useState('success');
  const [copiedSection, setCopiedSection] = useState(null);

  // Generation toggles (long videos)
  const [genTitles, setGenTitles] = useState(DEFAULT_OPTIONS.titles);
  const [genDescription, setGenDescription] = useState(DEFAULT_OPTIONS.description);
  const [genThumbnails, setGenThumbnails] = useState(DEFAULT_OPTIONS.thumbnails);
  const [useCustomTemplate, setUseCustomTemplate] = useState(DEFAULT_OPTIONS.customTemplate);

  // Template Manager state
  const [template, setTemplate] = useState(() => stripLegacyLinks(safeGetLocalStorage(STORAGE_KEY, DEFAULT_TEMPLATE)));
  // The user's channel (name, links, style). A new user sees the welcome screen first.
  const [channelProfile, setChannelProfile] = useState(loadChannelProfile);
  const [channelEditorOpen, setChannelEditorOpen] = useState(false);
  const handleSaveChannelProfile = (values) => {
    setChannelProfile(saveChannelProfile(values));
    setChannelEditorOpen(false);
  };
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
  const [imageProviderInput, setImageProviderInput] = useState(() => getActiveImageProviderId());
  const [imageKeyInput, setImageKeyInput] = useState('');
  const [showImageKey, setShowImageKey] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null); // { src, mime } | null
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Loading state for Gemini API
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingTitles, setIsRegeneratingTitles] = useState(false);
  const [isRegeneratingShorts, setIsRegeneratingShorts] = useState(false);
  const [isRegeneratingDescription, setIsRegeneratingDescription] = useState(false);
  const fileInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const uploadedImageRef = useRef(uploadedImage);
  const speechRecognitionRef = useRef(null);

  // Keep uploadedImageRef in sync
  useEffect(() => {
    uploadedImageRef.current = uploadedImage;
  }, [uploadedImage]);

  // Saves the cleaned template once, so the developer links removed above do not come back
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null && stripLegacyLinks(saved) !== saved) localStorage.setItem(STORAGE_KEY, stripLegacyLinks(saved));
    } catch {}
    return () => {
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

  const handleClearSingleKey = async (providerId) => {
    const keyName = findAnyProvider(providerId).keyName;
    try {
      await setSecret(keyName, '');
    } catch (err) {
      showToast(`${t('toastKeySaveFailed')} ${String(err?.message || err)}`, 'error');
      return;
    }
    // A shared key (Gemini) is cleared in both fields
    if (getProvider(providerInput).keyName === keyName) setKeyInput('');
    if (getImageProvider(imageProviderInput).keyName === keyName) setImageKeyInput('');
    showToast(translations[lang]['keyClearedSuccess'], 'success');
  };


  // Voice Input via Web Speech API in Chat Studio
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
    setGenTitles(DEFAULT_OPTIONS.titles);
    setGenDescription(DEFAULT_OPTIONS.description);
    setGenThumbnails(DEFAULT_OPTIONS.thumbnails);
    setUseCustomTemplate(DEFAULT_OPTIONS.customTemplate);
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

  const changeImageProviderInput = async (id) => {
    setImageProviderInput(id);
    setImageKeyInput(await revealSecret(getImageProvider(id).keyName));
    setShowImageKey(false);
  };

  const openSettings = async () => {
    const id = getActiveProviderId();
    const imageId = getActiveImageProviderId();
    setProviderInput(id);
    setKeyInput(await revealSecret(getProvider(id).keyName));
    setShowKey(false);
    setImageProviderInput(imageId);
    setImageKeyInput(await revealSecret(getImageProvider(imageId).keyName));
    setShowImageKey(false);
    setIsSettingsOpen(true);
  };

  // Desktop: an empty field keeps the saved key. Browser: an empty field clears it (old behaviour).

  const handleSaveApiKey = async () => {
    const provider = getProvider(providerInput);
    const imageProvider = getImageProvider(imageProviderInput);
    const value = keyInput.trim();
    try {
      // Desktop: an empty field keeps the saved key (use Clear to remove it). Browser: empty clears it.
      if (value || !hasDesktopSecrets()) await setSecret(provider.keyName, value);
      // Gemini text and Gemini image share one key: save it once, from the text field
      if (imageProvider.keyName !== provider.keyName) {
        const imageValue = imageKeyInput.trim();
        if (imageValue || !hasDesktopSecrets()) await setSecret(imageProvider.keyName, imageValue);
      }
    } catch (err) {
      // The desktop app refuses to store a key it cannot encrypt: keep the dialog open so nothing is lost
      showToast(`${t('toastKeySaveFailed')} ${String(err?.message || err)}`, 'error');
      return;
    }
    setActiveProviderId(providerInput);
    setActiveImageProviderId(imageProviderInput);
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
    handleCopyAndOpenChatGPT,
    handleGenerateImage
  } = useGeneration({
    section: contentType,
    selectedPlatforms,
    gameName,
    episode,
    limits,
    template,
    channelProfile,
    activeTab,
    chatPrompt,
    videoTitles,
    showToast,
    genTitles,
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
    setCopiedSection,
    uploadedImageBase64,
    setGeneratedImage,
    setIsGeneratingImage
  });

  const activeImageProvider = getImageProvider(getActiveImageProviderId());
  const referencePhotoAttached = Boolean(uploadedImageBase64);

  const hasGenerated = videoTitles.length > 0 || shortsTitles.length > 0 || Boolean(description) || Boolean(imagePrompt);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${lang === 'ar' ? 'font-arabic' : 'font-english'} min-h-screen bg-[#0d0f14] dark:bg-[#0d0f14] text-gray-100 dark:text-gray-100 flex flex-col relative w-full overflow-x-hidden transition-colors duration-200`}
    >
      <Header lang={lang} theme={theme} toggleTheme={toggleTheme} setLang={setLang} openSettings={openSettings} view={view} setView={setView} profileName={profile?.name} onSwitchUser={openProfilePicker} channelName={channelProfile.channelName} onEditChannel={() => setChannelEditorOpen(true)} />

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 pb-16 sm:pb-20">
        {view === 'dashboard' && <Dashboard lang={lang} />}
        {view !== 'dashboard' && <InputCard showToast={showToast} setActiveTab={setActiveTab} activeTab={activeTab} lang={lang} gameName={gameName} setGameName={setGameName} episode={episode} setEpisode={setEpisode} chatPrompt={chatPrompt} setChatPrompt={setChatPrompt} isRecording={isRecording} handleToggleVoiceInput={handleToggleVoiceInput} contentType={contentType} setContentType={setContentType} selectedPlatforms={selectedPlatforms} setSelectedPlatforms={setSelectedPlatforms} handleGenerate={handleGenerate} isLoading={isLoading} saveStatus={saveStatus} isEditing={isEditing} handleSaveClick={handleSaveClick} handleToggleEdit={handleToggleEdit} handleSelectPresetTemplate={handleSelectPresetTemplate} channelProfile={channelProfile} onEditChannel={() => setChannelEditorOpen(true)} template={template} setTemplate={setTemplate} fileInputRef={fileInputRef} handleFileChange={handleFileChange} handleDragOver={handleDragOver} handleDragEnter={handleDragEnter} handleDragLeave={handleDragLeave} handleDrop={handleDrop} uploadedImage={uploadedImage} isDragging={isDragging} imageDetails={imageDetails} handleRemoveImage={handleRemoveImage} imageError={imageError} handleResetGenerationOptions={handleResetGenerationOptions} genTitles={genTitles} setGenTitles={setGenTitles} genDescription={genDescription} setGenDescription={setGenDescription} genThumbnails={genThumbnails} setGenThumbnails={setGenThumbnails} useCustomTemplate={useCustomTemplate} setUseCustomTemplate={setUseCustomTemplate} />}
        {view !== 'dashboard' && <OutputArea section={contentType} limits={limits} hasGenerated={hasGenerated} lang={lang} handleExportAll={handleExportAll} genThumbnails={genThumbnails} imagePrompt={imagePrompt} setImagePrompt={setImagePrompt} handleCopyAndOpenGemini={handleCopyAndOpenGemini} handleCopyAndOpenChatGPT={handleCopyAndOpenChatGPT} generatedImage={generatedImage} isGeneratingImage={isGeneratingImage} handleGenerateImage={handleGenerateImage} imageProvider={activeImageProvider} referencePhotoAttached={referencePhotoAttached} genTitles={genTitles} videoTitles={videoTitles} handleRegenerateTitles={handleRegenerateTitles} isRegeneratingTitles={isRegeneratingTitles} copyToClipboard={copyToClipboard} copiedSection={copiedSection} shortsTitles={shortsTitles} handleRegenerateShorts={handleRegenerateShorts} isRegeneratingShorts={isRegeneratingShorts} genDescription={genDescription} description={description} handleRegenerateDescription={handleRegenerateDescription} isRegeneratingDescription={isRegeneratingDescription} />}
      </main>

      <footer className="sticky bottom-0 z-30 w-full bg-[#08090d]/95 dark:bg-[#08090d]/95 backdrop-blur-md border-t border-gray-800/90 py-2.5 px-4 text-center text-xs text-gray-400 shadow-lg mt-auto select-none">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
          <span>© 2026 ViralForge</span>
          <span>·</span>
          <span>{t('footerOpenSource')}</span>
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

      {(!channelProfile.onboarded || channelEditorOpen) && (
        <Onboarding
          lang={lang}
          mode={channelProfile.onboarded ? 'edit' : 'welcome'}
          initial={channelProfile}
          onSave={handleSaveChannelProfile}
          onClose={() => setChannelEditorOpen(false)}
        />
      )}

      <SettingsModal isSettingsOpen={isSettingsOpen} handleBackdropClick={handleBackdropClick} lang={lang} setIsSettingsOpen={setIsSettingsOpen} text={{ providerId: providerInput, onProvider: changeProviderInput, keyValue: keyInput, onKey: setKeyInput, show: showKey, onShow: setShowKey }} image={{ providerId: imageProviderInput, onProvider: changeImageProviderInput, keyValue: imageKeyInput, onKey: setImageKeyInput, show: showImageKey, onShow: setShowImageKey }} showToast={showToast} handleClearSingleKey={handleClearSingleKey} handleSaveApiKey={handleSaveApiKey} />
    </div>
  );
}
