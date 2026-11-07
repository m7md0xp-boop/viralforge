// Safe localStorage reader that falls back to defaults and warns if corrupted (invalid JSON)
export const safeGetLocalStorage = (key, fallback) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }

    if (raw === 'undefined' || raw === 'null') {
      console.warn(`Corrupted localStorage entry for "${key}". Falling back to default.`);
      return fallback;
    }

    const trimmed = raw.trim();
    // If it starts with JSON syntax { or [, and is not a placeholder template like {game}
    const isPlaceholderStart = /^\{(game|episode|ep)\}/i.test(trimmed);
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && !isPlaceholderStart) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string') return parsed;
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.template === 'string') return parsed.template;
          if (typeof parsed.apiKey === 'string') return parsed.apiKey;
          if (typeof parsed.key === 'string') return parsed.key;
        }
        return raw;
      } catch (jsonErr) {
        console.warn(`Corrupted localStorage data for "${key}" (invalid JSON). Falling back to default.`, jsonErr);
        return fallback;
      }
    }

    return raw;
  } catch (err) {
    console.warn(`Failed to access localStorage for "${key}". Falling back to default.`, err);
    return fallback;
  }
};
