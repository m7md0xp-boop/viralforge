import { translations } from '../i18n/translations';
import { buildSectionPrompt, buildSchema, buildThumbnailPrompt } from '../config/prompts';
import { executeTextGeneration, getSpecificApiErrorMessage, getActiveProviderId } from '../services/ai';
import { recordGeneration } from '../utils/history';
import { executeImageGeneration, getImageErrorMessage, getActiveImageProviderId } from '../services/imageGeneration';
import { parseDataUrl } from '../services/imageRequests';
import { getImageProvider } from '../config/aiProviders';
import { CHANNEL_STYLES } from '../services/channelProfile';
import { AI_SLOT, composeDescription, fillPlaceholders, limitHashtags, placeholderValues } from '../utils/placeholders';
import { STREAM_META_PLATFORMS, normalizeStreamMeta } from '../utils/streamMeta';

// Adds the hashtags at the end of the text. Long videos get a labelled block ("Hashtags:"),
// short-form captions just a final line of tags, the way people post them.
const composeWithHashtags = (text, hashtags, lang, labelled) => {
  const body = (text || '').trim();
  const tags = (Array.isArray(hashtags) ? hashtags : []).filter(Boolean).join(' ');
  if (!tags) return body;
  if (!labelled) return body ? `${body}\n\n${tags}` : tags;
  const label = lang === 'ar' ? 'الهاشتاقات:' : 'Hashtags:';
  return `${body}\n\n${label}\n${tags}`;
};

const asStrings = (list) => (Array.isArray(list) ? list.map((s) => String(s || '').trim()).filter(Boolean) : []);

