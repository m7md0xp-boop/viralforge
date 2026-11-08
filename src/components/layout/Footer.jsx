import { useI18n } from '../../i18n/useI18n';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="sticky bottom-0 z-30 w-full bg-[#08090d]/95 dark:bg-[#08090d]/95 backdrop-blur-md border-t border-gray-800/90 py-2.5 px-4 text-center text-xs text-gray-400 shadow-lg mt-auto select-none">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
        <span>© 2026 ViralForge</span>
        <span>·</span>
        <span>{t('footer.openSource')}</span>
      </div>
    </footer>
  );
}
