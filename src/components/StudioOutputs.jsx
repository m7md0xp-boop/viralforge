import { Check, Copy, RefreshCw, Smartphone, FileText, Radio, Tag, FolderOpen } from 'lucide-react';
import { PLATFORMS } from '../config/platforms';
import { countChars, countHashtags } from '../utils/titleCheck';
import { STREAM_META_PLATFORMS } from '../utils/streamMeta';

const T = {
  ar: {
    shortsTitles: 'عناوين YouTube Shorts',
    shortsNoTitle: 'TikTok و Reels و X لا تحتوي حقل عنوان. اختر YouTube Shorts لتوليد عنوان.',
    caption: 'الوصف القصير',
    liveTitles: 'عناوين البث',
    regenerate: 'إعادة توليد',
    regenerating: 'جارٍ التوليد…',
    copyAll: 'نسخ الكل',
    copied: 'تم النسخ!',
    copy: 'نسخ',
    category: 'الفئة',
    tags: 'الوسوم',
    copyTags: 'نسخ الوسوم',
    tagRule: (max, len) => `حتى ${max} وسوم، كل وسم حتى ${len} حرفاً، حروف وأرقام فقط`,
    hashtags: 'هاشتاق',
    over: 'تجاوز الحد',
    metaTitle: (name) => `فئة ووسوم ${name}`
  },
  en: {
    shortsTitles: 'YouTube Shorts titles',
    shortsNoTitle: 'TikTok, Reels and X have no title field. Select YouTube Shorts to generate a title.',
    caption: 'Caption',
    liveTitles: 'Stream titles',
    regenerate: 'Regenerate',
    regenerating: 'Generating…',
    copyAll: 'Copy all',
    copied: 'Copied!',
    copy: 'Copy',
    category: 'Category',
    tags: 'Tags',
    copyTags: 'Copy tags',
    tagRule: (max, len) => `Up to ${max} tags, ${len} characters each, letters and digits only`,
    hashtags: 'hashtags',
    over: 'Over the limit',
    metaTitle: (name) => `${name} category & tags`
  }
};

const card = 'bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4';
const smallBtn =
  'min-h-[40px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-800 border border-gray-700 text-gray-200 transition-all';

function CardHeader({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-purple-400 shrink-0" />
        <h3 className="text-base font-semibold text-gray-200">{title}</h3>
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

function RegenerateButton({ onClick, busy, tx }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`${smallBtn} ${busy ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-700 hover:text-purple-400 cursor-pointer'}`}
    >
      <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin text-purple-400' : ''}`} />
      <span>{busy ? tx.regenerating : tx.regenerate}</span>
    </button>
  );
}

