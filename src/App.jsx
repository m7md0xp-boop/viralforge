import { useCallback, useEffect, useState } from 'react';
import { useI18n } from './i18n/useI18n';
import { getImageProvider } from './config/aiProviders';
import { getActiveImageProviderId } from './services/imageGeneration';
import { getCurrentProfile, openProfilePicker } from './services/profiles';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useCopy } from './hooks/useCopy';
import { useStudio } from './hooks/useStudio';
import { useChannelProfile } from './hooks/useChannelProfile';
import { useReferenceImage } from './hooks/useReferenceImage';
import { useVoiceInput } from './hooks/useVoiceInput';
import { useTemplateManager } from './hooks/useTemplateManager';
import { useGenerationOptions } from './hooks/useGenerationOptions';
import { useProviderSettings } from './hooks/useProviderSettings';
import { useGeneration } from './hooks/useGeneration';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Toast from './components/layout/Toast';
import StudioTabs from './components/studio/StudioTabs';
import StudioInputCard from './components/studio/StudioInputCard';
import TemplateManager from './components/studio/TemplateManager';
import ReferenceImageCard from './components/studio/ReferenceImageCard';
import GenerationOptions from './components/studio/GenerationOptions';
import ResultsPanel from './components/results/ResultsPanel';
import Dashboard from './components/screens/Dashboard';
import Onboarding from './components/dialogs/Onboarding';
import SettingsModal from './components/dialogs/SettingsModal';

// The main window: wires the hooks (state and logic) to the components (layout).
export default function App() {
  const { t, lang, dir, isAr } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast } = useToast();
  const { copiedId, copy } = useCopy({ t, showToast });

  const [view, setView] = useState('create'); // 'create' | 'dashboard'
  const [profile, setProfile] = useState(null); // desktop app: the workspace of this window
  useEffect(() => {
    getCurrentProfile().then(setProfile);
  }, []);

  // Inputs
  const studio = useStudio();
  const [mode, setMode] = useState('quick'); // 'quick' | 'chat'
  const [gameName, setGameName] = useState('');
  const [chatPrompt, setChatPrompt] = useState('');
  const appendToChat = useCallback((text) => setChatPrompt((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text)), []);
  const voice = useVoiceInput({ lang, t, showToast, onText: appendToChat });

  // Long-video tools and settings
  const channel = useChannelProfile();
  const templateManager = useTemplateManager({ t, showToast });
  const generationOptions = useGenerationOptions({ t, showToast });
  const referenceImage = useReferenceImage({ t, showToast });
  const settings = useProviderSettings({ t, showToast });

  const generation = useGeneration({
    studio,
    gameName,
    chatMode: mode === 'chat',
    chatPrompt,
    options: generationOptions.options,
    template: templateManager.template,
    channelProfile: channel.profile,
    referenceImage: referenceImage.base64,
    t,
    lang,
    showToast,
    copy
  });

  const inputs = {
    mode,
    setMode,
    gameName,
    setGameName,
    details: studio.details,
    setDetails: studio.setDetails,
    chatPrompt,
    setChatPrompt,
    platforms: studio.platforms,
    setPlatforms: studio.setPlatforms
  };

  return (
    <div
      dir={dir}
      className={`${isAr ? 'font-arabic' : 'font-english'} min-h-screen bg-[#0d0f14] dark:bg-[#0d0f14] text-gray-100 dark:text-gray-100 flex flex-col relative w-full overflow-x-hidden transition-colors duration-200`}
    >
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        openSettings={settings.open}
        view={view}
        setView={setView}
        profileName={profile?.name}
        onSwitchUser={openProfilePicker}
        channelName={channel.profile.channelName}
        onEditChannel={channel.openEditor}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 pb-16 sm:pb-20">
        {view === 'dashboard' ? (
          <Dashboard />
        ) : (
          <>
            <StudioTabs studio={studio.studio} setStudio={studio.setStudio} />
            <StudioInputCard
              studio={studio.studio}
              inputs={inputs}
              voice={voice}
              onGenerate={generation.generate}
              isGenerating={Boolean(generation.busy.generate)}
              showToast={showToast}
            />
            {studio.studio === 'video' && (
              <>
                <TemplateManager manager={templateManager} channelProfile={channel.profile} onEditChannel={channel.openEditor} />
                <ReferenceImageCard image={referenceImage} />
                <GenerationOptions generationOptions={generationOptions} />
              </>
            )}
            <ResultsPanel
              studio={studio.studio}
              hasResults={studio.hasResults}
              results={studio.results}
              platforms={studio.platforms}
              options={generationOptions.options}
              generation={generation}
              imageProvider={getImageProvider(getActiveImageProviderId())}
              referenceAttached={Boolean(referenceImage.base64)}
              copy={copy}
              copiedId={copiedId}
            />
          </>
        )}
      </main>

      <Footer />
      <Toast toast={toast} />

      {channel.dialogMode && (
        <Onboarding mode={channel.dialogMode} initial={channel.profile} onSave={channel.save} onClose={channel.closeEditor} />
      )}
      <SettingsModal settings={settings} showToast={showToast} />
    </div>
  );
}
