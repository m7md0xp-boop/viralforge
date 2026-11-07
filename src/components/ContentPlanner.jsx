import { translations } from '../i18n/translations';
import { CONTENT_TYPES, PLATFORMS, PLATFORMS_BY_TYPE } from '../config/platforms';

// The three generation sections. Each one produces its own kind of text.
const TYPE_LABEL = {
  video: { ar: 'المقاطع الطويلة (يوتيوب)', en: 'Long videos (YouTube)' },
  short: { ar: 'المقاطع القصيرة', en: 'Short videos' },
  live: { ar: 'البث المباشر', en: 'Live streams' }
};

export default function ContentPlanner({ lang, contentType, setContentType, selectedPlatforms, setSelectedPlatforms }) {
  const isAr = lang === 'ar';

  const chooseType = (type) => {
    setContentType(type);
    // Keep only the platforms that belong to the chosen type; default to the first one
    const allowed = PLATFORMS_BY_TYPE[type];
    const kept = selectedPlatforms.filter((id) => allowed.includes(id));
    setSelectedPlatforms(kept.length ? kept : [allowed[0]]);
  };

  const togglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length === 1) return; // keep at least one platform
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={isAr ? 'نوع المحتوى' : 'Content type'}>
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={contentType === type}
            onClick={() => chooseType(type)}
            className={`min-h-[40px] px-3 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
              contentType === type
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-purple-500/50'
            }`}
          >
            {TYPE_LABEL[type][isAr ? 'ar' : 'en']}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORMS_BY_TYPE[contentType].map((id) => {
          const active = selectedPlatforms.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => togglePlatform(id)}
              className={`min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm border transition-all cursor-pointer ${
                active
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                  : 'bg-[#0d0f14] text-gray-400 border-gray-700 hover:border-emerald-500/40'
              }`}
            >
              {PLATFORMS[id].label[isAr ? 'ar' : 'en']} · {PLATFORMS[id].titleMax}
              {isAr ? ' حرف' : ' chars'}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-500">
        {translations[lang]['platformHint'] || (isAr ? 'الرقم بعد الاسم هو الحد الأقصى للأحرف.' : 'The number is the max character count.')}
      </p>
    </div>
  );
}
