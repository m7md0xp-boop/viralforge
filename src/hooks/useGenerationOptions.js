import { useCallback, useState } from 'react';

// Long-video generation toggles. "Restore defaults" brings them back here.
export const DEFAULT_OPTIONS = { titles: true, description: true, thumbnails: true, customTemplate: true };

export function useGenerationOptions({ t, showToast }) {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const setOption = useCallback((name, value) => setOptions((prev) => ({ ...prev, [name]: value })), []);

  const reset = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    showToast(t('options.resetDone'), 'info');
  }, [t, showToast]);

  return { options, setOption, reset };
}
