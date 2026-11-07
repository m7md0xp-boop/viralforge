import { translations } from '../i18n/translations';
import { checkText } from '../utils/titleCheck';
import { Download, Sparkles, MessageSquare, Check, TrendingUp, RefreshCw, Copy, Smartphone, FileText } from 'lucide-react';

export default function OutputArea({ limits, hasGenerated, lang, handleExportAll, genThumbnails, imagePrompt, setImagePrompt, handleCopyAndOpenGemini, handleCopyAndOpenChatGPT, genTitles, videoTitles, handleRegenerateTitles, isRegeneratingTitles, copyToClipboard, copiedSection, genShorts, shortsTitles, handleRegenerateShorts, isRegeneratingShorts, genDescription, description, handleRegenerateDescription, isRegeneratingDescription }) {
  return (
        !hasGenerated ? (
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
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="text-sm font-medium text-gray-200 break-words">
                        {item.title}
                      </span>
                      <TitleMeta text={item.title} limits={limits} />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-gray-800/60 sm:border-0">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        {translations[lang]['viralScore']}: {item.score}%
                      </span>
                      {item.seo !== undefined && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                          SEO {item.seo}%
                        </span>
                      )}
                      {item.ctr !== undefined && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
                          CTR {item.ctr}%
                        </span>
                      )}
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
        )
  );
}

// Character count and hashtag warnings for one title (uses the strictest selected platform limits)
function TitleMeta({ text, limits }) {
  const info = checkText(text, limits);
  const messages = info.warnings.map((w) => {
    if (w.kind === 'length') return `${w.length}/${w.max}`;
    if (w.kind === 'hashtagsOver') return `# ${w.count}/${w.max}`;
    return `# ${w.count} (max ${w.max})`;
  });
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]">
      <span className={info.warnings.some((w) => w.kind === 'length') ? 'text-red-400 font-semibold' : 'text-gray-500'}>
        {info.length}/{limits.titleMax}
      </span>
      {info.tags > 0 && <span className="text-gray-500">#{info.tags}</span>}
      {info.warnings.length > 0 && (
        <span className="inline-flex items-center gap-1 text-amber-400">
          ⚠ {messages.join(' · ')}
        </span>
      )}
    </div>
  );
}
