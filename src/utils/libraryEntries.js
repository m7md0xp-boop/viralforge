// Library of past generations: building entries, searching and copying them. Pure functions.

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// One saved generation. Images are not stored (they are large); their prompt is.
export function createEntry({ studio, game, details, chatPrompt, platforms, results, at = new Date().toISOString() }) {
  const { generatedImage: _image, entryId: _entryId, ...saved } = results || {};
  return {
    id: newId(),
    at,
    studio,
    game: game || '',
    details: details || '',
    chatPrompt: chatPrompt || '',
    platforms: platforms || [],
    favorite: false,
    results: saved
  };
}

// Every title of an entry as plain strings (long-video titles are objects)
export const entryTitles = (entry) => [
  ...(entry.results?.videoTitles || []).map((t) => t.title),
  ...(entry.results?.shortTitles || []),
  ...(entry.results?.liveTitles || [])
];

// Main line shown in the list
export const entryHeadline = (entry) => entryTitles(entry)[0] || entry.results?.description?.split('\n')[0] || entry.chatPrompt || entry.game;

// Everything worth copying, as one text block
export function entryText(entry) {
  const r = entry.results || {};
  const parts = [entryTitles(entry).join('\n'), r.description];
  for (const meta of Object.values(r.streamMeta || {})) {
    parts.push([meta.category, (meta.tags || []).join(', ')].filter(Boolean).join('\n'));
  }
  return parts.filter(Boolean).join('\n\n');
}

// Search (game, details, request, titles, description), studio filter, favourites only. Newest first.
export function filterEntries(entries, { query = '', studio = 'all', favoritesOnly = false } = {}) {
  const q = query.trim().toLowerCase();
  return entries
    .filter((e) => studio === 'all' || e.studio === studio)
    .filter((e) => !favoritesOnly || e.favorite)
    .filter((e) => {
      if (!q) return true;
      const haystack = [e.game, e.details, e.chatPrompt, ...entryTitles(e), e.results?.description].join(' ').toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}
