// Series memory: one entry per game the creator keeps making episodes of.
// Pure functions; the store is a plain object { [key]: series } saved by services/seriesStore.js.

const MAX_TITLES = 40; // titles kept per series (newest first)
const PROMPT_TITLES = 15; // titles sent to the AI to avoid repeats

// Same game written differently ("  Minecraft ", "minecraft") -> same series
export const seriesKey = (game) =>
  String(game || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

// Next episode from the last one, keeping its format:
// "7" -> "8", "07" -> "08", "Part 5" -> "Part 6", "الحلقة ٩" -> "الحلقة 10". Nothing to count -> "".
export function nextEpisode(episode) {
  const text = String(episode || '').trim();
  if (!text) return '';
  // Arabic-Indic digits are read as Western digits
  const western = text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  const match = western.match(/(\d+)(?!.*\d)/);
  if (!match) return '';
  const digits = match[1];
  const next = String(Number(digits) + 1).padStart(digits.length, '0');
  return western.slice(0, match.index) + next + western.slice(match.index + digits.length);
}

// Records one generation. Episode and titles are optional (shorts and live have no episode).
export function recordInSeries(store, { game, episode = '', titles = [], at = new Date().toISOString() }) {
  const key = seriesKey(game);
  if (!key || key === 'my game') return store;
  const prev = store[key] || { game: game.trim(), episodes: [], titles: [], count: 0 };
  const cleanTitles = titles.map((t) => String(t || '').trim()).filter(Boolean);
  const merged = [...cleanTitles, ...prev.titles.filter((t) => !cleanTitles.includes(t))].slice(0, MAX_TITLES);
  const ep = String(episode || '').trim();
  return {
    ...store,
    [key]: {
      game: game.trim(),
      lastEpisode: ep || prev.lastEpisode || '',
      episodes: ep && !prev.episodes.includes(ep) ? [...prev.episodes, ep].slice(-50) : prev.episodes,
      titles: merged,
      count: prev.count + 1,
      updatedAt: at
    }
  };
}

export const findSeries = (store, game) => store[seriesKey(game)] || null;

export const forgetSeries = (store, game) => {
  const { [seriesKey(game)]: _removed, ...rest } = store;
  return rest;
};

// Text added to the prompt so new titles stay in the series' style without repeating old ones
export function seriesPromptContext(series) {
  if (!series || !series.titles.length) return '';
  const titles = series.titles.slice(0, PROMPT_TITLES).join(' | ');
  return (
    `Series memory: this channel has already published content about ${series.game}` +
    (series.lastEpisode ? ` (last episode: ${series.lastEpisode})` : '') +
    `. Keep the same naming pattern and tone as these earlier titles, but never repeat or closely paraphrase them: ${titles}.`
  );
}
