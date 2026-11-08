import { getUsage, groupByUsage } from '../../config/aiProviders';
import { useI18n } from '../../i18n/useI18n';
import { pick } from '../../i18n/translate';

// Full class names so Tailwind includes them
const BADGE_CLASSES = {
  emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
  sky: 'bg-sky-950/60 text-sky-300 border-sky-500/40',
  amber: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
  rose: 'bg-rose-950/60 text-rose-300 border-rose-500/40'
};

// Badge: "<provider name> <usage phrase>" in the usage colour.
// Provider names and usage phrases come from shared/aiProviders.json (also read by the desktop main process).
export function UsageBadge({ provider }) {
  const { lang } = useI18n();
  const usage = getUsage(provider);
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${BADGE_CLASSES[usage.color]}`}>
      {pick(provider.label, lang)} {pick(usage.label, lang)}
    </span>
  );
}

// <optgroup> children for a provider list, free first. Each option shows the name and its usage phrase.
export function UsageOptions({ providers }) {
  const { lang, t } = useI18n();
  return groupByUsage(providers).map((group) => (
    <optgroup key={group.usage} label={t(`usage.${group.usage}`)}>
      {group.providers.map((p) => (
        <option key={p.id} value={p.id}>
          {pick(p.label, lang)} {pick(getUsage(p).label, lang)}
        </option>
      ))}
    </optgroup>
  ));
}
