import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_BYTES = 10 * 1024 * 1024;

// The reference photo (the creator's face) for thumbnails: file picker, drag and drop, preview and base64.
export function useReferenceImage({ t, showToast }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null); // object URL for <img>
  const [base64, setBase64] = useState(null); // data URL sent to image providers
  const [details, setDetails] = useState(null); // { name, size (MB) }
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Object URLs hold memory until revoked
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const fail = (message) => {
    setError(message);
    showToast(message, 'error');
    resetInput();
  };

  const accept = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) return fail(t('image.onlyImages'));
    if (file.size > MAX_BYTES) return fail(t('image.tooBig'));

    setPreview(URL.createObjectURL(file));
    setDetails({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) });
    const reader = new FileReader();
    reader.onload = () => setBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const remove = useCallback((e) => {
    e?.stopPropagation();
    setPreview(null);
    setBase64(null);
    setDetails(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return {
    inputRef,
    preview,
    base64,
    details,
    error,
    isDragging,
    remove,
    openPicker: () => !preview && inputRef.current?.click(),
    onFileChange: (e) => accept(e.target.files?.[0]),
    dropHandlers: {
      onDragOver: (e) => {
        stop(e);
        setIsDragging(true);
      },
      onDragEnter: (e) => {
        stop(e);
        setIsDragging(true);
      },
      onDragLeave: (e) => {
        stop(e);
        setIsDragging(false);
      },
      onDrop: (e) => {
        stop(e);
        setIsDragging(false);
        accept(e.dataTransfer.files?.[0]);
      }
    }
  };
}
