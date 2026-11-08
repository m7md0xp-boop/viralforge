import { useState } from 'react';
import { buildSectionPrompt, buildSchema, buildThumbnailPrompt } from '../config/prompts';
import { buildPlanRules, strictestLimits } from '../config/platforms';
import { getImageProvider } from '../config/aiProviders';
import { executeTextGeneration, getSpecificApiErrorMessage } from '../services/ai';
import { executeImageGeneration, getImageErrorMessage, getActiveImageProviderId } from '../services/imageGeneration';
import { parseDataUrl } from '../services/imageRequests';
import { CHANNEL_STYLES } from '../services/channelProfile';
import { recordGeneration } from '../utils/history';
import { AI_SLOT, composeDescription, fillPlaceholders, limitHashtags, placeholderValues } from '../utils/placeholders';
import { STREAM_META_PLATFORMS, normalizeStreamMeta } from '../utils/streamMeta';

// Adds the hashtags at the end of the text. Long videos get a labelled block ("Hashtags:"),
// short-form captions just a final line of tags, the way people post them.
export const composeWithHashtags = (text, hashtags, lang, labelled) => {
  const body = (text || '').trim();
  const tags = (Array.isArray(hashtags) ? hashtags : []).filter(Boolean).join(' ');
  if (!tags) return body;
  if (!labelled) return body ? `${body}\n\n${tags}` : tags;
  return `${body}\n\n${lang === 'ar' ? 'الهاشتاقات:' : 'Hashtags:'}\n${tags}`;
};

const asStrings = (list) => (Array.isArray(list) ? list.map((s) => String(s || '').trim()).filter(Boolean) : []);

const EXTERNAL_IMAGE_TOOLS = {
  gemini: { url: 'https://gemini.google.com/', toast: 'video.geminiCopied' },
  chatgpt: { url: 'https://chatgpt.com/', toast: 'video.chatGptCopied' }
};

