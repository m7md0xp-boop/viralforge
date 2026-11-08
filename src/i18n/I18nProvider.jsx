import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, isRtl, translate } from './translate';
import { I18nContext } from './context';

const STORAGE_KEY = 'ui_lang';

const loadLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

// Holds the interface language for one window. The choice is saved (it survives a restart)
// and mirrored on <html lang dir> for screen readers and native controls.
export function I18nProvider({ children }) {
  const [lang, setLang] = useState(loadLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this session only
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  const toggleLanguage = useCallback(() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar')), []);

  const value = useMemo(
    () => ({ lang, setLang, toggleLanguage, t, isAr: lang === 'ar', dir: isRtl(lang) ? 'rtl' : 'ltr' }),
    [lang, t, toggleLanguage]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
