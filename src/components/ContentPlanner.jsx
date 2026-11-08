import { PLATFORMS, PLATFORMS_BY_TYPE } from '../config/platforms';

// Platforms of the open studio. At least one stays selected. The number is the title limit
// (or the caption limit for platforms without a title).
export default function ContentPlanner({ lang, contentType, selectedPlatforms, setSelectedPlatforms }) {
  const isAr = lang === 'ar';

  // Works from the latest list, so quick successive clicks are not lost
  const togglePlatform = (id) =>
    setSelectedPlatforms((current) => {
      if (!current.includes(id)) return [...current, id];
      return current.length === 1 ? current : current.filter((p) => p !== id); // keep at least one platform
    });

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-300">{isAr ? 'المنصات' : 'Platforms'}</p>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS_BY_TYPE[contentType].map((id) => {
          const p = PLATFORMS[id];
          const active = selectedPlatforms.includes(id);
          const limit = p.titleMax || p.captionMax;
          const what = p.titleMax ? (isAr ? 'عنوان' : 'title') : isAr ? 'وصف' : 'caption';
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
              {p.label[isAr ? 'ar' : 'en']}
              <span className="opacity-70"> · {what} {limit}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        {isAr
          ? 'يُكتب المحتوى ليناسب أشد حدود المنصات المختارة، ويظهر عدّاد لكل منصة في النتائج.'
          : 'Content is written for the strictest limits of the selected platforms; each result shows a counter per platform.'}
      </p>
    </div>
  );
}