function CopyAllButton({ text, id, label, copyToClipboard, copiedSection, tx }) {
  const done = copiedSection === id;
  return (
    <button
      type="button"
      onClick={() => copyToClipboard(text, id)}
      className={`${smallBtn} hover:bg-gray-700 hover:text-purple-400 cursor-pointer`}
    >
      {done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{done ? tx.copied : label}</span>
    </button>
  );
}

function CopyIcon({ text, id, copyToClipboard, copiedSection, tx }) {
  return (
    <button
      type="button"
      aria-label={tx.copy}
      title={tx.copy}
      onClick={() => copyToClipboard(text, id)}
      className="min-h-[36px] min-w-[36px] shrink-0 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-purple-300 cursor-pointer"
    >
      {copiedSection === id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

// One chip per selected platform: "TikTok Live 28/32". Red when the text is over that platform's limit.
// field: 'title' (titleMax) or 'caption' (captionMax). Platforms without that field are skipped.
export function LimitChips({ text, platforms, field, lang }) {
  const tx = T[lang === 'ar' ? 'ar' : 'en'];
  const length = countChars(text);
  const rows = platforms
    .map((id) => PLATFORMS[id])
    .filter(Boolean)
    .map((p) => ({ p, max: field === 'title' ? p.titleMax : p.captionMax }))
    .filter((r) => typeof r.max === 'number');
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {rows.map(({ p, max }) => {
        const over = length > max;
        return (
          <span
            key={p.id}
            title={over ? tx.over : undefined}
            className={`text-[11px] px-2 py-0.5 rounded-md border tabular-nums ${
              over ? 'bg-red-950/60 border-red-500/50 text-red-300 font-semibold' : 'bg-gray-800/70 border-gray-700 text-gray-400'
            }`}
          >
            {p.label[lang === 'ar' ? 'ar' : 'en']} <span dir="ltr">{length}/{max}</span>
          </span>
        );
      })}
    </div>
  );
}

// Shorts studio: YouTube Shorts titles and the caption, each with per-platform counters
export function ShortsOutput({
  lang,
  platforms,
  shortTitles,
  description,
  copyToClipboard,
  copiedSection,
  onRegenerateTitles,
  isRegeneratingTitles,
  onRegenerateCaption,
  isRegeneratingCaption
}) {
  const tx = T[lang === 'ar' ? 'ar' : 'en'];
  const wantsTitle = platforms.includes('youtube_short');
  const tags = countHashtags(description);
  return (
    <>
      {wantsTitle && shortTitles.length > 0 && (
        <div className={card}>
          <CardHeader icon={Smartphone} title={tx.shortsTitles}>
            <RegenerateButton onClick={onRegenerateTitles} busy={isRegeneratingTitles} tx={tx} />
            <CopyAllButton text={shortTitles.join('\n')} id="short-titles" label={tx.copyAll} copyToClipboard={copyToClipboard} copiedSection={copiedSection} tx={tx} />
          </CardHeader>
          <div className="space-y-2.5">
            {shortTitles.map((title, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#0d0f14] border border-gray-800">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-sm font-medium text-gray-100 break-words">{title}</p>
                  <LimitChips text={title} platforms={['youtube_short']} field="title" lang={lang} />
                </div>
                <CopyIcon text={title} id={`short-title-${i}`} copyToClipboard={copyToClipboard} copiedSection={copiedSection} tx={tx} />
              </div>
            ))}
          </div>
        </div>
      )}
      {!wantsTitle && <p className="text-xs text-gray-500 px-1">{tx.shortsNoTitle}</p>}

      {Boolean(description) && (
        <div className={card}>
          <CardHeader icon={FileText} title={tx.caption}>
            <RegenerateButton onClick={onRegenerateCaption} busy={isRegeneratingCaption} tx={tx} />
            <CopyAllButton text={description} id="short-caption" label={tx.copy} copyToClipboard={copyToClipboard} copiedSection={copiedSection} tx={tx} />
          </CardHeader>
          <pre className="whitespace-pre-wrap break-words text-sm text-gray-200 font-sans leading-relaxed p-3 rounded-lg bg-[#0d0f14] border border-gray-800">
            {description}
          </pre>
          <div className="flex flex-wrap items-center gap-2">
            <LimitChips text={description} platforms={platforms} field="caption" lang={lang} />
            {tags > 0 && (
              <span className="text-[11px] text-gray-500">
                #{tags} {tx.hashtags}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Live studio: stream titles with a counter per platform, and category + tags for Twitch and Kick
export function LiveOutput({ lang, platforms, liveTitles, streamMeta, copyToClipboard, copiedSection, onRegenerate, isRegenerating }) {
  const tx = T[lang === 'ar' ? 'ar' : 'en'];
  const metaBlocks = STREAM_META_PLATFORMS.filter((m) => streamMeta && streamMeta[m.key]);
  return (
    <>
      {liveTitles.length > 0 && (
        <div className={card}>
          <CardHeader icon={Radio} title={tx.liveTitles}>
            <RegenerateButton onClick={onRegenerate} busy={isRegenerating} tx={tx} />
            <CopyAllButton text={liveTitles.join('\n')} id="live-titles" label={tx.copyAll} copyToClipboard={copyToClipboard} copiedSection={copiedSection} tx={tx} />
          </CardHeader>
          <div className="space-y-2.5">
            {liveTitles.map((title, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#0d0f14] border border-gray-800">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-sm font-medium text-gray-100 break-words">{title}</p>
                  <LimitChips text={title} platforms={platforms} field="title" lang={lang} />
                </div>
                <CopyIcon text={title} id={`live-title-${i}`} copyToClipboard={copyToClipboard} copiedSection={copiedSection} tx={tx} />
              </div>
            ))}
          </div>
        </div>
      )}

      {metaBlocks.map(({ key, platformId }) => {
        const meta = streamMeta[key];
        const p = PLATFORMS[platformId];
        const name = p.label[lang === 'ar' ? 'ar' : 'en'];
        return (
          <div key={key} className={card}>
            <CardHeader icon={Tag} title={tx.metaTitle(name)} />
            {meta.category && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0d0f14] border border-gray-800">
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-gray-500 shrink-0">{tx.category}:</span>
                  <span className="text-sm font-semibold text-gray-100 truncate" dir="auto">{meta.category}</span>
                </div>
                <CopyIcon text={meta.category} id={`${key}-category`} copyToClipboard={copyToClipboard} copiedSection={copiedSection} tx={tx} />
              </div>
            )}
            {meta.tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">
                    {tx.tags} <span dir="ltr">({meta.tags.length}/{p.streamTags.maxTags})</span>
                  </span>
                  <CopyAllButton text={meta.tags.join(', ')} id={`${key}-tags`} label={tx.copyTags} copyToClipboard={copyToClipboard} copiedSection={copiedSection} tx={tx} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {meta.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => copyToClipboard(tag, `${key}-tag-${tag}`)}
                      title={tx.copy}
                      className="text-xs px-2.5 py-1 rounded-full bg-purple-950/50 border border-purple-500/40 text-purple-200 hover:border-purple-400 cursor-pointer"
                      dir="auto"
                    >
                      {copiedSection === `${key}-tag-${tag}` ? '✓ ' : ''}
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500">{tx.tagRule(p.streamTags.maxTags, p.streamTags.maxLen)}</p>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
