import { useI18n } from '../../i18n/useI18n';
import { VIEWS } from '../../config/views';

// Bottom tab bar on phones (the header has no room for the views there). Respects the iPhone home bar.
export default function MobileNav({ view, setView }) {
  const { t } = useI18n();
  return (
    <nav
      aria-label={t('nav.label')}
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#08090d]/95 backdrop-blur-md border-t border-gray-800/90 grid grid-cols-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {VIEWS.map(({ id, icon: Icon, label }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-current={active ? 'page' : undefined}
            className={`min-h-[56px] flex flex-col items-center justify-center gap-1 text-[11px] font-medium cursor-pointer ${
              active ? 'text-purple-300' : 'text-gray-500'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-purple-400' : ''}`} />
            {t(label)}
          </button>
        );
      })}
    </nav>
  );
}
