import { useRef, useState } from 'react';
import { UploadCloud, ImagePlus, Sparkles, Loader2, Wand2, Info } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import ScorePanel from '../lab/ScorePanel';
import YouTubePreview from '../lab/YouTubePreview';

// Thumbnail Lab: upload (or use the generated image), score it locally and with a vision model,
// and preview it on YouTube next to the title.
export default function ThumbnailLab({ lab, generatedImage, myTitles, channelName }) {
  const { t } = useI18n();
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  const { image, title, setTitle, busy } = lab;

  const drop = (e) => {
    e.preventDefault();
    setDragging(false);
    lab.loadFile(e.dataTransfer.files?.[0]);
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-400" />
          {t('lab.title')}
        </h2>
        <p className="text-xs text-gray-400 mt-1">{t('lab.subtitle')}</p>
      </div>

      <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => lab.loadFile(e.target.files?.[0])} />
        <div
          role="button"
          tabIndex={0}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={drop}
          className={`rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
            dragging ? 'border-purple-500 bg-purple-950/25' : 'border-gray-700/80 bg-[#0d0f14]/70 hover:border-purple-500/50'
          }`}
        >
          {image ? (
            <div className="relative">
              <img src={image} alt="" className="w-full aspect-video object-contain bg-black/40" />
              <span className="absolute bottom-2 end-2 text-[11px] px-2 py-1 rounded-md bg-black/70 text-gray-200">{t('lab.replace')}</span>
            </div>
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center gap-3 text-center p-6">
              <div className="w-12 h-12 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-200">{t('lab.upload')}</p>
              <p className="text-xs text-gray-500">{t('lab.uploadHint')}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {generatedImage && generatedImage !== image && (
            <button
              type="button"
              onClick={() => lab.load(generatedImage)}
              className="min-h-[40px] px-3 rounded-lg text-xs font-semibold bg-gray-800 border border-gray-700 text-gray-200 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" />
              {t('lab.useGenerated')}
            </button>
          )}
          <button
            type="button"
            onClick={lab.reviewWithAi}
            disabled={!image || busy.ai || busy.local}
            className="min-h-[40px] px-4 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
          >
            {busy.ai ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {busy.ai ? t('lab.aiReviewing') : lab.ai ? t('lab.aiAgain') : t('lab.aiReview')}
          </button>
          {busy.local && <span className="text-xs text-gray-400 self-center">{t('lab.analyzing')}</span>}
        </div>
        {!lab.visionAvailable && (
          <p className="text-[11px] text-amber-300/90 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {t('lab.aiUnavailable')}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="lab-title" className="text-sm font-medium text-gray-300">
            {t('lab.titleLabel')}
          </label>
          <input
            id="lab-title"
            list="lab-my-titles"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={myTitles.length ? `${t('lab.titlePlaceholder')} (${t('lab.pickTitle')} ▾)` : t('lab.titlePlaceholder')}
            dir="auto"
            className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
          />
          <datalist id="lab-my-titles">
            {myTitles.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </div>
      </div>

      <ScorePanel lab={lab} />
      <YouTubePreview image={image} title={title} channelName={channelName} />
    </section>
  );
}
