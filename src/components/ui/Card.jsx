import { Check, Copy, RefreshCw } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

// Shared building blocks for the cards of the app. Class names stay literal so Tailwind keeps them
// and the light theme overrides in index.css apply.

export function Card({ className = '', children }) {
  return <div className={`bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4 ${className}`}>{children}</div>;
}

export function CardHeader({ icon: Icon, iconClass = 'text-purple-400', title, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 shrink-0 ${iconClass}`} />
        <h3 className="text-base font-semibold text-gray-200">{title}</h3>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">{children}</div>}
    </div>
  );
}

const actionClass =
  'min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gray-800 border border-gray-700 text-gray-200 transition-all';

export function RegenerateButton({ onClick, busy }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`${actionClass} ${busy ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-700 hover:text-purple-400 cursor-pointer'}`}
    >
      <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin text-purple-400' : ''}`} />
      <span>{busy ? t('common.regenerating') : t('common.regenerate')}</span>
    </button>
  );
}

// Copy button with a label. `copy` and `copiedId` come from useCopy.
export function CopyButton({ text, id, label, copy, copiedId }) {
  const { t } = useI18n();
  const done = copiedId === id;
  return (
    <button type="button" onClick={() => copy(text, id)} className={`${actionClass} hover:bg-gray-700 hover:text-emerald-400 cursor-pointer`}>
      {done ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      <span className={done ? 'text-emerald-400 font-semibold' : ''}>{done ? t('common.copied') : label}</span>
    </button>
  );
}

// Icon-only copy button for one item in a list
export function CopyIconButton({ text, id, copy, copiedId, label }) {
  const { t } = useI18n();
  const name = label || t('common.copy');
  return (
    <button
      type="button"
      aria-label={name}
      title={name}
      onClick={() => copy(text, id)}
      className="min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-emerald-400 transition-all cursor-pointer"
    >
      {copiedId === id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
