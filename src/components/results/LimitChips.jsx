import { PLATFORMS } from '../../config/platforms';
import { useI18n } from '../../i18n/useI18n';
import { pick } from '../../i18n/translate';
import { checkText, countChars } from '../../utils/titleCheck';

// One chip per selected platform: "TikTok Live 28/32". Red when the text is over that platform's limit.
// field: 'title' (titleMax) or 'caption' (captionMax). Platforms without that field are skipped.
export function LimitChips({ text, platforms, field }) {
  const { t, lang } = useI18n();
  const length = countChars(text);
  const rows = platforms
    .map((id) => PLATFORMS[id])
    .filter(Boolean)
    .map((p) => ({ p, max: field === 'title' ? p.titleMax : p.captionMax }))
    .filter((r) => typeof r.max === 'number');
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {rows.map(({ p, max }) => {
        const over = length > max;
        return (
          <span
            key={p.id}
            title={over ? t('live.overLimit') : undefined}
            className={`text-[11px] px-2 py-0.5 rounded-md border tabular-nums ${
              over ? 'bg-red-950/60 border-red-500/50 text-red-300 font-semibold' : 'bg-gray-800/70 border-gray-700 text-gray-400'
            }`}
          >
            {pick(p.label, lang)}{' '}
            <span dir="ltr">
              {length}/{max}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// Length and hashtag warnings for one long-video title, against the strictest selected limits
export function TitleMeta({ text, limits }) {
  const info = checkText(text, limits);
  const messages = info.warnings.map((w) => {
    if (w.kind === 'length') return `${w.length}/${w.max}`;
    if (w.kind === 'hashtagsOver') return `# ${w.count}/${w.max}`;
    return `# ${w.count} (max ${w.max})`;
  });
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]" dir="ltr">
      <span className={info.warnings.some((w) => w.kind === 'length') ? 'text-red-400 font-semibold' : 'text-gray-500'}>
        {info.length}/{limits.titleMax}
      </span>
      {info.tags > 0 && <span className="text-gray-500">#{info.tags}</span>}
      {info.warnings.length > 0 && <span className="inline-flex items-center gap-1 text-amber-400">⚠ {messages.join(' · ')}</span>}
    </div>
  );
}
