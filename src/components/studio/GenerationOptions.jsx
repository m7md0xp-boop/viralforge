import { SlidersHorizontal, X } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';
import ToggleSwitch from '../ui/ToggleSwitch';

const TOGGLES = ['titles', 'description', 'thumbnails'];

// Long-video toggles (titles, description, thumbnail) and the custom-template switch.
// `generationOptions` comes from useGenerationOptions.
export default function GenerationOptions({ generationOptions }) {
  const { t } = useI18n();
  const { options, setOption, reset } = generationOptions;

  return (
    <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-semibold text-gray-200">{t('options.title')}</h3>
        </div>
        <button
          type="button"
          onClick={reset}
          title={t('options.reset')}
          className="min-h-[32px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-gray-800/80 hover:bg-red-950/50 text-gray-300 hover:text-red-300 border border-gray-700/80 hover:border-red-500/40 transition-all cursor-pointer shadow-sm"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
          <span>{t('options.reset')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
        {TOGGLES.map((name) => (
          <ToggleSwitch
            key={name}
            label={t(`options.${name}`)}
            note={t(`options.${name}Note`)}
            checked={options[name]}
            onChange={(value) => setOption(name, value)}
          />
        ))}
      </div>

      <div className="pt-2 border-t border-gray-800/80">
        <ToggleSwitch
          label={t('options.customTemplate')}
          note={t('options.customTemplateNote')}
          checked={options.customTemplate}
          onChange={(value) => setOption('customTemplate', value)}
        />
      </div>
    </div>
  );
}
