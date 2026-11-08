import { Layers, X, ArrowLeftRight } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

// Shown under the inputs when the game has a saved series: last episode, how many generations,
// a button for the next episode (long videos), and a way to forget the series.
export default function SeriesChip({ seriesMemory, studio, details, onUseNext, showToast }) {
  const { t } = useI18n();
  const { series, next, forget } = seriesMemory;
  if (!series) return null;

  const info = series.lastEpisode
    ? t('series.info', { episode: series.lastEpisode, count: series.count })
    : t('series.infoNoEpisode', { count: series.count });

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/25 px-3 py-2.5 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-200 truncate" dir="auto">
              {t('series.found', { game: series.game })}
            </p>
            <p className="text-[11px] text-emerald-300/80">{info}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            forget();
            showToast(t('series.forgotten'), 'info');
          }}
          aria-label={t('series.forget')}
          title={t('series.forget')}
          className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-md text-emerald-300/70 hover:text-red-300 hover:bg-red-950/40 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {studio === 'video' && next && next !== details.trim() && (
          <button
            type="button"
            onClick={() => onUseNext(next)}
            className="min-h-[32px] px-2.5 rounded-md text-[11px] font-semibold bg-emerald-600/80 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeftRight className="w-3 h-3" />
            {t('series.next', { episode: next })}
          </button>
        )}
        <span className="text-[11px] text-emerald-300/70">{t('series.hint')}</span>
      </div>
    </div>
  );
}
