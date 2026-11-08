// Saves the series memory (src/utils/series.js) in this profile's localStorage.
const KEY = 'vf_series_v1';

export function loadSeriesStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSeriesStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch (err) {
    console.warn('Failed to save series memory', err);
  }
}
