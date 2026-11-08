import { useMemo, useState } from 'react';
import { Search, Star, Trash2, ExternalLink, ChevronDown, ChevronUp, Film, Smartphone, Radio, BookMarked } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import { PLATFORMS } from '../../config/platforms';
import { pick } from '../../i18n/translate';
import { entryHeadline, entryText, entryTitles, filterEntries } from '../../utils/libraryEntries';
import { CopyButton, CopyIconButton } from '../ui/Card';

const STUDIO_ICON = { video: Film, short: Smartphone, live: Radio };
const FILTERS = ['all', 'video', 'short', 'live'];

function EntryCard({ entry, library, onRestore, copy, copiedId }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const Icon = STUDIO_ICON[entry.studio] || Film;
  const titles = entryTitles(entry);
  const subtitle = [entry.game, entry.details].filter(Boolean).join(' · ') || entry.chatPrompt;

  const remove = () => {
    if (window.confirm(t('library.deleteConfirm'))) library.remove(entry.id);
  };

  return (
    <li className="rounded-xl border border-gray-800 bg-[#151922] p-3 sm:p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 shrink-0 rounded-lg bg-gray-800 text-purple-300 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-100 break-words" dir="auto">
            {entryHeadline(entry)}
          </p>
          {/* Each part keeps its own direction, so an English game name does not scramble an Arabic date */}
          <p className="text-[11px] text-gray-500 mt-1 flex flex-wrap gap-x-3">
            {subtitle && (
              <bdi className="truncate max-w-[220px]" dir="auto">
                {subtitle}
              </bdi>
            )}
            <bdi className="tabular-nums">{new Date(entry.at).toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' })}</bdi>
            <bdi dir="ltr">{entry.platforms.map((id) => pick(PLATFORMS[id]?.label, lang) || id).join(' · ')}</bdi>
          </p>
        </div>
        <button
          type="button"
          onClick={() => library.toggleFavorite(entry.id)}
          aria-pressed={entry.favorite}
          aria-label={entry.favorite ? t('library.unfavorite') : t('library.favorite')}
          title={entry.favorite ? t('library.unfavorite') : t('library.favorite')}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-gray-800 cursor-pointer"
        >
          <Star className={`w-5 h-5 ${entry.favorite ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton text={entryText(entry)} id={`lib-${entry.id}`} label={t('common.copyAll')} copy={copy} copiedId={copiedId} />
        <button
          type="button"
          onClick={() => onRestore(entry)}
          className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:text-purple-300 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          {t('library.restore')}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {open ? t('library.hide') : t('library.show')}
        </button>
        <button
          type="button"
          onClick={remove}
          aria-label={t('library.delete')}
          title={t('library.delete')}
          className="min-h-[44px] min-w-[44px] ms-auto flex items-center justify-center rounded-lg text-gray-500 hover:text-red-300 hover:bg-red-950/40 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-gray-800 pt-3">
          {titles.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400">{t('library.titles')}</p>
              {titles.map((title, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-[#0d0f14] border border-gray-800 px-3 py-1.5">
                  <span className="text-sm text-gray-200 break-words" dir="auto">
                    {title}
                  </span>
                  <CopyIconButton text={title} id={`lib-${entry.id}-${i}`} copy={copy} copiedId={copiedId} />
                </div>
              ))}
            </div>
          )}
          {entry.results?.description && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400">{t('library.description')}</p>
              <pre className="whitespace-pre-wrap break-words text-xs text-gray-300 font-sans leading-relaxed rounded-lg bg-[#0d0f14] border border-gray-800 p-3 max-h-60 overflow-y-auto">
                {entry.results.description}
              </pre>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// Every saved generation: search, studio filter, favourites, copy and reopen
export default function Library({ library, onRestore, copy, copiedId }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [studio, setStudio] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const shown = useMemo(() => filterEntries(library.entries, { query, studio, favoritesOnly }), [library.entries, query, studio, favoritesOnly]);

  const chip = (active) =>
    `min-h-[36px] px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
      active ? 'bg-purple-600 text-white border-purple-500' : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-purple-500/50'
    }`;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-purple-400" />
          {t('library.title')}
        </h2>
        <p className="text-xs text-gray-400 mt-1">{t('library.subtitle')}</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('library.search')}
            className="w-full min-h-[44px] ps-9 pe-3 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={studio === f} onClick={() => setStudio(f)} className={chip(studio === f)}>
              {f === 'all' ? t('library.all') : t(`studios.${f}.tab`)}
            </button>
          ))}
          <button type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)} className={`${chip(favoritesOnly)} flex items-center gap-1.5`}>
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white' : ''}`} />
            {t('library.favorites')}
          </button>
          <span className="text-xs text-gray-500 ms-auto">{t('library.count', { n: shown.length })}</span>
        </div>
      </div>

      {library.entries.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">{t('library.empty')}</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">{t('library.noMatch')}</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((entry) => (
            <EntryCard key={entry.id} entry={entry} library={library} onRestore={onRestore} copy={copy} copiedId={copiedId} />
          ))}
        </ul>
      )}
    </section>
  );
}
