import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeImage, prepareForVision, readFileAsDataUrl } from '../services/thumbnailAnalyzer';
import { pickVisionProvider, reviewThumbnail } from '../services/vision';
import { getSpecificApiErrorMessage } from '../services/ai';
import { combineScores } from '../utils/imageAnalysis';

const MAX_BYTES = 15 * 1024 * 1024;

// Thumbnail Lab: the image under review, its local checks (run at once, on the device),
// the optional vision-model review, and the title used for the preview.
export function useThumbnailLab({ t, lang, showToast }) {
  const [image, setImage] = useState(null); // data URL
  const [title, setTitle] = useState('');
  const [local, setLocal] = useState(null); // { score, checks, metrics, source }
  const [ai, setAi] = useState(null); // { review, provider }
  const [busy, setBusy] = useState({ local: false, ai: false });
  const run = useRef(0); // ignores results of an image that was replaced meanwhile

  const load = useCallback(
    async (src) => {
      const id = ++run.current;
      setImage(src);
      setAi(null);
      setLocal(null);
      setBusy({ local: true, ai: false });
      try {
        const result = await analyzeImage(src);
        if (id === run.current) setLocal(result);
      } catch {
        if (id === run.current) {
          setImage(null);
          showToast(t('lab.readError'), 'error');
        }
      } finally {
        if (id === run.current) setBusy((b) => ({ ...b, local: false }));
      }
    },
    [t, showToast]
  );

  const loadFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) return showToast(t('image.onlyImages'), 'error');
      if (file.size > MAX_BYTES) return showToast(t('image.tooBig'), 'error');
      load(await readFileAsDataUrl(file));
    },
    [load, t, showToast]
  );

  // Ctrl+V of an image anywhere on the Lab page
  useEffect(() => {
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
      if (item) loadFile(item.getAsFile());
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile]);

  const reviewWithAi = useCallback(async () => {
    if (!image) return;
    const id = run.current;
    setBusy((b) => ({ ...b, ai: true }));
    try {
      const prepared = await prepareForVision(image);
      const result = await reviewThumbnail({ image: prepared, title, lang });
      if (id !== run.current) return;
      if (!result) showToast(t('lab.aiUnavailable'), 'info');
      else setAi(result);
    } catch (err) {
      showToast(getSpecificApiErrorMessage(err?.error || err, err?.provider, t), 'error');
    } finally {
      setBusy((b) => ({ ...b, ai: false }));
    }
  }, [image, title, lang, t, showToast]);

  const clear = () => {
    run.current++;
    setImage(null);
    setLocal(null);
    setAi(null);
  };

  return {
    image,
    title,
    setTitle,
    local,
    ai,
    busy,
    score: local ? combineScores(local.score, ai?.review?.score) : null,
    visionAvailable: Boolean(pickVisionProvider()),
    load,
    loadFile,
    reviewWithAi,
    clear
  };
}
