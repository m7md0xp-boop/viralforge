import { useContext } from 'react';
import { I18nContext } from './context';

// { lang, t(key, vars), isAr, dir, setLang, toggleLanguage }
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
