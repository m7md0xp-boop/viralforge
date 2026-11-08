import { useCallback, useEffect, useRef, useState } from 'react';

const DURATION_MS = 2500;

// One toast at a time. type: 'success' | 'info' | 'error'.
export function useToast() {
  const [toast, setToast] = useState(null); // { message, type } | null
  const timer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  return { toast, showToast };
}
