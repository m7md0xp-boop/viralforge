import { AlertCircle, Check } from 'lucide-react';

const STYLES = {
  error: 'bg-red-950/95 border-red-500/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  info: 'bg-[#151922]/95 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
  success: 'bg-[#151922]/95 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
};

// The one toast from useToast. Sits above the sticky footer; announced to screen readers.
export default function Toast({ toast }) {
  if (!toast) return null;
  const { message, type } = toast;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[90vw] w-max">
      <div
        className={`max-w-[90vw] px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-2.5 text-xs sm:text-sm font-medium break-words ${STYLES[type] || STYLES.success}`}
      >
        {type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        ) : type === 'info' ? (
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="break-words">{message}</span>
      </div>
    </div>
  );
}
