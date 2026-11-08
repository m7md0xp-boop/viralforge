import { useCallback, useEffect, useRef, useState } from 'react';

const writeClipboard = async (text) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Falls back to the textarea method below (older browsers, missing permission)
    }
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    Object.assign(area.style, { position: 'fixed', top: '0', left: '-9999px', opacity: '0' });
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
};

// Copy buttons. `copiedId` marks the button that just copied (shows a check mark for 2 s).
export function useCopy({ t, showToast }) {
  const [copiedId, setCopiedId] = useState(null);
  const timer = useRef(null);

  const copy = useCallback(
    async (text, id, message) => {
      const ok = await writeClipboard(text);
      if (!ok) {
        showToast(t('common.copyFailed'), 'error');
        return false;
      }
      setCopiedId(id);
      showToast(message || t('common.copied'), 'success');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedId(null), 2000);
      return true;
    },
    [t, showToast]
  );

  useEffect(() => () => clearTimeout(timer.current), []);
  return { copiedId, copy };
}