// Generation, regeneration, export and copy logic for the three studios:
// video (long YouTube), short (Shorts/TikTok/Reels/X) and live (stream titles, Twitch/Kick category and tags).
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
    shortTitles,
    liveTitles,
    streamMeta,
    description,
    imagePrompt,
    showToast,
    t,
    lang,
    setIsLoading,
    setVideoTitles,
    setShortTitles,
    setLiveTitles,
    setStreamMeta,
    setDescription,
    setImagePrompt,
    setCopiedSection,
    genTitles,
    genDescription,
    genThumbnails,
    planRules,
    uiHooks,
    setIsRegeneratingTitles,
    setIsRegeneratingLive,
    setIsRegeneratingDescription,
    uploadedImageBase64,
    setGeneratedImage,
    setIsGeneratingImage
  } = ctx;

  const isChat = activeTab === 'chat';
  // Chat studio: the free-text request is the topic, so the input fields are not used.
  // The second field is the episode for long videos, and free details (the clip, the stream idea) elsewhere.
  const gameInfo = () => ({
    game: isChat ? '' : gameName.trim() || 'My Game',
    ep: isChat || section !== 'video' ? '' : episode.trim(),
    details: isChat || section === 'video' ? '' : episode.trim()
  });
  const values = () => {
    const { game, ep } = gameInfo();
    return placeholderValues({ game, episode: ep, profile: channelProfile });
  };
  // Hashtag count follows the selected platforms (3-5 for YouTube). 0 = the platform does not use hashtags.
  const hashtagRange = () => (limits.hashtagMax === 0 ? [0, 0] : limits.hashtagRecommended);
  const templateHasSlot = typeof template === 'string' && template.includes(AI_SLOT);
  // Shorts titles only exist on YouTube Shorts; TikTok, Reels and X posts have a caption only
  const shortsNeedTitles = selectedPlatforms.includes('youtube_short');
  const streamPlatforms = STREAM_META_PLATFORMS.filter((p) => selectedPlatforms.includes(p.platformId)).map((p) => p.key);

  const handleGenerationError = (err) => {
    if (!err) return;
    if (err.provider) {
      showToast(getSpecificApiErrorMessage(err.error, err.provider), 'error');
      return;
    }
    showToast(getSpecificApiErrorMessage(err, getActiveProviderId()), 'error');
  };

  // Builds the prompt for the current studio and runs it on the active provider. Returns parsed data or null.
  const requestSection = async ({ wantTitles, wantDescription, titleContext = '', withStreamMeta = true }) => {
    const { game, ep, details } = gameInfo();
    const metaKeys = section === 'live' && withStreamMeta ? streamPlatforms : [];
    const schema = buildSchema(section, { titles: wantTitles, description: wantDescription, streamPlatforms: metaKeys });

    const prompt =
      buildSectionPrompt({
        section,
        game,
        ep,
        details,
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
        styleHint: CHANNEL_STYLES[channelProfile?.style]?.prompt || '',
        titleMax: limits.titleMax,
        captionMax: limits.captionMax,
        streamPlatforms: metaKeys
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

  // Final description: template (with the AI text in its slot) for long videos, real links,
  // then the right number of unique hashtags
  const finalDescription = (data) => {
    const [, maxTags] = hashtagRange();
    const text = composeDescription({
      template,
      aiText: data.description,
      values: values(),
      useTemplate: useCustomTemplate && section === 'video'
    });
    return composeWithHashtags(text, maxTags > 0 ? limitHashtags(data.hashtags, maxTags) : [], lang, section === 'video');
  };

  const liveTitlesFrom = (data) => asStrings(data.templates).map((tpl) => fillPlaceholders(tpl, values()));

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
      hasTitles:
        (Array.isArray(data.videoTitles) && data.videoTitles.length > 0) ||
        (Array.isArray(data.shortTitles) && data.shortTitles.length > 0),
      hasShorts: Array.isArray(data.templates) && data.templates.length > 0,
      hasDescription: typeof data.description === 'string' && data.description.length > 0
    });
  };

  const handleGenerate = async () => {
    const wantTitles = section === 'video' ? genTitles : section === 'short' ? shortsNeedTitles : false;
    const wantDescription = section === 'video' ? genDescription : section === 'short';
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
        setLiveTitles(liveTitlesFrom(data));
        setStreamMeta(normalizeStreamMeta(data, selectedPlatforms));
      } else if (section === 'short') {
        setShortTitles(wantTitles ? asStrings(data.shortTitles).slice(0, 3) : []);
        setDescription(typeof data.description === 'string' ? finalDescription(data) : '');
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

  // Long videos and shorts: new titles, avoiding the current ones
  const handleRegenerateTitles = async () => {
    setIsRegeneratingTitles(true);
    try {
      if (section === 'short') {
        const data = await requestSection({ wantTitles: true, wantDescription: false, titleContext: shortTitles.join(' | ') });
        if (data && Array.isArray(data.shortTitles)) setShortTitles(asStrings(data.shortTitles).slice(0, 3));
      } else {
        const titleContext = videoTitles.map((item) => item.title).join(' | ');
        const data = await requestSection({ wantTitles: true, wantDescription: false, titleContext });
        if (data && Array.isArray(data.videoTitles)) setVideoTitles(data.videoTitles);
      }
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingTitles(false);
    }
  };

  // Live studio: new stream titles, plus a fresh category and tags
  const handleRegenerateLive = async () => {
    setIsRegeneratingLive(true);
    try {
      const data = await requestSection({ wantTitles: false, wantDescription: false, titleContext: liveTitles.join(' | ') });
      if (data && Array.isArray(data.templates)) {
        setLiveTitles(liveTitlesFrom(data));
        setStreamMeta(normalizeStreamMeta(data, selectedPlatforms));
      }
    } catch (err) {
      handleGenerationError(err);
    } finally {
      setIsRegeneratingLive(false);
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
        shortTitles,
        liveTitles,
        streamMeta,
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
    handleRegenerateLive,
    handleRegenerateDescription,
    handleExportAll,
    copyToClipboard,
    handleCopyAndOpenGemini,
    handleCopyAndOpenChatGPT
  };
}
