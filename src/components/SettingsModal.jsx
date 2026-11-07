import { Key, X, Trash2, ExternalLink, EyeOff, Eye, AlertCircle, Type, Image as ImageIcon } from 'lucide-react';
import { translations } from '../i18n/translations';
import { AI_PROVIDERS, IMAGE_PROVIDERS, getImageProvider } from '../config/aiProviders';
import PasteButton from './PasteButton';
import { UsageBadge, UsageOptions } from './UsageBadge';

const T = {
  ar: {
    textTitle: 'مزوّد النصوص',
    imageTitle: 'مزوّد الصور',
    keyLabel: (name) => `مفتاح ${name} API`,
    getKey: (name) => `احصل على مفتاح ${name}`,
    usageHint: 'القيود تتغير من وقت لآخر، تحقّق من صفحة الأسعار عند المزوّد.',
    imageRefHint: 'هذا المزوّد لا يستخدم صورتك المرجعية، لذلك سيُولَّد الوجه بشكل عام.'
  },
  en: {
    textTitle: 'Text provider',
    imageTitle: 'Image provider',
    keyLabel: (name) => `${name} API key`,
    getKey: (name) => `Get a ${name} key`,
    usageHint: 'Limits change over time. Check the provider pricing page.',
    imageRefHint: 'This provider does not use your reference photo, so the face will be generic.'
  }
};

// One provider section: grouped dropdown, usage badge, one key field for the chosen provider.
function ProviderSection({ lang, icon: Icon, title, providers, providerId, onProvider, keyValue, onKey, show, onShow, onClear, showToast, warnNoReference }) {
  const isAr = lang === 'ar';
  const tx = T[isAr ? 'ar' : 'en'];
  const provider = providers.find((p) => p.id === providerId) || providers[0];
  const name = provider.label[isAr ? 'ar' : 'en'];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
        <Icon className="w-4 h-4 text-purple-400" />
        <span>{title}</span>
      </div>

      <div className="space-y-2">
        <select
          aria-label={title}
          value={provider.id}
          onChange={(e) => onProvider(e.target.value)}
          className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#0d0f14] border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
        >
          <UsageOptions providers={providers} lang={lang} />
        </select>
        <div className="flex items-start gap-2 flex-wrap">
          <UsageBadge provider={provider} lang={lang} />
          <span className="text-[11px] text-gray-400 leading-relaxed">{provider.usageNote[isAr ? 'ar' : 'en']}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label htmlFor={`${provider.id}-key`} className="block text-sm font-medium text-gray-300">
            {tx.keyLabel(name)}
          </label>
          <div className="flex items-center gap-1.5">
            <PasteButton lang={lang} onPaste={onKey} onError={(msg) => showToast?.(msg, 'error')} />
            <button
              type="button"
              onClick={() => onClear(provider.id)}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 transition-all cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{translations[lang]['clearKeyBtn']}</span>
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            id={`${provider.id}-key`}
            type={show ? 'text' : 'password'}
            value={keyValue}
            onChange={(e) => onKey(e.target.value)}
            placeholder={provider.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full min-h-[44px] px-3 py-2 pe-10 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono transition-all"
          />
          <button
            type="button"
            aria-label={show ? 'Hide API key' : 'Show API key'}
            onClick={() => onShow(!show)}
            className="absolute inset-y-0 end-0 px-3 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <a
          href={provider.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200"
        >
          <span>{tx.getKey(name)}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        {warnNoReference && (
          <p className="text-[11px] text-amber-300/90">{tx.imageRefHint}</p>
        )}
      </div>
    </section>
  );
}

export default function SettingsModal({
  isSettingsOpen,
  handleBackdropClick,
  lang,
  setIsSettingsOpen,
  text,
  image,
  showToast,
  handleClearSingleKey,
  handleSaveApiKey
}) {
  if (!isSettingsOpen) return null;

  const isAr = lang === 'ar';
  const tx = T[isAr ? 'ar' : 'en'];
  const selectedImage = getImageProvider(image.providerId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#151922] border border-gray-800 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 id="settings-modal-title" className="text-base font-semibold text-gray-100 truncate">
                {translations[lang]['settingsTitle']}
              </h2>
              <p className="text-xs text-gray-400 truncate">{translations[lang]['settingsSubtitle']}</p>
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

        <ProviderSection
          lang={lang}
          icon={Type}
          title={tx.textTitle}
          providers={AI_PROVIDERS}
          providerId={text.providerId}
          onProvider={text.onProvider}
          keyValue={text.keyValue}
          onKey={text.onKey}
          show={text.show}
          onShow={text.onShow}
          onClear={handleClearSingleKey}
          showToast={showToast}
        />

        <div className="border-t border-gray-800/80" />

        <ProviderSection
          lang={lang}
          icon={ImageIcon}
          title={tx.imageTitle}
          providers={IMAGE_PROVIDERS}
          providerId={image.providerId}
          onProvider={image.onProvider}
          keyValue={image.keyValue}
          onKey={image.onKey}
          show={image.show}
          onShow={image.onShow}
          onClear={handleClearSingleKey}
          showToast={showToast}
          warnNoReference={!selectedImage.supportsReference}
        />

        <p className="text-[11px] text-gray-500">{tx.usageHint}</p>

        <p className="text-xs text-amber-400/90 bg-amber-950/30 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2 break-words">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <span>{translations[lang]['warningText']}</span>
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800/80">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all cursor-pointer"
          >
            {translations[lang]['cancelBtn']}
          </button>
          <button
            type="button"
            onClick={handleSaveApiKey}
            className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            {translations[lang]['saveBtn']}
          </button>
        </div>
      </div>
    </div>
  );
}
