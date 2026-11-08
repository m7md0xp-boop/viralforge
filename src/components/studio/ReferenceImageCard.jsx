import { ImageIcon, Trash2, UploadCloud, AlertCircle, Info } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

// Reference photo (the creator's face) for the thumbnail. `image` comes from useReferenceImage.
export default function ReferenceImageCard({ image }) {
  const { t } = useI18n();
  const { inputRef, preview, details, error, isDragging, remove, openPicker, onFileChange, dropHandlers } = image;

  return (
    <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <h3 className="text-base font-semibold text-gray-200">{t('image.uploadTitle')}</h3>
        <span className="text-xs text-gray-500">{t('image.maxSize')}</span>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" id="image-file-input" />

      <div
        {...dropHandlers}
        onClick={openPicker}
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center transition-all duration-200 ${
          isDragging
            ? 'border-purple-500 bg-purple-950/25 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            : 'border-gray-700/80 bg-[#0d0f14]/70 hover:border-purple-500/50 hover:bg-[#0d0f14]'
        } ${!preview ? 'cursor-pointer min-h-[160px]' : 'min-h-[220px]'}`}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <img
              src={preview}
              alt={t('image.previewAlt')}
              className="max-h-[200px] w-auto max-w-full rounded-lg object-contain shadow-lg border border-gray-800"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full pt-2 border-t border-gray-800/80 px-2">
              <div className="text-xs text-gray-300 truncate max-w-full sm:max-w-[240px]">
                <span className="font-medium text-gray-100">{details?.name}</span>
                {details?.size && <span className="text-gray-500 ltr:ml-2 rtl:mr-2">({details.size} MB)</span>}
              </div>
              <button
                type="button"
                onClick={remove}
                className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 hover:text-red-200 transition-all cursor-pointer w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('image.remove')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center pointer-events-none p-2">
            <div className="w-12 h-12 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{t('image.dragDrop')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('image.browse')}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 pt-1 break-words">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {!preview && (
        <p className="text-xs text-purple-400/90 flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{t('image.noImage')}</span>
        </p>
      )}
    </div>
  );
}
