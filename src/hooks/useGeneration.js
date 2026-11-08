import { translations } from '../i18n/translations';
import { buildSectionPrompt, buildSchema, buildThumbnailPrompt } from '../config/prompts';
import { executeTextGeneration, getSpecificApiErrorMessage, getActiveProviderId } from '../services/ai';
import { recordGeneration } from '../utils/history';
import { executeImageGeneration, getImageErrorMessage, getActiveImageProviderId } from '../services/imageGeneration';
import { parseDataUrl } from '../services/imageRequests';
import { getImageProvider } from '../config/aiProviders';
import { CHANNEL_STYLES } from '../services/channelProfile';
import { AI_SLOT, composeDescription, fillPlaceholders, limitHashtags, placeholderValues } from '../utils/placeholders';

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
// Quick mode and chat studio share one pipeline: chat only replaces the game name with the creator's request.
// The App passes its state and setters in `ctx`.
export function useGeneration(ctx) {
  const {
    section,
    selectedPlatforms,
    limits,
    gameName,
    episode,
    template,
    useCustomTemplate,
    channelProfile,
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

  const isChat = activeTab === 'chat';
  // Chat studio: the free-text request is the topic, so the game field is not used
  const gameInfo = () => ({ game: isChat ? '' : gameName.trim() || 'My Game', ep: isChat ? '' : episode.trim() });
  const values = () => {
    const { game, ep } = gameInfo();
    return placeholderValues({ game, episode: ep, profile: channelProfile });
  };
  // Hashtag count follows the selected platforms (3-5 for YouTube). 0 = the platform does not use hashtags.
  const hashtagRange = () => (limits.hashtagMax === 0 ? [0, 0] : limits.hashtagRecommended);
  const templateHasSlot = typeof template === 'string' && template.includes(AI_SLOT);

  const handleGenerationError = (err) => {
    if (!err) return;
    if (err.provider) {
      showToast(getSpecificApiErrorMessage(err.error, err.provider), 'error');
      return;
    }
    showToast(getSpecificApiErrorMessage(err, getActiveProviderId()), 'error');
  };

  // Builds the prompt for the current section and runs it on the active provider. Returns parsed data or null.
  const requestSection = async ({ wantTitles, wantDescription, titleContext = '' }) => {
    const { game, ep } = gameInfo();
    const schema = buildSchema(section, { titles: wantTitles, description: wantDescription });

    const prompt =
      buildSectionPrompt({
        section,
        game,
        ep,
        lang,
        // The AI sees the template with the user's real links, never raw placeholders
        template: templateHasSlot ? '' : fillPlaceholders(template, values()),
        useCustomTemplate,
        templateHasSlot,
        userText: isChat ? chatPrompt.trim() : '',
        wantTitles,
        wantDescription,
        titleContext,
        hashtagRange: hashtagRange(),
        styleHint: CHANNEL_STYLES[channelProfile?.style]?.prompt || ''
      }) + planRules;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    };

    const result = await executeTextGeneration(prompt, requestBody, uiHooks);
    return result ? result.data : null;
  };

  // Final description: template (with the AI text in its slot), real links, then 3-5 unique hashtags
  const finalDescription = (data) => {
    const [, maxTags] = hashtagRange();
    const text = composeDescription({
      template,
      aiText: data.description,
      values: values(),
      useTemplate: useCustomTemplate && section === 'video'
    });
    return composeWithHashtags(text, maxTags > 0 ? limitHashtags(data.hashtags, maxTags) : [], lang);
  };

  const thumbnailFor = (titles, hasReference = Boolean(uploadedImageBase64)) => {
    const { game, ep } = gameInfo();
    const first = Array.isArray(titles) && titles.length ? titles[0] : null;
    const topic = first ? (typeof first === 'string' ? first : first.title) : isChat ? chatPrompt.trim().slice(0, 200) : '';
    return buildThumbnailPrompt({ game: game || topic || 'My Game', ep, topic, hasReference });
  };

  const record = (data) => {
    const { game, ep } = gameInfo();
    recordGeneration({
      contentType: section,
      platforms: selectedPlatforms,
      gameName: game || chatPrompt.trim(),
      episode: ep,
      hasTitles: Array.isArray(data.videoTitles) && data.videoTitles.length > 0,
      hasShorts: Array.isArray(data.templates) && data.templates.length > 0,
      hasDescription: typeof data.description === 'string' && data.description.length > 0
    });
  };

  const handleGenerate = async () => {
    const wantTitles = section === 'video' && genTitles;
    const wantDescription = section !== 'video' || genDescription;
    const wantThumbnail = section === 'video' && genThumbnails;

    if (isChat && !chatPrompt.trim()) {
      showToast(lang === 'ar' ? 'اكتب طلبك أولاً.' : 'Write your request first.', 'error');
      return;
    }
    if (section === 'video' && !wantTitles && !wantDescription && !wantThumbnail) {
      showToast(t('toastNothingSelected'), 'error');
      return;
    }

    setGeneratedImage(null);

    // Thumbnail only: the prompt is built locally, so no API request is needed
    if (section === 'video' && !wantTitles && !wantDescription) {
      setVideoTitles([]);
      setDescription('');
      setImagePrompt(thumbnailFor(videoTitles));
      record({});
      return;
    }

    setIsLoading(true);
    try {
      const data = await requestSection({ wantTitles, wantDescription });
      if (!data) return;

      if (section === 'live') {
        const templates = Array.isArray(data.templates) ? data.templates : [];
        setShortsTitles(templates.map((tpl) => fillPlaceholders(String(tpl), values())));
      } else {
        setVideoTitles(wantTitles && Array.isArray(data.videoTitles) ? data.videoTitles : []);
        setDescription(wantDescription && typeof data.description === 'string' ? finalDescription(data) : '');
        if (wantThumbnail) {
          const titles = wantTitles && Array.isArray(data.videoTitles) ? data.videoTitles : videoTitles;
          setImagePrompt(thumbnailFor(titles));
        } else {
          setImagePrompt('');
        }
      }
      record(data);
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
        setShortsTitles(data.templates.map((tpl) => fillPlaceholders(String(tpl), values())));
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
      if (data && typeof data.description === 'string') setDescription(finalDescription(data));
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingDescription(false);
    }
  };

  const handleExportAll = () => {
    try {
      // Keeps letters (any language), digits, dash and underscore so the file name is valid everywhere
      const gName = (gameInfo().game || 'content').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60) || 'content';
      const exportData = {
        section,
        game: gameInfo().game || chatPrompt.trim(),
        episode: gameInfo().ep,
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
      a.download = `viralforge_${gName}.json`;
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

  const thumbnailText = (hasReference) => imagePrompt || thumbnailFor(videoTitles, hasReference);

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
        prompt: thumbnailText(Boolean(reference) && provider.supportsReference),
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
