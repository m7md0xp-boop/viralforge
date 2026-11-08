// Translation lookup. Pure functions (no React) so services and tests can use them too.
import ar from './locales/ar.js';
import en from './locales/en.js';

export const LOCALES = { ar, en };
export const LANGUAGES = ['ar', 'en'];
export const DEFAULT_LANGUAGE = 'ar';
export const FALLBACK_LANGUAGE = 'en';

const lookup = (tree, key) => key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), tree);

// Replaces {name} with vars.name. Placeholders without a value are kept as they are
// (some texts show template placeholders such as {channel_link} on purpose).
export const interpolate = (text, vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match)) : text;

// translate('ar', 'settings.keyRequired', { provider: 'Groq' }).
// Missing in this language -> English -> the key itself (so a missing text is visible, never blank).
export function translate(lang, key, vars) {
  const value = lookup(LOCALES[lang], key) ?? lookup(LOCALES[FALLBACK_LANGUAGE], key);
  return typeof value === 'string' ? interpolate(value, vars) : key;
}

export const isRtl = (lang) => lang === 'ar';

// Picks the right side of a { ar, en } object (catalog data such as provider and platform names)
export const pick = (labels, lang) => (labels && (labels[lang] ?? labels.en)) || '';

// Every leaf key ("common.copy", ...) of a locale. Used by the tests to compare languages.
export function flattenKeys(tree, prefix = '') {
  return Object.entries(tree).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flattenKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );
}
