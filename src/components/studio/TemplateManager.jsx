import { useState } from 'react';
import { Tv, Eye, FileText, Check, Save, Edit3 } from 'lucide-react';
import { PRESET_TEMPLATES } from '../../config/templates';
import { useI18n } from '../../i18n/useI18n';

const PLACEHOLDERS = [
  ['{game}', 'text-purple-300'],
  ['{episode}', 'text-emerald-300'],
  ['{channel_name}', 'text-blue-300'],
  ['{channel_link}', 'text-amber-300'],
  ['{subscribe_link}', 'text-amber-300'],
  ['{linktree_link}', 'text-amber-300'],
  ['{discord_link}', 'text-amber-300'],
  ['{ai_description}', 'text-fuchsia-300']
];

// Long-video description template: presets with a preview, the channel it fills in, and the editor.
export default function TemplateManager({ manager, channelProfile, onEditChannel }) {
  const { t } = useI18n();
  const { template, setTemplate, isEditing, justSaved, save, toggleEdit, applyPreset } = manager;
  const [previewId, setPreviewId] = useState('');
  const preview = PRESET_TEMPLATES.find((p) => p.id === previewId) || null;

  return (
    <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400 shrink-0" />
          <h2 className="text-base font-semibold text-gray-200">{t('template.title')}</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700" dir="ltr">
            {t('template.placeholders')}{' '}
            {PLACEHOLDERS.map(([name, color], i) => (
              <span key={name}>
                <code className={color}>{name}</code>
                {i < PLACEHOLDERS.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {justSaved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> {t('template.saved')}
            </span>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={save}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('template.save')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={toggleEdit}
            aria-pressed={isEditing}
            className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isEditing
                ? 'bg-purple-900/40 border-purple-500 text-purple-200 hover:bg-purple-900/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-purple-300 hover:border-purple-500/50'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{t('template.edit')}</span>
          </button>
        </div>
      </div>

      {/* Presets: read the text first, then apply it explicitly */}
      <div className="flex items-center gap-2 w-full sm:w-auto pt-1">
        <label htmlFor="preset-templates-select" className="text-xs font-semibold text-gray-300 shrink-0">
          {t('template.presets')}:
        </label>
        <select
          id="preset-templates-select"
          onChange={(e) => setPreviewId(e.target.value)}
          value={previewId}
          className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-xs text-purple-300 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="" disabled>
            {t('template.presetPlaceholder')}
          </option>
          {PRESET_TEMPLATES.map((preset) => (
            <option key={preset.id} value={preset.id} className="bg-[#151922] text-gray-200">
              {t(`presets.${preset.id}`)}
            </option>
          ))}
        </select>
      </div>

      {preview && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-200">
              <Eye className="w-3.5 h-3.5" />
              {t(`presets.${preview.id}`)}
            </span>
            <button
              type="button"
              onClick={() => applyPreset(preview.id)}
              className="min-h-[34px] px-3 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-semibold hover:brightness-110 transition"
            >
              {t('template.usePreset')}
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-words max-h-36 overflow-y-auto text-[11px] leading-relaxed text-gray-400 font-sans">
            {preview.text.slice(0, 700)}
            {preview.text.length > 700 ? '…' : ''}
          </pre>
        </div>
      )}

      {/* The channel whose values fill the link placeholders */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-[#0d0f14]/60 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Tv className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-200 truncate">{channelProfile?.channelName || t('template.channelNone')}</p>
            <p className="text-[11px] text-gray-500 truncate" dir="ltr">
              {channelProfile?.channelUrl || t('template.channelLinksHint')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditChannel}
          className="min-h-[36px] shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-700 bg-gray-800/80 text-gray-300 hover:text-purple-300 hover:border-purple-500/50 cursor-pointer"
        >
          {t('template.editChannel')}
        </button>
      </div>

      <div className="relative">
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          readOnly={!isEditing}
          rows={9}
          placeholder={t('template.placeholder')}
          className={`w-full p-4 rounded-lg font-mono text-sm border transition-all resize-y ${
            isEditing
              ? 'bg-[#0d0f14] border-purple-500 text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
              : 'bg-[#0d0f14]/60 border-gray-800 text-gray-300 cursor-default focus:outline-none'
          }`}
        />
        {!isEditing && (
          <div className="absolute top-3 ltr:right-3 rtl:left-3 pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-800/90 text-gray-400 border border-gray-700/80">
              {t('template.readOnly')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
