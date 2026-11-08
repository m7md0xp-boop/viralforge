import { Film, Smartphone, Radio } from 'lucide-react';
import { CONTENT_TYPES } from '../config/platforms';
import { STUDIOS } from '../config/studios';

const ICONS = { video: Film, short: Smartphone, live: Radio };

// Switches between the three studios. Each studio shows only its own tools and keeps its own results.
export default function StudioTabs({ lang, contentType, setContentType }) {
  const l = lang === 'ar' ? 'ar' : 'en';
  return (
    <nav role="tablist" aria-label={l === 'ar' ? 'الاستوديوهات' : 'Studios'} className="grid grid-cols-3 gap-2 sm:gap-3">
      {CONTENT_TYPES.map((type) => {
        const Icon = ICONS[type];
        const active = contentType === type;
        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setContentType(type)}
            className={`min-h-[64px] rounded-xl border p-2.5 sm:p-3.5 flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3 text-center sm:text-start transition-all cursor-pointer ${
              active
                ? 'bg-gradient-to-br from-purple-600/25 to-emerald-600/10 border-purple-500/70 shadow-[0_0_18px_-6px_rgba(168,85,247,0.7)]'
                : 'bg-[#151922] border-gray-800 hover:border-purple-500/40'
            }`}
          >
            <span
              className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                active ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className={`block text-xs sm:text-sm font-semibold ${active ? 'text-gray-100' : 'text-gray-300'}`}>
                {STUDIOS[type].short[l]}
              </span>
              <span className="hidden sm:block text-[11px] text-gray-500 leading-snug mt-0.5">{STUDIOS[type].blurb[l]}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
