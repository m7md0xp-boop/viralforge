// App identity (name in both languages, tagline). Source: shared/brand.json.
import brand from '../../shared/brand.json';

export const BRAND = brand;

// Name shown to the user in a language: the Latin name stays the brand everywhere,
// Arabic screens show the Arabic name next to it.
export const brandName = (lang) => (lang === 'ar' ? `${brand.name} · ${brand.nameAr}` : brand.name);
export const brandTagline = (lang) => brand.tagline[lang] || brand.tagline.en;
