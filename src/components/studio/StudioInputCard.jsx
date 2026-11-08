import { Zap, MessageSquare, Mic, Info, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import PasteButton from '../ui/PasteButton';
import PlatformPicker from './PlatformPicker';
import SeriesChip from './SeriesChip';

const tabClass = (active) =>
  `min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
    active ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
  }`;

const fieldClass =
  'w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm sm:text-base';

// Input card of the open studio: quick mode (game + details) or chat mode (free request),
// the platforms, and the Generate button.
export default function StudioInputCard({ studio, inputs, voice, seriesMemory, onGenerate, isGenerating, showToast }) {
  const { t } = useI18n();
  const { mode, setMode, gameName, setGameName, details, setDetails, chatPrompt, setChatPrompt, platforms, setPlatforms } = inputs;
  const pasteError = (msg) => showToast(msg, 'error');

  // Series memory: when a known series is typed and the episode is empty, the next episode is filled in
  const fillNextEpisode = () => {
    if (studio !== 'video' || details.trim() || !seriesMemory.next) return;
    setDetails(seriesMemory.next);
    showToast(t('series.autoFilled', { episode: seriesMemory.next }), 'info');
  };

  return (
    <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-5">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-100">{t(`studios.${studio}.title`)}</h2>
        <p className="text-xs text-gray-400 mt-1">{t(`studios.${studio}.blurb`)}</p>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <button type="button" onClick={() => setMode('quick')} className={tabClass(mode === 'quick')}>
          <Zap className="w-4 h-4" />
          <span>{t('input.quickTab')}</span>
        </button>
        <button type="button" onClick={() => setMode('chat')} className={tabClass(mode === 'chat')}>
          <MessageSquare className="w-4 h-4" />
          <span>{t('input.chatTab')}</span>
        </button>
      </div>

      {mode === 'quick' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="game-name" className="block text-sm font-medium text-gray-300">
                {t('input.gameLabel')}
              </label>
              <PasteButton onPaste={setGameName} onError={pasteError} />
            </div>
            <input
              id="game-name"
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              onBlur={fillNextEpisode}
              placeholder={t('input.gamePlaceholder')}
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="episode-number" className="block text-sm font-medium text-gray-300">
                {t(`studios.${studio}.detailsLabel`)}
              </label>
              <PasteButton onPaste={setDetails} onError={pasteError} />
            </div>
            <input
              id="episode-number"
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t(`studios.${studio}.detailsPlaceholder`)}
              className={fieldClass}
            />
          </div>
          <div className="md:col-span-2 empty:hidden">
            <SeriesChip seriesMemory={seriesMemory} studio={studio} details={details} onUseNext={setDetails} showToast={showToast} />
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 animate-fade-in">
          <div className="relative">
            <textarea
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              rows={5}
              placeholder={t('input.chatPlaceholder')}
              className="w-full p-4 pb-12 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all resize-y"
            />
            {/* Hidden where speech recognition does not work (desktop app, some browsers) */}
            {voice.supported && (
              <button
                type="button"
                aria-label={voice.isRecording ? t('input.voiceStop') : t('input.voiceStart')}
                title={voice.isRecording ? t('input.voiceStop') : t('input.voiceStart')}
                onClick={voice.toggle}
                className={`min-h-[36px] min-w-[36px] absolute bottom-3 right-3 p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                  voice.isRecording
                    ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                    : 'bg-gray-800/90 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-purple-300 shadow-sm'
                }`}
              >
                <Mic className={`w-4 h-4 ${voice.isRecording ? 'animate-bounce text-white' : 'text-purple-400'}`} />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed flex items-start gap-1.5">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>{t('input.chatNote')}</span>
          </p>
        </div>
      )}

      <PlatformPicker studio={studio} platforms={platforms} setPlatforms={setPlatforms} />

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className={`w-full min-h-[44px] py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-emerald-600 shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          isGenerating
            ? 'opacity-70 cursor-not-allowed'
            : 'hover:from-purple-500 hover:to-emerald-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.99] cursor-pointer'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span>{t('input.generating')}</span>
          </>
        ) : (
          <span>{t('input.generate')}</span>
        )}
      </button>
    </div>
  );
}
