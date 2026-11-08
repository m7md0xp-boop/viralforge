import { Check, Download } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import VideoResults from './VideoResults';
import ShortsResults from './ShortsResults';
import LiveResults from './LiveResults';

// Results of the open studio, with "Export all" on top. Shows a placeholder before the first generation.
export default function ResultsPanel({ studio, hasResults, results, platforms, options, generation, imageProvider, referenceAttached, copy, copiedId }) {
  const { t } = useI18n();

  if (!hasResults) {
    return (
      <div className="bg-[#151922] border border-dashed border-gray-800 rounded-xl p-8 min-h-[180px] flex items-center justify-center text-center">
        <p className="text-gray-500 italic text-base select-none">{t('common.outputPlaceholder')}</p>
      </div>
    );
  }

  const shared = { results, platforms, generation, copy, copiedId };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={generation.exportAll}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow-md hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t('common.exportAll')}</span>
        </button>
      </div>

      <div className="text-xs sm:text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 shadow-sm">
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{t('common.outputSummary')}</span>
      </div>

      {studio === 'video' && <VideoResults {...shared} options={options} imageProvider={imageProvider} referenceAttached={referenceAttached} />}
      {studio === 'short' && <ShortsResults {...shared} />}
      {studio === 'live' && <LiveResults {...shared} />}
    </div>
  );
}
