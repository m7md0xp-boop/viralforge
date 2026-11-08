import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Cpu, ThumbsUp, Wrench } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import { getProvider } from '../../config/aiProviders';
import { scoreGrade } from '../../utils/imageAnalysis';

const GRADE_COLOR = { excellent: '#10b981', good: '#22c55e', fair: '#f59e0b', weak: '#ef4444' };
const STATUS_ICON = { good: CheckCircle2, warn: AlertTriangle, bad: XCircle };
const STATUS_CLASS = { good: 'text-emerald-400', warn: 'text-amber-400', bad: 'text-red-400' };
const BAR_CLASS = { good: 'bg-emerald-500', warn: 'bg-amber-500', bad: 'bg-red-500' };
const statusOf = (score) => (score >= 75 ? 'good' : score >= 45 ? 'warn' : 'bad');

// Circular gauge with the score in the middle
function ScoreRing({ score, size = 132 }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = GRADE_COLOR[scoreGrade(score)];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${score}/100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fontSize="34" fontWeight="800" fill={color}>
        {score}
      </text>
      <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#94a3b8">
        / 100
      </text>
    </svg>
  );
}

function Bar({ label, score, hint }) {
  const st = statusOf(score);
  const Icon = STATUS_ICON[st];
  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 text-gray-200 min-w-0">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${STATUS_CLASS[st]}`} />
          <span className="truncate">{label}</span>
        </span>
        <span className="tabular-nums text-gray-400 shrink-0" dir="ltr">
          {score}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${BAR_CLASS[st]} transition-all duration-700`} style={{ width: `${Math.max(4, score)}%` }} />
      </div>
      {hint && <p className="text-[11px] text-gray-400 leading-relaxed">{hint}</p>}
    </li>
  );
}

// Final score, the local checks with tips, and the vision model's review when there is one
export default function ScorePanel({ lab }) {
  const { t, lang } = useI18n();
  const { local, ai, score, busy } = lab;
  if (!local) return null;
  const grade = scoreGrade(score);
  const review = ai?.review;

  return (
    <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <ScoreRing score={score} />
        <div className="flex-1 space-y-2 text-center sm:text-start">
          <p className="text-xs text-gray-400">{t('lab.score')}</p>
          <p className="text-2xl font-bold" style={{ color: GRADE_COLOR[grade] }}>
            {t(`lab.grade.${grade}`)}
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs">
            <span className="px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> {t('lab.localScore')}: <b dir="ltr">{local.score}</b>
            </span>
            {review?.score != null && (
              <span className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> {t('lab.aiScore')}: <b dir="ltr">{review.score}</b>
              </span>
            )}
          </div>
          {busy.ai && <p className="text-xs text-purple-300 animate-pulse">{t('lab.aiReviewing')}</p>}
        </div>
      </div>

      {review && (
        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            {t('lab.aiTitle')}
            <span className="text-[11px] font-normal text-gray-500">{t('lab.aiBy', { provider: getProvider(ai.provider).label[lang] })}</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {review.face.score != null && (
              <Bar label={`${t('lab.face')}${review.face.present ? (review.face.emotion ? ` · ${review.face.emotion}` : '') : ` · ${t('lab.noFace')}`}`} score={review.face.score} />
            )}
            {review.text.score != null && (
              <Bar label={`${t('lab.text')}${review.text.content ? ` · «${review.text.content}»` : ` · ${t('lab.noText')}`}`} score={review.text.score} />
            )}
            {review.composition != null && <Bar label={t('lab.composition')} score={review.composition} />}
            {review.curiosity != null && <Bar label={t('lab.curiosity')} score={review.curiosity} />}
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {review.strengths.length > 0 && (
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/20 p-3 space-y-2">
                <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" /> {t('lab.strengths')}
                </p>
                <ul className="space-y-1.5 text-xs text-gray-300 list-disc ps-4">
                  {review.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {review.improvements.length > 0 && (
              <div className="rounded-lg border border-amber-500/25 bg-amber-950/20 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> {t('lab.improvements')}
                </p>
                <ul className="space-y-1.5 text-xs text-gray-300 list-disc ps-4">
                  {review.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          {t('lab.localTitle')}
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {local.checks.map((c) => (
            <Bar key={c.id} label={`${t(`lab.checks.${c.id}`)} (${c.value})`} score={c.score} hint={c.status !== 'good' ? t(`lab.tips.${c.id}`) : ''} />
          ))}
        </ul>
        <p className="text-[11px] text-gray-500">{t('lab.localNote')}</p>
      </section>
    </div>
  );
}
