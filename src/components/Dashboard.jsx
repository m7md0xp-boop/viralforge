import { useMemo, useState } from 'react';
import { Layers, FileText, Film, Radio, Trash2 } from 'lucide-react';
import { PLATFORMS } from '../config/platforms';
import { loadHistory, computeStats, clearHistory } from '../utils/history';

const TYPE_LABEL = {
  video: { ar: 'مقاطع الفيديو', en: 'Videos' },
  short: { ar: 'شورتس / ريلز', en: 'Shorts / Reels' },
  live: { ar: 'بث مباشر', en: 'Live streams' }
};
const TYPE_ICON = { video: Film, short: Layers, live: Radio };

function Tile({ icon: Icon, label, value, accent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
      <div className={`absolute -top-10 -left-10 w-28 h-28 rounded-full blur-2xl opacity-30 ${accent}`} />
      <Icon className="w-5 h-5 text-gray-400 mb-3" />
      <div className="text-2xl sm:text-3xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function Bars({ rows, labelOf, max, color }) {
  if (rows.length === 0) return <p className="text-xs text-gray-500">—</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map(([key, count]) => (
        <li key={key}>
          <div className="flex justify-between text-xs mb-1 text-gray-300">
            <span className="truncate">{labelOf(key)}</span>
            <span className="tabular-nums text-gray-400">{count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.max(6, (count / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard({ lang }) {
  const isAr = lang === 'ar';
  const [version, setVersion] = useState(0);
  const stats = useMemo(() => computeStats(loadHistory()), [version]);
  const platformMax = stats.byPlatform[0]?.[1] || 1;
  const typeMax = stats.byType[0]?.[1] || 1;
  const platformName = (id) => PLATFORMS[id]?.label?.[isAr ? 'ar' : 'en'] || id;
  const typeName = (id) => TYPE_LABEL[id]?.[isAr ? 'ar' : 'en'] || id;

  const handleClear = () => {
    if (!window.confirm(isAr ? 'حذف سجل الاستخدام لهذا المستخدم؟' : 'Clear this user’s usage history?')) return;
    clearHistory();
    setVersion((v) => v + 1);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{isAr ? 'لوحة المتابعة' : 'Dashboard'}</h2>
          <p className="text-xs text-gray-400 mt-1">{isAr ? 'إحصائيات محلية تخص هذا المستخدم فقط.' : 'Local stats for this user only.'}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="min-h-[40px] px-3 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-red-300 hover:border-red-400/40 transition flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {isAr ? 'مسح السجل' : 'Clear'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Tile icon={Layers} label={isAr ? 'إجمالي عمليات التوليد' : 'Total generations'} value={stats.total} accent="bg-purple-500" />
        <Tile icon={FileText} label={isAr ? 'فيديوهات بوصف مولّد' : 'Videos with a description'} value={stats.withDescription} accent="bg-emerald-500" />
        <Tile icon={Radio} label={isAr ? 'المنصات المستخدمة' : 'Platforms used'} value={stats.byPlatform.length} accent="bg-fuchsia-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold mb-4">{isAr ? 'أكثر المنصات استخداماً' : 'Most-used platforms'}</h3>
          <Bars rows={stats.byPlatform.slice(0, 6)} labelOf={platformName} max={platformMax} color="bg-gradient-to-r from-purple-500 to-fuchsia-400" />
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold mb-4">{isAr ? 'حسب نوع المحتوى' : 'By content type'}</h3>
          <Bars rows={stats.byType} labelOf={typeName} max={typeMax} color="bg-gradient-to-r from-emerald-500 to-teal-300" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h3 className="text-sm font-semibold mb-4">{isAr ? 'آخر العمليات' : 'Recent generations'}</h3>
        {stats.recent.length === 0 ? (
          <p className="text-xs text-gray-500">{isAr ? 'لا توجد عمليات بعد. ابدأ بتوليد أول محتوى.' : 'No generations yet. Create your first one.'}</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {stats.recent.map((e, i) => {
              const Icon = TYPE_ICON[e.contentType] || Layers;
              return (
                <li key={i} className="py-2.5 flex items-center gap-3 text-xs">
                  <Icon className="w-4 h-4 text-purple-300 shrink-0" />
                  <span className="truncate flex-1">{e.game || (isAr ? 'بدون اسم' : 'Untitled')}{e.episode ? ` · #${e.episode}` : ''}</span>
                  <span className="text-gray-500 shrink-0 tabular-nums">{new Date(e.at).toLocaleDateString(isAr ? 'ar' : 'en')}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
