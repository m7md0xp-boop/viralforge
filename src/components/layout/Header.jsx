import { Sun, Moon, Settings, Users, Tv } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import { VIEWS } from '../../config/views';
import { BRAND, brandTagline } from '../../config/brand';

const iconButton =
  'min-h-[44px] min-w-[44px] p-2 rounded-lg bg-gray-800/80 border border-gray-700 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0';

export default function Header({ theme, toggleTheme, openSettings, view, setView, profileName, onSwitchUser, channelName, onEditChannel }) {
  const { t, lang, toggleLanguage } = useI18n();
  const themeLabel = theme === 'dark' ? t('header.lightMode') : t('header.darkMode');

  return (
    <header
      className="border-b border-gray-800 bg-[#151922]/80 backdrop-blur px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-md"
      // Phone apps draw under the status bar / notch: keep the header below it
      style={{ paddingTop: 'max(0.875rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 ltr:pr-2 rtl:pl-2">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] shrink-0" />
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold tracking-wide bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent truncate leading-tight">
            {BRAND.name}
          </h1>
          <p className="hidden sm:block text-[10px] text-gray-500 truncate leading-tight">
            {lang === 'ar' ? `${BRAND.nameAr} · ${brandTagline(lang)}` : brandTagline(lang)}
          </p>
        </div>
        <button
          type="button"
          onClick={onEditChannel}
          title={t('header.myChannel')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-300 transition-colors cursor-pointer max-w-[160px]"
        >
          <Tv className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{channelName || t('header.addChannel')}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 mx-1">
          {VIEWS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-pressed={view === id}
              title={t(label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                view === id
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_16px_-4px_rgba(168,85,247,0.7)]'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t(label)}</span>
            </button>
          ))}
        </div>

        {/* Desktop app only: each user has an isolated workspace */}
        {profileName && (
          <button
            type="button"
            onClick={onSwitchUser}
            title={t('header.switchUser')}
            className="min-h-[44px] px-3 rounded-lg bg-white/[0.04] border border-white/10 text-gray-200 hover:border-purple-400/50 transition-all duration-200 flex items-center gap-2 text-xs font-medium max-w-[160px]"
          >
            <Users className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="truncate">{profileName}</span>
          </button>
        )}

        <button
          type="button"
          aria-label={themeLabel}
          title={themeLabel}
          onClick={toggleTheme}
          className={`${iconButton} text-gray-300 hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_12px_rgba(251,191,36,0.3)]`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
        </button>
        <button
          type="button"
          aria-label={t('header.toggleLanguage')}
          title={t('header.toggleLanguage')}
          onClick={toggleLanguage}
          className={`${iconButton} px-3 text-gray-200 hover:text-purple-400 hover:border-purple-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] font-bold text-sm select-none`}
        >
          {t('header.languageButton')}
        </button>
        <button
          type="button"
          aria-label={t('header.settings')}
          title={t('header.settings')}
          onClick={openSettings}
          className={`${iconButton} text-gray-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
