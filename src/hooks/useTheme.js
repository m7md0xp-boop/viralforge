import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme_preference';

const loadTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

// Dark / light theme. Saved, and applied as a class on <html> and <body> (see index.css).
export function useTheme() {
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable: the theme lasts for this session only
    }
    for (const el of [document.documentElement, document.body]) {
      el.classList.toggle('light', theme === 'light');
      el.classList.toggle('dark', theme !== 'light');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggleTheme };
}
