import { PLATFORMS, PLATFORMS_BY_TYPE } from '../../config/platforms';
import { useI18n } from '../../i18n/useI18n';
import { pick } from '../../i18n/translate';

// Platforms of the open studio. At least one stays selected. The number is the title limit
// (or the caption limit for platforms without a title).
export default function PlatformPicker({ studio, platforms, setPlatforms }) {
  const { t, lang } = useI18n();

  // Works from the latest list, so quick successive clicks are not lost
  const toggle = (id) =>
    setPlatforms((current) => {
      if (!current.includes(id)) return [...current, id];
      return current.length === 1 ? current : current.filter((p) => p !== id); // keep at least one
    });

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-300">{t('platforms.title')}</p>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS_BY_TYPE[studio].map((id) => {
          const p = PLATFORMS[id];
          const active = platforms.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(id)}
              className={`min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm border transition-all cursor-pointer ${
                active
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                  : 'bg-[#0d0f14] text-gray-400 border-gray-700 hover:border-emerald-500/40'
              }`}
            >
              {pick(p.label, lang)}
              <span className="opacity-70">
                {' · '}
                {p.titleMax ? t('platforms.titleLimit') : t('platforms.captionLimit')} {p.titleMax || p.captionMax}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">{t('platforms.hint')}</p>
    </div>
  );
}
