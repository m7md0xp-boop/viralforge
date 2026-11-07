import { Key, X, Clipboard, Trash2, ExternalLink, EyeOff, Eye, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function SettingsModal({ isSettingsOpen, handleBackdropClick, lang, setIsSettingsOpen, handlePasteKey, handleClearSingleKey, showApiKey, apiKeyInput, setApiKeyInput, setShowApiKey, showOpenaiApiKey, openaiApiKeyInput, setOpenaiApiKeyInput, setShowOpenaiApiKey, showGroqApiKey, groqApiKeyInput, setGroqApiKeyInput, setShowGroqApiKey, showOpenRouterApiKey, openRouterApiKeyInput, setOpenRouterApiKeyInput, setShowOpenRouterApiKey, textProviderInput, setTextProviderInput, handleClearApiKey, handleSaveApiKey }) {
  if (!isSettingsOpen) return null;
  return (
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
  );
}
