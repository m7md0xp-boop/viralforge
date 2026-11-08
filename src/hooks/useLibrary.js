import { useCallback, useEffect, useState } from 'react';
import { clearEntries, deleteEntry, listEntries, pruneEntries, saveEntry } from '../services/library';
import { createEntry } from '../utils/libraryEntries';

// Library of past generations (IndexedDB). Every generation is added automatically;
// regenerating titles or a description updates the same entry.
export function useLibrary() {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    listEntries()
      .then(pruneEntries)
      .then((list) => alive && setEntries(list))
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  // Saves a new generation and returns its id
  const add = useCallback((data) => {
    const entry = createEntry(data);
    setEntries((prev) => [entry, ...prev]);
    saveEntry(entry);
    return entry.id;
  }, []);

  // Merges new results into an entry (after a regeneration)
  const updateResults = useCallback((id, patch) => {
    if (!id) return;
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const { generatedImage: _image, ...savedPatch } = patch;
        const next = { ...e, results: { ...e.results, ...savedPatch } };
        saveEntry(next);
        return next;
      })
    );
  }, []);

  const toggleFavorite = useCallback((id) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e, favorite: !e.favorite };
        saveEntry(next);
        return next;
      })
    );
  }, []);

  const remove = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    deleteEntry(id);
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    clearEntries();
  }, []);

  return { entries, loaded, add, updateResults, toggleFavorite, remove, clear };
}
