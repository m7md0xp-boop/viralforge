import { translations } from '../i18n/translations';
import { buildSectionPrompt, buildSchema, buildThumbnailPrompt } from '../config/prompts';
import { executeTextGeneration, getSpecificApiErrorMessage, getActiveProviderId } from '../services/ai';
import { recordGeneration } from '../utils/history';
import { executeImageGeneration, getImageErrorMessage, getActiveImageProviderId } from '../services/imageGeneration';
import { parseDataUrl } from '../services/imageRequests';
import { getImageProvider } from '../config/aiProviders';

// Adds the hashtags block at the end of the text: "<text>\n\nHashtags:\n#a #b"
const composeWithHashtags = (text, hashtags, lang) => {
  const body = (text || '').trim();
  const tags = (Array.isArray(hashtags) ? hashtags : []).filter(Boolean).join(' ');
  if (!tags) return body;
  const label = lang === 'ar' ? 'الهاشتاقات:' : 'Hashtags:';
  return `${body}\n\n${label}\n${tags}`;
};

// Generation, regeneration, export and copy logic for the three sections:
// video (long YouTube), short (Shorts/TikTok/Reels/X) and live (stream templates).
// The App passes its state and setters in `ctx`.
export function useGeneration(ctx) {
  const {
    section,
    selectedPlatforms,
    gameName,
    episode,
    template,
    useCustomTemplate,
    applyChannelPlaceholders,
    activeTab,
    chatPrompt,
    videoTitles,
    shortsTitles,
    description,
    imagePrompt,
    showToast,
    t,
    lang,
    setIsLoading,
    setVideoTitles,
    setShortsTitles,
    setDescription,
    setImagePrompt,
    setCopiedSection,
    genTitles,
    genDescription,
    genThumbnails,
    planRules,
    uiHooks,
    setIsRegeneratingTitles,
    setIsRegeneratingShorts,
    setIsRegeneratingDescription,
    uploadedImageBase64,
    setGeneratedImage,
    setIsGeneratingImage
  } = ctx;

  const currentSection = () => (activeTab === 'chat' ? 'video' : section);
  const gameInfo = () => ({ game: gameName.trim() || 'My Game', ep: episode.trim() });

  const handleGenerationError = (err) => {
    if (!err) return;
    if (err.provider) {
      showToast(getSpecificApiErrorMessage(err.error, err.provider), 'error');
      return;
    }
    showToast(getSpecificApiErrorMessage(err, getActiveProviderId()), 'error');
  };

  // Builds the prompt for one section and runs it on the active provider. Returns parsed data or null.
  const requestSection = async ({ wantTitles, wantDescription, titleContext = '' }) => {
    const { game, ep } = gameInfo();
    const sec = currentSection();
    const isChat = activeTab === 'chat';
    const schema = buildSchema(sec, { titles: wantTitles, description: wantDescription });

    const prompt = buildSectionPrompt({
      section: sec,
      game,
      ep,
      lang,
      template,
      useCustomTemplate,
      userText: isChat ? chatPrompt.trim() || 'Create YouTube content' : '',
      wantTitles,
      wantDescription,
      titleContext
    });

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    };

    const result = await executeTextGeneration(prompt + planRules, requestBody, uiHooks);
    return result ? result.data : null;
  };

  const thumbnailFor = (game, ep, titles) => {
    const topic = Array.isArray(titles) && titles.length ? (typeof titles[0] === 'string' ? titles[0] : titles[0].title) : '';
    return buildThumbnailPrompt({ game, ep, topic });
  };

  const handleGenerate = async () => {
    const sec = currentSection();
    const isChat = activeTab === 'chat';
    const wantTitles = isChat || (sec === 'video' && genTitles);
    const wantDescription = isChat || sec !== 'video' || genDescription;
    const wantThumbnail = isChat || (sec === 'video' && genThumbnails);

    if (sec === 'video' && !wantTitles && !wantDescription && !wantThumbnail) {
      setVideoTitles([]);
      setDescription('');
      setImagePrompt('');
      return;
    }

    const { game, ep } = gameInfo();
    setGeneratedImage(null);
    setIsLoading(true);
    try {
      const data = await requestSection({ wantTitles, wantDescription });
      if (!data) return;

      if (sec === 'live' && !isChat) {
        const templates = Array.isArray(data.templates) ? data.templates : [];
        setShortsTitles(templates.map((tpl) => applyChannelPlaceholders(tpl)));
      } else {
        if (wantTitles && Array.isArray(data.videoTitles)) {
          setVideoTitles(data.videoTitles);
        } else {
          setVideoTitles([]);
        }
        if (typeof data.description === 'string') {
          setDescription(applyChannelPlaceholders(composeWithHashtags(data.description, data.hashtags, lang)));
        } else {
          setDescription('');
        }
        if (wantThumbnail) {
          const titles = wantTitles && Array.isArray(data.videoTitles) ? data.videoTitles : videoTitles;
          setImagePrompt(thumbnailFor(game, ep, titles));
        } else {
          setImagePrompt('');
        }
      }

      recordGeneration({
        contentType: isChat ? 'video' : sec,
        platforms: selectedPlatforms,
        gameName: game,
        episode: ep,
        hasTitles: Array.isArray(data.videoTitles) && data.videoTitles.length > 0,
        hasShorts: Array.isArray(data.templates) && data.templates.length > 0,
        hasDescription: typeof data.description === 'string' && data.description.length > 0
      });
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateTitles = async () => {
    setIsRegeneratingTitles(true);
    try {
      const titleContext = videoTitles.map((item) => item.title).join(' | ');
      const data = await requestSection({ wantTitles: true, wantDescription: false, titleContext });
      if (data && Array.isArray(data.videoTitles)) setVideoTitles(data.videoTitles);
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingTitles(false);
    }
  };

  // Live section: regenerates the stream templates
  const handleRegenerateShorts = async () => {
    setIsRegeneratingShorts(true);
    try {
      const data = await requestSection({ wantTitles: false, wantDescription: false });
      if (data && Array.isArray(data.templates)) {
        setShortsTitles(data.templates.map((tpl) => applyChannelPlaceholders(tpl)));
      }
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingShorts(false);
    }
  };

  const handleRegenerateDescription = async () => {
    setIsRegeneratingDescription(true);
    try {
      const data = await requestSection({ wantTitles: false, wantDescription: true });
      if (data && typeof data.description === 'string') {
        setDescription(applyChannelPlaceholders(composeWithHashtags(data.description, data.hashtags, lang)));
      }
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingDescription(false);
    }
  };

  const handleExportAll = () => {
    try {
      const gName = gameName.trim() || 'game';
      const exportData = {
        section: currentSection(),
        game: gameName.trim() || 'My Game',
        episode: episode.trim() || '',
        videoTitles,
        templates: shortsTitles,
        description,
        imagePrompt: imagePrompt || '',
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const objectURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectURL;
      a.download = `youtube_metadata_${gName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectURL), 100);

      showToast(t('toastExportSuccess'), 'success');
    } catch (err) {
      console.warn('Export failed', err);
      showToast('Export failed', 'error');
    }
  };

  const copyToClipboard = async (text, sectionId, customToast) => {
    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '-9999px';
        textArea.style.opacity = '0';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedSection(sectionId);
      showToast(customToast || t('toastCopied'), 'success');
      setTimeout(() => {
        setCopiedSection((curr) => (curr === sectionId ? null : curr));
      }, 2000);
    } else {
      showToast(t('toastCopyFailed'), 'error');
    }
    return copied;
  };

  const thumbnailText = () => imagePrompt || thumbnailFor(gameInfo().game, gameInfo().ep, videoTitles);

  const handleCopyAndOpenGemini = async () => {
    await copyToClipboard(thumbnailText(), 'image-prompt', translations[lang]['toastGeminiPromptCopied']);
    window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer');
  };

  const handleCopyAndOpenChatGPT = async () => {
    await copyToClipboard(thumbnailText(), 'image-prompt', translations[lang]['toastChatGptPromptCopied']);
    window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
  };

  // Generates a thumbnail image with the active image provider (Settings > Image provider)
  const handleGenerateImage = async () => {
    const provider = getImageProvider(getActiveImageProviderId());
    const reference = parseDataUrl(uploadedImageBase64);
    if (reference && !provider.supportsReference) {
      showToast(
        lang === 'ar'
          ? `${provider.label.ar} لا يدعم صورتك المرجعية، سيتم التوليد بدونها.`
          : `${provider.label.en} does not support your reference photo. Generating without it.`,
        'info'
      );
    }

    setIsGeneratingImage(true);
    try {
      const result = await executeImageGeneration({
        prompt: thumbnailText(),
        reference: provider.supportsReference ? reference : null,
        ui: uiHooks
      });
      if (!result) return;
      setGeneratedImage({ src: `data:${result.mime};base64,${result.base64}`, mime: result.mime, provider: result.provider });
      showToast(lang === 'ar' ? 'تم توليد الصورة.' : 'Image generated.', 'success');
    } catch (err) {
      showToast(getImageErrorMessage(err.error, err.provider), 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    handleGenerationError,
    handleGenerateImage,
    handleGenerate,
    handleRegenerateTitles,
    handleRegenerateShorts,
    handleRegenerateDescription,
    handleExportAll,
    copyToClipboard,
    handleCopyAndOpenGemini,
    handleCopyAndOpenChatGPT
  };
}
