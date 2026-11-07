import { getUsage, groupByUsage } from '../config/aiProviders';

// Full class names so Tailwind includes them
export const BADGE_CLASSES = {
  emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
  sky: 'bg-sky-950/60 text-sky-300 border-sky-500/40',
  amber: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
  rose: 'bg-rose-950/60 text-rose-300 border-rose-500/40'
};

// Group headings in the dropdown (the usage phrase itself is shown on each option)
const GROUP_TITLE = {
  free: { ar: 'مجانية بالكامل', en: 'Fully free' },
  'free-limit': { ar: 'مجانية بحد استخدام', en: 'Free with a usage limit' },
  'free-then-paid': { ar: 'مجانية ثم مدفوعة', en: 'Free, then paid' },
  paid: { ar: 'مدفوعة', en: 'Paid' }
};

// Badge: "<provider name> <usage phrase>" in the usage colour
export function UsageBadge({ provider, lang }) {
  const isAr = lang === 'ar';
  const usage = getUsage(provider);
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${BADGE_CLASSES[usage.color]}`}
    >
      {provider.label[isAr ? 'ar' : 'en']} {usage.label[isAr ? 'ar' : 'en']}
    </span>
  );
}

// <optgroup> children for a provider list, free first. Each option shows the name and its usage phrase.
export function UsageOptions({ providers, lang }) {
  const isAr = lang === 'ar';
  return groupByUsage(providers).map((group) => (
    <optgroup key={group.usage} label={GROUP_TITLE[group.usage][isAr ? 'ar' : 'en']}>
      {group.providers.map((p) => (
        <option key={p.id} value={p.id}>
          {p.label[isAr ? 'ar' : 'en']} {getUsage(p).label[isAr ? 'ar' : 'en']}
        </option>
      ))}
    </optgroup>
  ));
}
