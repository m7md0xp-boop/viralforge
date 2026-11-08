import { useState } from 'react';
import { MoreVertical, Smartphone, Monitor, ListVideo, Sun, Moon, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import { countChars } from '../../utils/titleCheck';

// Colours of the YouTube page in each mode. Inline styles on purpose: the preview must look the same
// whatever the app theme is (the app's light-theme overrides in index.css target Tailwind classes).
const THEMES = {
  dark: { page: '#0f0f0f', title: '#f1f1f1', meta: '#aaaaaa', placeholder: '#272727', placeholder2: '#3f3f3f' },
  light: { page: '#ffffff', title: '#0f0f0f', meta: '#606060', placeholder: '#e5e5e5', placeholder2: '#d0d0d0' }
};
const FONT = 'Roboto, "Segoe UI", Arial, sans-serif';

// Characters that fit in the two title lines of each layout (approximate)
const TITLE_FIT = { mobile: 70, desktop: 70, sidebar: 50 };

const DEVICES = [
  { id: 'mobile', icon: Smartphone },
  { id: 'desktop', icon: Monitor },
  { id: 'sidebar', icon: ListVideo }
];

const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

function Thumb({ src, radius, colors, width }) {
  return (
    <div style={{ position: 'relative', width, aspectRatio: '16 / 9', borderRadius: radius, overflow: 'hidden', background: colors.placeholder, flexShrink: 0 }}>
      {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      {src && (
      <span
        style={{
          position: 'absolute',
          insetInlineEnd: 6,
          bottom: 6,
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          padding: '1px 4px',
          borderRadius: 4,
          fontFamily: FONT,
          direction: 'ltr'
        }}
      >
        18:42
      </span>
      )}
    </div>
  );
}

function Avatar({ name, size }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#a855f7,#10b981)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.42,
        flexShrink: 0,
        fontFamily: FONT
      }}
    >
      {(name || '?').trim().charAt(0).toUpperCase()}
    </div>
  );
}

// A video in the feed: the creator's own (real thumbnail and title) or a grey placeholder around it
function VideoCard({ device, colors, src, title, channel, meta, placeholder = false }) {
  const bar = (w, h = 12) => <div style={{ width: w, height: h, borderRadius: 4, background: colors.placeholder2 }} />;
  const titleEl = placeholder ? (
    <div style={{ display: 'grid', gap: 6, width: '100%' }}>
      {bar('92%')}
      {bar('60%')}
    </div>
  ) : (
    <div dir="auto" style={{ ...clamp2, color: colors.title, fontFamily: FONT, fontWeight: device === 'mobile' ? 500 : 600, fontSize: device === 'desktop' ? 16 : 14, lineHeight: device === 'desktop' ? '22px' : '20px' }}>
      {title}
    </div>
  );
  const metaEl = placeholder ? (
    bar('45%', 10)
  ) : (
    <div style={{ color: colors.meta, fontFamily: FONT, fontSize: device === 'desktop' ? 14 : 12, lineHeight: '18px', marginTop: 4 }}>
      <div dir="auto">{channel}</div>
      <div>{meta}</div>
    </div>
  );

  if (device === 'sidebar') {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <Thumb src={placeholder ? null : src} radius={8} colors={colors} width={168} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {titleEl}
          <div style={{ marginTop: 6 }}>{metaEl}</div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Thumb src={placeholder ? null : src} radius={device === 'mobile' ? 0 : 12} colors={colors} width="100%" />
      <div style={{ display: 'flex', gap: 12, padding: device === 'mobile' ? '10px 12px 0' : '12px 0 0', alignItems: 'flex-start' }}>
        {placeholder ? <div style={{ width: 36, height: 36, borderRadius: '50%', background: colors.placeholder2, flexShrink: 0 }} /> : <Avatar name={channel} size={36} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          {titleEl}
          <div style={{ marginTop: 6 }}>{metaEl}</div>
        </div>
        {!placeholder && <MoreVertical size={18} color={colors.meta} style={{ flexShrink: 0, marginTop: 2 }} />}
      </div>
    </div>
  );
}

// How the thumbnail and title will look on YouTube: phone feed, desktop grid or "Up next" list,
// in dark or light mode, between neighbouring videos.
export default function YouTubePreview({ image, title, channelName }) {
  const { t } = useI18n();
  const [device, setDevice] = useState('mobile');
  const [mode, setMode] = useState('dark');
  const colors = THEMES[mode];
  const shownTitle = title.trim() || t('preview.titleFallback');
  const tooLong = countChars(title) > TITLE_FIT[device];
  const card = { device, colors, src: image, title: shownTitle, channel: channelName || t('preview.channelFallback'), meta: t('preview.meta') };

  const toggle = (active) =>
    `min-h-[36px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
      active ? 'bg-purple-600 text-white' : 'bg-gray-800/80 text-gray-400 hover:text-gray-200'
    }`;

  return (
    <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-200">{t('preview.title')}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {DEVICES.map(({ id, icon: Icon }) => (
            <button key={id} type="button" aria-pressed={device === id} onClick={() => setDevice(id)} className={toggle(device === id)}>
              <Icon className="w-3.5 h-3.5" />
              {t(`preview.${id}`)}
            </button>
          ))}
          <span className="w-px h-6 bg-gray-700 mx-1" />
          <button type="button" aria-pressed={mode === 'dark'} onClick={() => setMode('dark')} className={toggle(mode === 'dark')}>
            <Moon className="w-3.5 h-3.5" />
            {t('preview.dark')}
          </button>
          <button type="button" aria-pressed={mode === 'light'} onClick={() => setMode('light')} className={toggle(mode === 'light')}>
            <Sun className="w-3.5 h-3.5" />
            {t('preview.light')}
          </button>
        </div>
      </div>

      {/* The mock page */}
      <div className="rounded-xl overflow-hidden border border-gray-800" style={{ background: colors.page }}>
        {device === 'mobile' && (
          <div style={{ maxWidth: 380, margin: '0 auto', padding: '12px 0', display: 'grid', gap: 18 }}>
            <VideoCard {...card} />
            <VideoCard {...card} placeholder />
          </div>
        )}
        {device === 'desktop' && (
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            <VideoCard {...card} />
            <VideoCard {...card} placeholder />
            <VideoCard {...card} placeholder />
          </div>
        )}
        {device === 'sidebar' && (
          <div style={{ maxWidth: 420, margin: '0 auto', padding: 12, display: 'grid', gap: 10 }}>
            <VideoCard {...card} placeholder />
            <VideoCard {...card} />
            <VideoCard {...card} placeholder />
          </div>
        )}
      </div>

      {!image && <p className="text-xs text-gray-500">{t('preview.noImage')}</p>}
      {tooLong && (
        <p className="text-xs text-amber-300 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {t('preview.longTitle', { n: TITLE_FIT[device] })}
        </p>
      )}
      <p className="text-[11px] text-gray-500">{t('preview.note')}</p>
    </div>
  );
}
