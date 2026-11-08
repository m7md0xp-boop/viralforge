import { Radio, Tag, FolderOpen } from 'lucide-react';
import { PLATFORMS } from '../../config/platforms';
import { useI18n } from '../../i18n/useI18n';
import { pick } from '../../i18n/translate';
import { STREAM_META_PLATFORMS } from '../../utils/streamMeta';
import { Card, CardHeader, CopyButton, CopyIconButton, RegenerateButton } from '../ui/Card';
import { LimitChips } from './LimitChips';

// Category and tags of one live platform (Twitch, Kick)
function StreamMetaCard({ metaKey, meta, copy, copiedId }) {
  const { t, lang } = useI18n();
  const platform = PLATFORMS[meta.platformId];

  return (
    <Card>
      <CardHeader icon={Tag} title={t('live.metaTitle', { name: pick(platform.label, lang) })} />
      {meta.category && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0d0f14] border border-gray-800">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-gray-500 shrink-0">{t('live.category')}:</span>
            <span className="text-sm font-semibold text-gray-100 truncate" dir="auto">
              {meta.category}
            </span>
          </div>
          <CopyIconButton text={meta.category} id={`${metaKey}-category`} copy={copy} copiedId={copiedId} />
        </div>
      )}
      {meta.tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-gray-400">
              {t('live.tags')}{' '}
              <span dir="ltr">
                ({meta.tags.length}/{platform.streamTags.maxTags})
              </span>
            </span>
            <CopyButton text={meta.tags.join(', ')} id={`${metaKey}-tags`} label={t('live.copyTags')} copy={copy} copiedId={copiedId} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => copy(tag, `${metaKey}-tag-${tag}`)}
                title={t('common.copy')}
                className="text-xs px-2.5 py-1 rounded-full bg-purple-950/50 border border-purple-500/40 text-purple-200 hover:border-purple-400 cursor-pointer"
                dir="auto"
              >
                {copiedId === `${metaKey}-tag-${tag}` ? '✓ ' : ''}
                {tag}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">{t('live.tagRule', { max: platform.streamTags.maxTags, len: platform.streamTags.maxLen })}</p>
        </div>
      )}
    </Card>
  );
}

// Live studio: stream titles with a counter per platform, and category + tags for Twitch and Kick
export default function LiveResults({ results, platforms, generation, copy, copiedId }) {
  const { t } = useI18n();
  const { liveTitles, streamMeta } = results;

  return (
    <>
      {liveTitles.length > 0 && (
        <Card>
          <CardHeader icon={Radio} title={t('live.titles')}>
            <RegenerateButton onClick={generation.regenerateLive} busy={generation.busy.live} />
            <CopyButton text={liveTitles.join('\n')} id="live-titles" label={t('common.copyAll')} copy={copy} copiedId={copiedId} />
          </CardHeader>
          <div className="space-y-2.5">
            {liveTitles.map((title, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#0d0f14] border border-gray-800">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-sm font-medium text-gray-100 break-words">{title}</p>
                  <LimitChips text={title} platforms={platforms} field="title" />
                </div>
                <CopyIconButton text={title} id={`live-title-${i}`} copy={copy} copiedId={copiedId} />
              </div>
            ))}
          </div>
        </Card>
      )}
      {STREAM_META_PLATFORMS.filter(({ key }) => streamMeta?.[key]).map(({ key }) => (
        <StreamMetaCard key={key} metaKey={key} meta={streamMeta[key]} copy={copy} copiedId={copiedId} />
      ))}
    </>
  );
}
