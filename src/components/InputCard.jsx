import { useState } from 'react';
import { translations } from '../i18n/translations';
import { PRESET_TEMPLATES } from '../config/templates';
import { USER_CONFIG } from '../config/userConfig';
import ContentPlanner from './ContentPlanner';
import ToggleSwitch from './ToggleSwitch';
import PasteButton from './PasteButton';
import { Eye, Zap, MessageSquare, Mic, Info, Loader2, FileText, Check, Save, Edit3, ImageIcon, Trash2, UploadCloud, AlertCircle, SlidersHorizontal, X } from 'lucide-react';

export default function InputCard({ showToast, setActiveTab, activeTab, lang, gameName, setGameName, episode, setEpisode, chatPrompt, setChatPrompt, isRecording, handleToggleVoiceInput, contentType, setContentType, selectedPlatforms, setSelectedPlatforms, handleGenerate, isLoading, saveStatus, isEditing, handleSaveClick, handleToggleEdit, handleSelectPresetTemplate, channelName, handleChannelNameChange, channelLink, handleChannelLinkChange, template, setTemplate, fileInputRef, handleFileChange, handleDragOver, handleDragEnter, handleDragLeave, handleDrop, uploadedImage, isDragging, imageDetails, handleRemoveImage, imageError, handleResetGenerationOptions, genTitles, setGenTitles, genShorts, setGenShorts, genDescription, setGenDescription, genThumbnails, setGenThumbnails, useCustomTemplate, setUseCustomTemplate }) {
  const [previewPresetId, setPreviewPresetId] = useState('');
  const previewPreset = PRESET_TEMPLATES.find((p) => p.id === previewPresetId) || null;
  return (
    <>
      {/* Input Card with Tabbed Interface */}
      <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-5">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{translations[lang]['quickModeTab']}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{translations[lang]['chatStudioTab']}</span>
          </button>
        </div>

        {/* Tab 1: Quick Mode (Game Name & Episode) */}
        {activeTab === 'quick' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="game-name" className="block text-sm font-medium text-gray-300">
                  {translations[lang]['gameNameLabel']}
                </label>
                <PasteButton lang={lang} onPaste={setGameName} onError={(msg) => showToast?.(msg, 'error')} />
              </div>
              <input
                id="game-name"
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder={translations[lang]['gameNamePlaceholder']}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="episode-number" className="block text-sm font-medium text-gray-300">
                  {translations[lang]['episodeLabel']}
                </label>
                <PasteButton lang={lang} onPaste={setEpisode} onError={(msg) => showToast?.(msg, 'error')} />
              </div>
              <input
                id="episode-number"
                type="text"
                value={episode}
                onChange={(e) => setEpisode(e.target.value)}
                placeholder={translations[lang]['episodePlaceholder']}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm sm:text-base"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Chat Studio (Custom Prompt Textarea & Note) */}
        {activeTab === 'chat' && (
          <div className="space-y-2.5 animate-fade-in">
            <div className="relative">
              <textarea
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                rows={5}
                placeholder={translations[lang]['chatStudioPlaceholder']}
                className="w-full p-4 pb-12 rounded-lg bg-[#0d0f14] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all resize-y"
              />
              <button
                type="button"
                aria-label={isRecording ? 'إيقاف التسجيل الصوتي' : 'إدخال صوتي'}
                onClick={handleToggleVoiceInput}
                className={`min-h-[36px] min-w-[36px] absolute bottom-3 right-3 p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                    : 'bg-gray-800/90 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-purple-300 shadow-sm'
                }`}
                title={isRecording ? (lang === 'ar' ? 'إيقاف التسجيل الصوتي' : 'Stop voice recording') : (lang === 'ar' ? 'إدخال صوتي' : 'Voice input')}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce text-white' : 'text-purple-400'}`} />
              </button>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed flex items-start gap-1.5">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>{translations[lang]['chatStudioNote']}</span>
            </p>
          </div>
        )}

        <ContentPlanner
          lang={lang}
          contentType={contentType}
          setContentType={setContentType}
          selectedPlatforms={selectedPlatforms}
          setSelectedPlatforms={setSelectedPlatforms}
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className={`w-full min-h-[44px] py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-emerald-600 shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            isLoading
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:from-purple-500 hover:to-emerald-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>{translations[lang]['generatingBtn']}</span>
            </>
          ) : (
            <span>{translations[lang]['generateBtn']}</span>
          )}
        </button>
      </div>

      {/* Template Manager */}
      <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400 shrink-0" />
            <h2 className="text-base font-semibold text-gray-200">
              {translations[lang]['templateTitle']}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
              {translations[lang]['placeholdersInfo']} <code className="text-purple-300">{"{game}"}</code>, <code className="text-emerald-300">{"{episode}"}</code>, <code className="text-blue-300">{"{channel_name}"}</code>, <code className="text-amber-300">{"{channel_link}"}</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> {translations[lang]['savedText']}
              </span>
            )}
            {isEditing && (
              <button
                type="button"
                onClick={handleSaveClick}
                className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{translations[lang]['saveTemplateBtn']}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleEdit}
              aria-pressed={isEditing}
              className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isEditing
                  ? 'bg-purple-900/40 border-purple-500 text-purple-200 hover:bg-purple-900/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-purple-300 hover:border-purple-500/50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{translations[lang]['editTemplateBtn']}</span>
            </button>
          </div>
        </div>

        {/* Pre-made Description Templates Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="preset-templates-select" className="text-xs font-semibold text-gray-300 shrink-0">
              {translations[lang]['presetTemplatesLabel']}:
            </label>
            <select
              id="preset-templates-select"
              onChange={(e) => setPreviewPresetId(e.target.value)}
              value={previewPresetId}
              className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-xs text-purple-300 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="" disabled>{translations[lang]['selectPresetPlaceholder']}</option>
              {PRESET_TEMPLATES.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-[#151922] text-gray-200">
                  {preset.name[lang] || preset.name['ar']}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template preview: read the text first, then apply it explicitly */}
        {previewPreset && (
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-200">
                <Eye className="w-3.5 h-3.5" />
                {previewPreset.name[lang] || previewPreset.name['ar']}
              </span>
              <button
                type="button"
                onClick={() => handleSelectPresetTemplate({ target: { value: previewPreset.id } })}
                className="min-h-[34px] px-3 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-semibold hover:brightness-110 transition"
              >
                {lang === 'ar' ? 'استخدام القالب' : 'Use template'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-words max-h-36 overflow-y-auto text-[11px] leading-relaxed text-gray-400 font-sans">
              {previewPreset.text.slice(0, 700)}{previewPreset.text.length > 700 ? '…' : ''}
            </pre>
          </div>
        )}

        {/* Channel Name and URL Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label htmlFor="channel-name-field" className="block text-xs font-semibold text-gray-300">
              {translations[lang]['channelNameLabel']}
            </label>
            <input
              id="channel-name-field"
              type="text"
              value={channelName}
              onChange={handleChannelNameChange}
              placeholder={USER_CONFIG.channelName}
              className="w-full min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="channel-link-field" className="block text-xs font-semibold text-gray-300">
              {translations[lang]['channelUrlLabel']}
            </label>
            <input
              id="channel-link-field"
              type="text"
              value={channelLink}
              onChange={handleChannelLinkChange}
              placeholder={USER_CONFIG.channelUrl}
              className="w-full min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0d0f14] border border-gray-700 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            readOnly={!isEditing}
            rows={9}
            className={`w-full p-4 rounded-lg font-mono text-sm border transition-all resize-y ${
              isEditing
                ? 'bg-[#0d0f14] border-purple-500 text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                : 'bg-[#0d0f14]/60 border-gray-800 text-gray-300 cursor-default focus:outline-none'
            }`}
            placeholder={translations[lang]['templatePlaceholder']}
          />
          {!isEditing && (
            <div className="absolute top-3 ltr:right-3 rtl:left-3 pointer-events-none">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-800/90 text-gray-400 border border-gray-700/80">
                {translations[lang]['readOnlyBadge']}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Image Upload Area */}
      <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-semibold text-gray-200">
            {translations[lang]['imageUploadTitle']}
          </h3>
          <span className="text-xs text-gray-500">{translations[lang]['maxSizeText']}</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-file-input"
        />

        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!uploadedImage && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center transition-all duration-200 ${
            isDragging
              ? 'border-purple-500 bg-purple-950/25 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'border-gray-700/80 bg-[#0d0f14]/70 hover:border-purple-500/50 hover:bg-[#0d0f14]'
          } ${!uploadedImage ? 'cursor-pointer min-h-[160px]' : 'min-h-[220px]'}`}
        >
          {uploadedImage ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <img
                src={uploadedImage}
                alt="Uploaded thumbnail preview"
                className="max-h-[200px] w-auto max-w-full rounded-lg object-contain shadow-lg border border-gray-800"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full pt-2 border-t border-gray-800/80 px-2">
                <div className="text-xs text-gray-300 truncate max-w-full sm:max-w-[240px] text-center sm:ltr:text-left sm:rtl:text-right">
                  <span className="font-medium text-gray-100">{imageDetails?.name || 'Image'}</span>
                  {imageDetails?.size && (
                    <span className="text-gray-500 ltr:ml-2 rtl:mr-2">({imageDetails.size} MB)</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 hover:text-red-200 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{translations[lang]['removeImageBtn']}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center pointer-events-none p-2">
              <div className="w-12 h-12 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {translations[lang]['dragDropText']}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {translations[lang]['browseText']}
                </p>
              </div>
            </div>
          )}
        </div>

        {imageError && (
          <p className="text-xs text-red-400 flex items-center gap-1.5 pt-1 break-words">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{imageError}</span>
          </p>
        )}

        {!uploadedImage && (
          <p className="text-xs text-purple-400/90 flex items-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{translations[lang]['noImageNote']}</span>
          </p>
        )}
      </div>

      {/* Generation Options (Toggles) */}
      <div className="bg-[#151922] border border-gray-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-gray-200">
              {translations[lang]['generationOptionsTitle']}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleResetGenerationOptions}
            className="min-h-[32px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-gray-800/80 hover:bg-red-950/50 text-gray-300 hover:text-red-300 border border-gray-700/80 hover:border-red-500/40 transition-all cursor-pointer shadow-sm"
            title={translations[lang]['resetOptionsBtn']}
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
            <span>{translations[lang]['resetOptionsBtn']}</span>
          </button>
        </div>
        {(contentType === 'video' || activeTab === 'chat') ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          <ToggleSwitch
            label={translations[lang]['toggleTitles']}
            note={translations[lang]['noteTitles']}
            checked={genTitles}
            onChange={(val) => setGenTitles(val)}
          />
          <ToggleSwitch
            label={translations[lang]['toggleDescription']}
            note={translations[lang]['noteDescription']}
            checked={genDescription}
            onChange={(val) => setGenDescription(val)}
          />
          <ToggleSwitch
            label={translations[lang]['toggleThumbnails']}
            note={translations[lang]['noteThumbnails']}
            checked={genThumbnails}
            onChange={(val) => setGenThumbnails(val)}
          />
        </div>
        ) : (
          <p className="text-xs text-gray-400 pt-1">
            {contentType === 'short'
              ? (lang === 'ar' ? 'القسم القصير يولّد وصفاً موجزاً وهاشتاقات رائجة تلقائياً.' : 'Short videos generate a brief caption and trending hashtags automatically.')
              : (lang === 'ar' ? 'قسم البث المباشر يولّد قوالب عناوين وأوصاف مختصرة تلقائياً.' : 'Live streams generate short, catchy stream templates automatically.')}
          </p>
        )}

        {/* Template Toggle (iOS-style switch with explanatory note) */}
        <div className="pt-2 border-t border-gray-800/80">
          <ToggleSwitch
            label={translations[lang]['toggleCustomTemplate']}
            note={translations[lang]['customTemplateNote']}
            checked={useCustomTemplate}
            onChange={(val) => setUseCustomTemplate(val)}
          />
        </div>
      </div>

    </>
  );
}
