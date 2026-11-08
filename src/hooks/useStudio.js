import { useCallback, useEffect, useState } from 'react';
import { CONTENT_TYPES, loadContentPlan, normalizePlan } from '../config/platforms';

export const EMPTY_RESULTS = {
  videoTitles: [], // long videos: [{ title, score, seo, ctr }]
  shortTitles: [], // YouTube Shorts titles: [string]
  liveTitles: [], // stream titles: [string]
  streamMeta: null, // { twitch?: { category, tags }, kick?: {...} }
  description: '', // long video description or short caption
  imagePrompt: '', // editable thumbnail prompt
  generatedImage: null, // { src, mime, provider } from the image provider
  entryId: null // library entry of this result (regenerations update it)
};

const emptyByStudio = (value) => Object.fromEntries(CONTENT_TYPES.map((type) => [type, value]));

// The open studio and everything that belongs to one studio:
// its selected platforms (saved), its second input field and its results (kept while switching studios).
export function useStudio() {
  const [plan, setPlan] = useState(loadContentPlan);
  const [resultsByStudio, setResultsByStudio] = useState(() => emptyByStudio(EMPTY_RESULTS));
  // Episode (long videos), clip details (shorts) or stream idea (live)
  const [detailsByStudio, setDetailsByStudio] = useState(() => emptyByStudio(''));

  const studio = plan.contentType;

  useEffect(() => {
    try {
      localStorage.setItem('content_plan', JSON.stringify(plan));
    } catch {
      // Storage unavailable: the plan lasts for this session only
    }
  }, [plan]);

  const setStudio = useCallback((type) => setPlan((prev) => normalizePlan({ ...prev, contentType: type })), []);

  // Accepts a list or an updater function (current list -> new list), like a React setter
  const setPlatforms = useCallback(
    (update) =>
      setPlan((prev) => {
        const current = prev.platformsByType[prev.contentType];
        const next = typeof update === 'function' ? update(current) : update;
        return normalizePlan({ ...prev, platformsByType: { ...prev.platformsByType, [prev.contentType]: next } });
      }),
    []
  );

  // Results are written to the studio that asked for them, even if the user has switched studios since
  const updateResults = useCallback(
    (type, patch) => setResultsByStudio((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } })),
    []
  );

  const setDetails = useCallback((value) => setDetailsByStudio((prev) => ({ ...prev, [studio]: value })), [studio]);
  const setDetailsFor = useCallback((type, value) => setDetailsByStudio((prev) => ({ ...prev, [type]: value })), []);

  const results = resultsByStudio[studio];
  const hasResults =
    results.videoTitles.length > 0 ||
    results.shortTitles.length > 0 ||
    results.liveTitles.length > 0 ||
    Boolean(results.description) ||
    Boolean(results.imagePrompt);

  return {
    studio,
    setStudio,
    platforms: plan.platformsByType[studio],
    setPlatforms,
    details: detailsByStudio[studio],
    setDetails,
    setDetailsFor,
    results,
    hasResults,
    updateResults
  };
}