// Generation, regeneration and export for the three studios:
// video (long YouTube), short (Shorts/TikTok/Reels/X) and live (stream titles, Twitch/Kick category and tags).
// Quick mode and chat mode share one pipeline: chat only replaces the game name with the creator's request.
export function useGeneration({ studio, gameName, chatMode, chatPrompt, options, template, channelProfile, referenceImage, t, lang, showToast, copy }) {
  const { studio: section, platforms, details, results, updateResults } = studio;
  const [busy, setBusy] = useState({}); // { generate, titles, live, description, image }: true while running
  const run = async (name, task) => {
    setBusy((b) => ({ ...b, [name]: true }));
    try {
      await task();
    } finally {
      setBusy((b) => ({ ...b, [name]: false }));
    }
  };

  const limits = strictestLimits(platforms);
  const planRules = buildPlanRules(platforms);
  const uiHooks = { t, showToast };

  // Chat mode: the free-text request is the topic, so the input fields are not used.
  // The second field is the episode for long videos, and free details (the clip, the stream idea) elsewhere.
  const gameInfo = () => ({
    game: chatMode ? '' : gameName.trim() || 'My Game',
    ep: chatMode || section !== 'video' ? '' : details.trim(),
    details: chatMode || section === 'video' ? '' : details.trim()
  });
  const values = () => placeholderValues({ game: gameInfo().game, episode: gameInfo().ep, profile: channelProfile });
  // Hashtag count follows the selected platforms (3-5 for YouTube). 0 = the platform does not use hashtags.
  const hashtagRange = () => (limits.hashtagMax === 0 ? [0, 0] : limits.hashtagRecommended);
  const templateHasSlot = typeof template === 'string' && template.includes(AI_SLOT);
  // Shorts titles only exist on YouTube Shorts; TikTok, Reels and X posts have a caption only
  const shortsNeedTitles = platforms.includes('youtube_short');
  const streamKeys = STREAM_META_PLATFORMS.filter((p) => platforms.includes(p.platformId)).map((p) => p.key);
  const save = (patch) => updateResults(section, patch);

  const showError = (err) => {
    if (!err) return;
    showToast(err.provider ? getSpecificApiErrorMessage(err.error, err.provider, t) : getSpecificApiErrorMessage(err, undefined, t), 'error');
  };

  // Builds the prompt for the current studio and runs it on the active provider. Returns parsed data or null.
  const request = async ({ wantTitles, wantDescription, titleContext = '' }) => {
    const { game, ep, details: clip } = gameInfo();
    const metaKeys = section === 'live' ? streamKeys : [];
    const schema = buildSchema(section, { titles: wantTitles, description: wantDescription, streamPlatforms: metaKeys });
    const prompt =
      buildSectionPrompt({
        section,
        game,
        ep,
        details: clip,
        lang,
        // The AI sees the template with the user's real links, never raw placeholders
        template: templateHasSlot ? '' : fillPlaceholders(template, values()),
        useCustomTemplate: options.customTemplate,
        templateHasSlot,
        userText: chatMode ? chatPrompt.trim() : '',
        wantTitles,
        wantDescription,
        titleContext,
        hashtagRange: hashtagRange(),
        styleHint: CHANNEL_STYLES[channelProfile?.style]?.prompt || '',
        titleMax: limits.titleMax,
        captionMax: limits.captionMax,
        streamPlatforms: metaKeys
      }) + planRules;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema }
    };
    const result = await executeTextGeneration(prompt, body, uiHooks);
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
      useTemplate: options.customTemplate && section === 'video'
    });
    return composeWithHashtags(text, maxTags > 0 ? limitHashtags(data.hashtags, maxTags) : [], lang, section === 'video');
  };

  const liveResults = (data) => ({
    liveTitles: asStrings(data.templates).map((tpl) => fillPlaceholders(tpl, values())),
    streamMeta: normalizeStreamMeta(data, platforms)
  });

  const thumbnailFor = (titles, hasReference = Boolean(referenceImage)) => {
    const { game, ep } = gameInfo();
    const first = Array.isArray(titles) && titles.length ? titles[0] : null;
    const topic = first ? (typeof first === 'string' ? first : first.title) : chatMode ? chatPrompt.trim().slice(0, 200) : '';
    return buildThumbnailPrompt({ game: game || topic || 'My Game', ep, topic, hasReference });
  };

  const record = (data) => {
    const { game, ep } = gameInfo();
    recordGeneration({
      contentType: section,
      platforms,
      gameName: game || chatPrompt.trim(),
      episode: ep,
      hasTitles: asStrings(data.shortTitles).length > 0 || (Array.isArray(data.videoTitles) && data.videoTitles.length > 0),
      hasShorts: Array.isArray(data.templates) && data.templates.length > 0,
      hasDescription: typeof data.description === 'string' && data.description.length > 0
    });
  };

  const generate = () =>
    run('generate', async () => {
      const wantTitles = section === 'video' ? options.titles : section === 'short' ? shortsNeedTitles : false;
      const wantDescription = section === 'video' ? options.description : section === 'short';
      const wantThumbnail = section === 'video' && options.thumbnails;

      if (chatMode && !chatPrompt.trim()) return showToast(t('input.writeRequestFirst'), 'error');
      if (section === 'video' && !wantTitles && !wantDescription && !wantThumbnail) {
        return showToast(t('options.nothingSelected'), 'error');
      }

      // Thumbnail only: the prompt is built locally, so no API request is needed
      if (section === 'video' && !wantTitles && !wantDescription) {
        save({ videoTitles: [], description: '', generatedImage: null, imagePrompt: thumbnailFor(results.videoTitles) });
        record({});
        return;
      }

      try {
        const data = await request({ wantTitles, wantDescription });
        if (!data) return;
        if (section === 'live') {
          save(liveResults(data));
        } else if (section === 'short') {
          save({
            shortTitles: wantTitles ? asStrings(data.shortTitles).slice(0, 3) : [],
            description: typeof data.description === 'string' ? finalDescription(data) : ''
          });
        } else {
          const videoTitles = wantTitles && Array.isArray(data.videoTitles) ? data.videoTitles : [];
          save({
            videoTitles,
            description: wantDescription && typeof data.description === 'string' ? finalDescription(data) : '',
            imagePrompt: wantThumbnail ? thumbnailFor(videoTitles.length ? videoTitles : results.videoTitles) : '',
            generatedImage: null
          });
        }
        record(data);
      } catch (err) {
        showError(err);
      }
    });

  // Long videos and shorts: new titles, avoiding the current ones
  const regenerateTitles = () =>
    run('titles', async () => {
      try {
        if (section === 'short') {
          const data = await request({ wantTitles: true, wantDescription: false, titleContext: results.shortTitles.join(' | ') });
          if (data && Array.isArray(data.shortTitles)) save({ shortTitles: asStrings(data.shortTitles).slice(0, 3) });
        } else {
          const titleContext = results.videoTitles.map((item) => item.title).join(' | ');
          const data = await request({ wantTitles: true, wantDescription: false, titleContext });
          if (data && Array.isArray(data.videoTitles)) save({ videoTitles: data.videoTitles });
        }
      } catch (err) {
        showError(err);
      }
    });

  // Live studio: new stream titles, plus a fresh category and tags
  const regenerateLive = () =>
    run('live', async () => {
      try {
        const data = await request({ wantTitles: false, wantDescription: false, titleContext: results.liveTitles.join(' | ') });
        if (data && Array.isArray(data.templates)) save(liveResults(data));
      } catch (err) {
        showError(err);
      }
    });

  const regenerateDescription = () =>
    run('description', async () => {
      try {
        const data = await request({ wantTitles: false, wantDescription: true });
        if (data && typeof data.description === 'string') save({ description: finalDescription(data) });
      } catch (err) {
        showError(err);
      }
    });

  const exportAll = () => {
    try {
      const { game, ep } = gameInfo();
      // Keeps letters (any language), digits, dash and underscore so the file name is valid everywhere
      const fileName = (game || 'content').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60) || 'content';
      const { generatedImage, ...text } = results; // the image is downloaded from its own button
      const data = { section, game: game || chatPrompt.trim(), episode: ep, platforms, ...text, exportedAt: new Date().toISOString() };
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `viralforge_${fileName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      showToast(t('common.exportDone'), 'success');
    } catch (err) {
      console.warn('Export failed', err);
      showToast(t('common.exportFailed'), 'error');
    }
  };

  const thumbnailText = (hasReference) => results.imagePrompt || thumbnailFor(results.videoTitles, hasReference);

  // Copies the thumbnail prompt and opens Gemini or ChatGPT, where the user attaches their photo
  const copyAndOpen = async (target) => {
    const tool = EXTERNAL_IMAGE_TOOLS[target];
    await copy(thumbnailText(), 'image-prompt', t(tool.toast));
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  // Generates a thumbnail image with the active image provider (Settings > Image provider)
  const generateImage = () =>
    run('image', async () => {
      const provider = getImageProvider(getActiveImageProviderId());
      const reference = parseDataUrl(referenceImage);
      if (reference && !provider.supportsReference) {
        showToast(t('video.refNotSupported', { provider: provider.label[lang] || provider.label.en }), 'info');
      }
      try {
        const result = await executeImageGeneration({
          prompt: thumbnailText(Boolean(reference) && provider.supportsReference),
          reference: provider.supportsReference ? reference : null,
          ui: uiHooks
        });
        if (!result) return;
        save({ generatedImage: { src: `data:${result.mime};base64,${result.base64}`, mime: result.mime, provider: result.provider } });
        showToast(t('video.imageGenerated'), 'success');
      } catch (err) {
        showToast(getImageErrorMessage(err.error, err.provider, t), 'error');
      }
    });

  return {
    busy,
    limits,
    generate,
    regenerateTitles,
    regenerateLive,
    regenerateDescription,
    exportAll,
    copyAndOpen,
    generateImage,
    setImagePrompt: (imagePrompt) => save({ imagePrompt })
  };
}
