import { Sun, Moon, Settings } from 'lucide-react';
import { translations } from '../i18n/translations';
import { USER_CONFIG } from '../config/userConfig';

export default function Header({ lang, theme, toggleTheme, setLang, openSettings }) {
  return (
      <header className="border-b border-gray-800 bg-[#151922]/80 backdrop-blur px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 ltr:pr-2 rtl:pl-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] shrink-0" />
          <h1 className="text-base sm:text-xl font-bold tracking-wide bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent truncate">
            {translations[lang]['appTitle']}
          </h1>
          <a
            href={USER_CONFIG.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:text-purple-200 hover:border-purple-400 transition-all font-medium shrink-0 cursor-pointer shadow-sm"
            title={`${USER_CONFIG.channelName} YouTube Channel`}
          >
            by {USER_CONFIG.channelName}
          </a>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Phase 28: Dark / Light Mode Toggle Button */}
          <button
            type="button"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_12px_rgba(251,191,36,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'الوضع المضيء' : 'الوضع الداكن'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-purple-600" />
            )}
          </button>
          <button
            type="button"
            aria-label="Toggle language"
            onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-200 hover:text-purple-400 hover:border-purple-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center font-bold text-sm shrink-0 select-none"
          >
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>
          <button
            type="button"
            aria-label={translations[lang]['settingsTitle']}
            onClick={openSettings}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>
  );
}
