import { Smartphone, FileText } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import { countHashtags } from '../../utils/titleCheck';
import { Card, CardHeader, CopyButton, CopyIconButton, RegenerateButton } from '../ui/Card';
import { LimitChips } from './LimitChips';

// Shorts studio: YouTube Shorts titles and the caption, each with per-platform counters
export default function ShortsResults({ results, platforms, generation, copy, copiedId }) {
  const { t } = useI18n();
  const { shortTitles, description } = results;
  const wantsTitle = platforms.includes('youtube_short');
  const tags = countHashtags(description);

  return (
    <>
      {wantsTitle && shortTitles.length > 0 && (
        <Card>
          <CardHeader icon={Smartphone} title={t('shorts.titles')}>
            <RegenerateButton onClick={generation.regenerateTitles} busy={generation.busy.titles} />
            <CopyButton text={shortTitles.join('\n')} id="short-titles" label={t('common.copyAll')} copy={copy} copiedId={copiedId} />
          </CardHeader>
          <div className="space-y-2.5">
            {shortTitles.map((title, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#0d0f14] border border-gray-800">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-sm font-medium text-gray-100 break-words">{title}</p>
                  <LimitChips text={title} platforms={['youtube_short']} field="title" />
                </div>
                <CopyIconButton text={title} id={`short-title-${i}`} copy={copy} copiedId={copiedId} />
              </div>
            ))}
          </div>
        </Card>
      )}
      {!wantsTitle && <p className="text-xs text-gray-500 px-1">{t('shorts.noTitle')}</p>}

      {Boolean(description) && (
        <Card>
          <CardHeader icon={FileText} title={t('shorts.caption')}>
            <RegenerateButton onClick={generation.regenerateDescription} busy={generation.busy.description} />
            <CopyButton text={description} id="short-caption" label={t('common.copy')} copy={copy} copiedId={copiedId} />
          </CardHeader>
          <pre className="whitespace-pre-wrap break-words text-sm text-gray-200 font-sans leading-relaxed p-3 rounded-lg bg-[#0d0f14] border border-gray-800">
            {description}
          </pre>
          <div className="flex flex-wrap items-center gap-2">
            <LimitChips text={description} platforms={platforms} field="caption" />
            {tags > 0 && (
              <span className="text-[11px] text-gray-500">
                #{tags} {t('shorts.hashtags')}
              </span>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
