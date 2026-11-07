// Local usage history for the dashboard. Stored in this profile's localStorage only (never sent anywhere).
const KEY = 'vf_history_v1';
const MAX_ENTRIES = 300;

export function loadHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function recordGeneration({ contentType, platforms, gameName, episode, hasTitles, hasShorts, hasDescription }) {
  const entry = {
    at: new Date().toISOString(),
    contentType: contentType || 'video',
    platforms: Array.isArray(platforms) ? platforms : [],
    game: (gameName || '').slice(0, 60),
    episode: (episode || '').slice(0, 20),
    hasTitles: Boolean(hasTitles),
    hasShorts: Boolean(hasShorts),
    hasDescription: Boolean(hasDescription)
  };
  try {
    const list = [entry, ...loadHistory()].slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to save history', err);
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function computeStats(list) {
  const byPlatform = {};
  const byType = {};
  let withDescription = 0;
  for (const e of list) {
    if (e.hasDescription) withDescription++;
    byType[e.contentType] = (byType[e.contentType] || 0) + 1;
    for (const p of e.platforms) byPlatform[p] = (byPlatform[p] || 0) + 1;
  }
  const sortDesc = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);
  return {
    total: list.length,
    withDescription,
    byPlatform: sortDesc(byPlatform),
    byType: sortDesc(byType),
    recent: list.slice(0, 6)
  };
}
