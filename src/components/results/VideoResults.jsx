import { Download, Sparkles, TrendingUp, FileText, Image as ImageIcon } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import { UsageBadge } from '../ui/UsageBadge';
import { Card, CardHeader, CopyButton, CopyIconButton, RegenerateButton } from '../ui/Card';
import { TitleMeta } from './LimitChips';

const secondaryButton =
  'min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all cursor-pointer';

// Thumbnail prompt (editable), image generation with the selected provider, and the result
function ThumbnailCard({ results, generation, imageProvider, referenceAttached }) {
  const { t } = useI18n();
  const { imagePrompt, generatedImage } = results;
  const busy = generation.busy.image;

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
          <h3 className="text-base font-semibold text-gray-200">{t('video.thumbTitle')}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-gray-500">{t('video.imageProvider')}</span>
          <UsageBadge provider={imageProvider} />
        </div>
      </div>

      <textarea
        rows={4}
        value={imagePrompt}
        onChange={(e) => generation.setImagePrompt(e.target.value)}
        placeholder={t('video.thumbPlaceholder')}
        className="w-full bg-[#0d0f14] border border-gray-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl p-3.5 text-xs sm:text-sm text-gray-200 placeholder-gray-500 transition-all outline-none resize-y font-sans leading-relaxed"
      />

      {referenceAttached && !imageProvider.supportsReference && (
        <p className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-500/20 rounded-lg p-2">{t('video.refWarning')}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={generation.generateImage}
          disabled={busy}
          className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 border border-purple-500/50 shadow-md transition-all ${
            busy ? 'opacity-70 cursor-not-allowed' : 'hover:from-fuchsia-500 hover:to-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-[0.98] cursor-pointer'
          }`}
        >
          <ImageIcon className={`w-4 h-4 ${busy ? 'animate-pulse' : ''}`} />
          <span>{busy ? t('video.generatingImage') : t('video.generateImage')}</span>
        </button>
        <button type="button" onClick={() => generation.copyAndOpen('gemini')} className={secondaryButton}>
          {t('video.copyOpenGemini')}
        </button>
        <button type="button" onClick={() => generation.copyAndOpen('chatgpt')} className={secondaryButton}>
          {t('video.copyOpenChatGpt')}
        </button>
      </div>

      {generatedImage && (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#0d0f14]">
            <img src={generatedImage.src} alt={t('video.generatedAlt')} className="w-full h-auto block" />
          </div>
          <a
            href={generatedImage.src}
            download={`thumbnail.${generatedImage.mime.split('/')[1] || 'png'}`}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-emerald-400 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t('video.downloadImage')}</span>
          </a>
        </div>
      )}
    </Card>
  );
}

function TitlesCard({ titles, limits, generation, copy, copiedId }) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader icon={TrendingUp} iconClass="text-emerald-400" title={t('video.titlesHeader')}>
        <RegenerateButton onClick={generation.regenerateTitles} busy={generation.busy.titles} />
        <CopyButton text={titles.map((x) => x.title).join('\n')} id="titles" label={t('video.copyTitles')} copy={copy} copiedId={copiedId} />
      </CardHeader>
      <div className="space-y-2.5">
        {titles.map((item, index) => (
          <div
            key={index}
            className="p-3.5 rounded-lg bg-[#0d0f14] border border-gray-800/80 hover:border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
          >
            <div className="flex-1 min-w-0 space-y-1.5">
              <span className="text-sm font-medium text-gray-200 break-words">{item.title}</span>
              <TitleMeta text={item.title} limits={limits} />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-gray-800/60 sm:border-0">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                {t('video.viralScore')}: {item.score}%
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                SEO {item.seo}%
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
                CTR {item.ctr}%
              </span>
              <CopyIconButton text={item.title} id={`title-${index}`} copy={copy} copiedId={copiedId} label={`${t('common.copy')} ${index + 1}`} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DescriptionCard({ description, generation, copy, copiedId }) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader icon={FileText} title={t('video.descriptionHeader')}>
        <RegenerateButton onClick={generation.regenerateDescription} busy={generation.busy.description} />
        <CopyButton text={description} id="description" label={t('video.copyDescription')} copy={copy} copiedId={copiedId} />
      </CardHeader>
      <div className="p-4 rounded-lg bg-[#0d0f14] border border-gray-800 max-h-[350px] overflow-y-auto">
        <pre className="text-xs sm:text-sm font-mono text-gray-200 whitespace-pre-wrap font-normal leading-relaxed break-words">{description}</pre>
      </div>
    </Card>
  );
}

// Long-video results: thumbnail, titles, description
export default function VideoResults({ results, options, generation, imageProvider, referenceAttached, copy, copiedId }) {
  return (
    <>
      {(options.thumbnails || Boolean(results.imagePrompt)) && (
        <ThumbnailCard results={results} generation={generation} imageProvider={imageProvider} referenceAttached={referenceAttached} />
      )}
      {results.videoTitles.length > 0 && (
        <TitlesCard titles={results.videoTitles} limits={generation.limits} generation={generation} copy={copy} copiedId={copiedId} />
      )}
      {Boolean(results.description) && <DescriptionCard description={results.description} generation={generation} copy={copy} copiedId={copiedId} />}
    </>
  );
}
