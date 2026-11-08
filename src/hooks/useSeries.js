import { useCallback, useEffect, useState } from 'react';
import { loadSeriesStore, saveSeriesStore } from '../services/seriesStore';
import { findSeries, forgetSeries, nextEpisode, recordInSeries, seriesPromptContext } from '../utils/series';

// Series memory for the game being typed: last episode, earlier titles, the next episode number,
// and the prompt text that keeps new titles in the series' style without repeats.
export function useSeries(gameName) {
  const [store, setStore] = useState(loadSeriesStore);

  useEffect(() => saveSeriesStore(store), [store]);

  const series = gameName.trim() ? findSeries(store, gameName) : null;

  const record = useCallback((data) => setStore((prev) => recordInSeries(prev, data)), []);
  const forget = useCallback(() => setStore((prev) => forgetSeries(prev, gameName)), [gameName]);

  return {
    series,
    next: series ? nextEpisode(series.lastEpisode) : '',
    promptContext: seriesPromptContext(series),
    record,
    forget
  };
}
