import { Sun, Moon, Settings, LayoutDashboard, PenSquare, Users, Tv } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function Header({ lang, theme, toggleTheme, setLang, openSettings, view = 'create', setView, profileName, onSwitchUser, channelName, onEditChannel }) {
  const isAr = lang === 'ar';
  return (
      <header className="border-b border-gray-800 bg-[#151922]/80 backdrop-blur px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 ltr:pr-2 rtl:pl-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] shrink-0" />
          <h1 className="text-base sm:text-xl font-bold tracking-wide bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent truncate">
            {translations[lang]['appTitle']}
          </h1>
        {onEditChannel && (
          <button
            type="button"
            onClick={onEditChannel}
            title={isAr ? 'بيانات قناتي' : 'My channel'}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-300 transition-colors cursor-pointer max-w-[160px]"
          >
            <Tv className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{channelName || (isAr ? 'أضف قناتك' : 'Add your channel')}</span>
          </button>
        )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {setView && (
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 mx-1">
              {[
                { id: 'create', icon: PenSquare, label: isAr ? 'إنشاء' : 'Create' },
                { id: 'dashboard', icon: LayoutDashboard, label: isAr ? 'المتابعة' : 'Dashboard' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  aria-pressed={view === id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    view === id ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_16px_-4px_rgba(168,85,247,0.7)]' : 'text-gray-400 hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}
          {profileName && onSwitchUser && (
            <button
              type="button"
              onClick={onSwitchUser}
              title={isAr ? 'تبديل المستخدم' : 'Switch user'}
              className="min-h-[44px] px-3 rounded-lg bg-white/[0.04] border border-white/10 text-gray-200 hover:border-purple-400/50 transition-all duration-200 flex items-center gap-2 text-xs font-medium max-w-[160px]"
            >
              <Users className="w-4 h-4 text-purple-300 shrink-0" />
              <span className="truncate">{profileName}</span>
            </button>
          )}
          {/* Phase 28: Dark / Light Mode Toggle Button */}
          <button
            type="button"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_12px_rgba(251,191,36,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? (isAr ? 'الوضع المضيء' : 'Light mode') : (isAr ? 'الوضع الداكن' : 'Dark mode')}
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
