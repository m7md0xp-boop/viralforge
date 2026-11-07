import { useState } from 'react';
import { ClipboardPaste, Check } from 'lucide-react';
import { readClipboardText } from '../services/clipboard';

// Pastes the clipboard text into a field with one click. `onPaste(text)` receives the text.
export default function PasteButton({ onPaste, lang = 'ar', onError, className = '' }) {
  const [done, setDone] = useState(false);
  const isAr = lang === 'ar';

  const handleClick = async () => {
    try {
      const text = (await readClipboardText()).trim();
      if (!text) {
        onError?.(isAr ? 'الحافظة فارغة.' : 'Clipboard is empty.');
        return;
      }
      onPaste(text);
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    } catch {
      onError?.(isAr ? 'تعذّر قراءة الحافظة. انسخ النص أولاً ثم حاول مرة أخرى.' : 'Could not read the clipboard. Copy the text and try again.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isAr ? 'لصق سريع' : 'Quick paste'}
      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer ${className}`}
    >
      {done ? <Check className="w-3 h-3 text-emerald-400" /> : <ClipboardPaste className="w-3 h-3" />}
      <span>{isAr ? 'لصق سريع' : 'Paste'}</span>
    </button>
  );
}
