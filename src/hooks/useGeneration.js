import { translations } from '../i18n/translations';
import { STORAGE_KEY, DEFAULT_TEMPLATE } from '../config/templates';
import { YOUTUBE_TITLE_VARIANTS, SHORTS_TITLE_VARIANTS, DESCRIPTION_HOOKS } from '../config/titleVariants';
import { safeGetLocalStorage } from '../utils/storage';
import { getSecret } from '../services/secrets';
import { executeTextGeneration, getSpecificApiErrorMessage } from '../services/ai';

// Generation, regeneration, export and copy logic. The App passes its state and setters in `ctx`.
export function useGeneration(ctx) {
  const { gameName, episode, template, applyChannelPlaceholders, activeTab, chatPrompt, videoTitles, showToast, genTitles, genShorts, genDescription, genThumbnails, setVideoTitles, setShortsTitles, setDescription, setImagePrompt, t, setIsLoading, lang, useCustomTemplate, planRules, uiHooks, setIsRegeneratingTitles, description, setIsRegeneratingShorts, setIsRegeneratingDescription, shortsTitles, imagePrompt, setCopiedSection } = ctx;

const getCleanInputs = () => {
  const game = gameName.trim() || 'My Game';
  const ep = episode.trim();
  const gameTag = game.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'game';
  const epClean = ep.replace(/[^a-zA-Z0-9]/g, '');
  const epTag = epClean ? `ep${epClean}` : '';
  return { game, ep, gameTag, epTag };
};

const generateTitlesData = (cycleIndex) => {
  const { game, ep } = getCleanInputs();
  const set = YOUTUBE_TITLE_VARIANTS[cycleIndex % YOUTUBE_TITLE_VARIANTS.length];
  return set.map((item) => {
    let title = item.template
      .replace(/{game}/gi, game)
      .replace(/{ep}/gi, ep || '')
      .replace(/{episode}/gi, ep || '');
    if (!ep) {
      title = title.replace(/\s*\((?:Episode|Part|Ep)\s*\)/gi, '')
                   .replace(/\s*(?:Episode|Part|Ep)\s*:\s*/gi, ': ')
                   .replace(/\s*Part\s*$/gi, '')
                   .replace(/\s*Episode\s*$/gi, '');
    }
    return {
      title,
      score: item.baseScore
    };
  });
};

const generateShortsData = (cycleIndex) => {
  const { game, ep, gameTag, epTag } = getCleanInputs();
  const set = SHORTS_TITLE_VARIANTS[cycleIndex % SHORTS_TITLE_VARIANTS.length];
  return set.map((t) => {
    let text = t
      .replace(/{game}/gi, game)
      .replace(/{ep}/gi, ep || '')
      .replace(/{episode}/gi, ep || '')
      .replace(/{gameTag}/gi, gameTag)
      .replace(/{epTag}/gi, epTag);
    if (!ep) {
      text = text.replace(/#ep\b/gi, '').replace(/\s{2,}/g, ' ').trim();
    }
    return text;
  });
};

const generateDescriptionData = (cycleIndex) => {
  const { game, ep } = getCleanInputs();

  let activeTemplate = template;
  try {
    const saved = safeGetLocalStorage(STORAGE_KEY, template || DEFAULT_TEMPLATE);
    if (saved) {
      activeTemplate = saved;
    }
  } catch (e) {
    console.warn('Failed to read template from localStorage', e);
  }

  const hook = DESCRIPTION_HOOKS[cycleIndex % DESCRIPTION_HOOKS.length]
    .replace(/{game}/gi, game)
    .replace(/{episode}/gi, ep || '')
    .replace(/{ep}/gi, ep || '');

  let replaced = activeTemplate
    .replace(/{game}/gi, game)
    .replace(/{episode}/gi, ep || '')
    .replace(/{ep}/gi, ep || '');

  if (!ep) {
    replaced = replaced.replace(/\s*-\s*Episode\s*!/gi, '!')
                       .replace(/\s*-\s*Episode\s*/gi, '')
                       .replace(/Episode\s*!/gi, '!')
                       .replace(/#ep\b/gi, '');
  }

  if (replaced.includes("In today's video, we are jumping back into")) {
    replaced = replaced.replace(
      /In today's video, we are jumping back into [^\n]+/,
      hook
    );
  }

  replaced = applyChannelPlaceholders(replaced);

  return replaced;
};

// Helper to ensure uploadedImage is a valid accessible URL and avoids URL length limits
const ensureValidImageUrl = (imageSrc) => {
  if (!imageSrc || typeof imageSrc !== 'string') return '';
  // If it's a data URL that is too long for a GET query parameter (> 2000 chars), convert to Blob URL
  if (imageSrc.startsWith('data:image/') && imageSrc.length > 2000) {
    try {
      const arr = imageSrc.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn('Failed to convert base64 to blob URL', e);
      return imageSrc;
    }
  }
  return imageSrc;
};

// Phase 33: Automatically generate detailed Image Prompt based on video titles
const generateImagePromptFromTitles = (titles, customGame, customEp) => {
  let g = (customGame !== undefined ? customGame : gameName).trim();
  if (!g && activeTab === 'chat' && chatPrompt.trim()) {
    const match = chatPrompt.match(/(?:لعبة|ماب|game)\s+["'«]?([^"'»\n,،.]+)/i);
    g = match && match[1] ? match[1].trim() : '';
  }
  const ep = (customEp !== undefined ? customEp : episode).trim();
  const epPart = ep ? ` episode ${ep}` : '';

  let firstTitle = '';
  if (Array.isArray(titles) && titles.length > 0) {
    firstTitle = typeof titles[0] === 'string' ? titles[0] : (titles[0].title || '');
  } else if (Array.isArray(videoTitles) && videoTitles.length > 0) {
    firstTitle = typeof videoTitles[0] === 'string' ? videoTitles[0] : (videoTitles[0].title || '');
  }

  const gamePart = g ? `the game ${g}${epPart}` : (ep ? `episode ${ep}` : 'the game');
  const titlePart = firstTitle ? `. Based on the title: '${firstTitle}'` : '';

  return `YouTube Thumbnail style, 16:9, vibrant, highly detailed, featuring ${gamePart}${titlePart}. Add bold text, bright colors, and a clickbait expression.`;
};



// Helper for generation error handling (Gemini, ChatGPT, or Groq)
const handleGenerationError = (err) => {
  if (!err) return;

  if (err?.isBothFailed) {
    const geminiMsg = getSpecificApiErrorMessage(err.geminiError?.error || err.geminiError, 'gemini');
    const groqMsg = getSpecificApiErrorMessage(err.groqError, 'groq');
    showToast(`Both failed: [${geminiMsg}] [${groqMsg}]`, 'error');
    return;
  }

  if (err?.isGroqOnly) {
    showToast(getSpecificApiErrorMessage(err.groqError, 'groq'), 'error');
    return;
  }

  if (err?.isGeminiOnly) {
    showToast(getSpecificApiErrorMessage(err.error, 'gemini'), 'error');
    return;
  }

  if (err?.isChatGpt) {
    showToast(err.error?.message || 'ChatGPT text generation failed', 'error');
    return;
  }

  const provider = safeGetLocalStorage('text_provider', 'gemini');
  showToast(getSpecificApiErrorMessage(err, provider), 'error');
};

// Full Generate button click via Gemini API with Groq Fallback & Toggles
const handleGenerate = async () => {
  if (!genTitles && !genShorts && !genDescription && !genThumbnails) {
    setVideoTitles([]);
    setShortsTitles([]);
    setDescription('');
    setImagePrompt('');
    return;
  }

  // Clear outputs of unchecked toggles
  if (!genTitles) setVideoTitles([]);
  if (!genShorts) setShortsTitles([]);
  if (!genDescription) setDescription('');
  if (!genThumbnails) setImagePrompt('');

  const game = gameName.trim() || 'My Game';
  const ep = episode.trim();

  const needsTextGen = genTitles || genShorts || genDescription || genThumbnails;
  if (!needsTextGen) {
    return;
  }

  const textProvider = safeGetLocalStorage('text_provider', 'gemini');
  const geminiKey = getSecret('gemini_api_key').trim();
  const openaiKey = getSecret('openai_api_key').trim();
  const groqKey = getSecret('groq_api_key').trim();

  if (textProvider === 'chatgpt' && !openaiKey) {
    showToast(t('toastOpenAiKeyRequired'), 'error');
    return;
  }
  if (textProvider === 'groq' && !groqKey) {
    showToast(t('toastGroqKeyRequired'), 'error');
    return;
  }
  if (textProvider === 'gemini' && !geminiKey && !groqKey) {
    showToast(t('toastGeminiKeyRequired'), 'error');
    return;
  }

  setIsLoading(true);

  try {
    const langInstruction = lang === 'en' ? 'Respond in English.' : 'Respond in Arabic.';
    const requestedParts = [];
    if (genTitles) requestedParts.push('3 catchy video titles with viral score 0-100');
    if (genShorts) requestedParts.push('3 shorts titles with hashtags');
    if (genDescription) {
      if (useCustomTemplate) {
        const currentTemplate = safeGetLocalStorage(STORAGE_KEY, template) || template;
        const templateWithChannels = applyChannelPlaceholders(currentTemplate);
        requestedParts.push(`1 full YouTube description constructed strictly using this custom template format:\n"""\n${templateWithChannels}\n"""\n(filling in placeholders like {game} and {episode})`);
      } else {
        requestedParts.push('1 full YouTube description (free-form, written creatively without following the custom template)');
      }
    }

    const epPart = ep ? `, episode: ${ep}` : '';
    let prompt = '';
    if (activeTab === 'chat') {
      const userText = chatPrompt.trim() || 'Create YouTube metadata';
      prompt = `You are a YouTube metadata expert. The user has provided this custom request: '${userText}'. 
Based on this request, generate EXACTLY:
- 3 YouTube video titles (with viral scores 0-100).
- 3 YouTube Shorts titles (with hashtags).
- 1 YouTube description (using the provided template style if the user mentioned it).
- Return the result strictly as a JSON object with keys: videoTitles (array of {title, score}), shortsTitles (array of strings), description (string).
Do not include any image description text in the JSON. Return only the JSON. ${langInstruction}`;
    } else {
      prompt = `You are a YouTube metadata expert. Given game name: ${game}${epPart}, return ${requestedParts.join(', and ')}. ${langInstruction}`;
    }

    const properties = {};
    const required = [];

    if (activeTab === 'chat') {
      properties.videoTitles = {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            score: { type: 'INTEGER' },
            seo: { type: 'INTEGER' },
            ctr: { type: 'INTEGER' }
          },
          required: ['title', 'score', 'seo', 'ctr']
        }
      };
      properties.shortsTitles = {
        type: 'ARRAY',
        items: { type: 'STRING' }
      };
      properties.description = {
        type: 'STRING'
      };
      required.push('videoTitles', 'shortsTitles', 'description');
    } else {
      if (genTitles) {
        properties.videoTitles = {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              score: { type: 'INTEGER' },
              seo: { type: 'INTEGER' },
              ctr: { type: 'INTEGER' }
            },
            required: ['title', 'score', 'seo', 'ctr']
          }
        };
        required.push('videoTitles');
      }

      if (genShorts) {
        properties.shortsTitles = {
          type: 'ARRAY',
          items: { type: 'STRING' }
        };
        required.push('shortsTitles');
      }

      if (genDescription) {
        properties.description = {
          type: 'STRING'
        };
        required.push('description');
      }
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties,
          required
        }
      }
    };

    const result = await executeTextGeneration(prompt + planRules, requestBody, uiHooks);
    if (!result) return;

    const parsedData = result.data;
    let newTitles = [];
    if (genTitles && Array.isArray(parsedData.videoTitles)) {
      setVideoTitles(parsedData.videoTitles);
      newTitles = parsedData.videoTitles;
    }
    if (genShorts && Array.isArray(parsedData.shortsTitles)) {
      setShortsTitles(parsedData.shortsTitles);
    }
    if (genDescription && typeof parsedData.description === 'string') {
      setDescription(applyChannelPlaceholders(parsedData.description));
    }

    // Automatically generate a detailed IMAGE PROMPT based on generated video titles
    const promptText = generateImagePromptFromTitles(newTitles, game, ep);
    setImagePrompt(promptText);

    showToast(t('toastMetadataSuccess'), 'success');
  } catch (err) {
    handleGenerationError(err);
  } finally {
    setIsLoading(false);
  }
};

// Independent Regenerate Titles via Gemini API with Groq Fallback
const handleRegenerateTitles = async () => {
  const textProvider = safeGetLocalStorage('text_provider', 'gemini');
  const geminiKey = getSecret('gemini_api_key').trim();
  const openaiKey = getSecret('openai_api_key').trim();
  const groqKey = getSecret('groq_api_key').trim();

  if (textProvider === 'chatgpt' && !openaiKey) {
    showToast(t('toastOpenAiKeyRequired'), 'error');
    return;
  }
  if (textProvider === 'groq' && !groqKey) {
    showToast(t('toastGroqKeyRequired'), 'error');
    return;
  }
  if (textProvider === 'gemini' && !geminiKey && !groqKey) {
    showToast(t('toastGeminiKeyRequired'), 'error');
    return;
  }

  const game = gameName.trim() || 'My Game';
  const ep = episode.trim();

  setIsRegeneratingTitles(true);

  try {
    const langInstruction = lang === 'en' ? 'Respond in English.' : 'Respond in Arabic.';
    const descContext = description.trim()
      ? `Based on this description, generate 3 new titles:\n"${description.trim()}". `
      : '';
    let prompt = '';
    if (activeTab === 'chat') {
      const userText = chatPrompt.trim() || 'Create YouTube content';
      prompt = `Based on the following request: ${userText}. ${descContext}Generate 3 catchy video titles with viral score 0-100. Ensure the output is in JSON format and follows the exact structure requested. ${langInstruction}`;
    } else {
      prompt = ep
        ? `You are a YouTube metadata expert. Given game name: ${game}, episode: ${ep}. ${descContext}Return 3 catchy video titles with viral score 0-100. ${langInstruction}`
        : `You are a YouTube metadata expert. Given game name: ${game}. ${descContext}Return 3 catchy video titles with viral score 0-100. ${langInstruction}`;
    }

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            videoTitles: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  score: { type: 'INTEGER' },
                  seo: { type: 'INTEGER' },
                  ctr: { type: 'INTEGER' }
                },
                required: ['title', 'score', 'seo', 'ctr']
              }
            }
          },
          required: ['videoTitles']
        }
      }
    };

    const result = await executeTextGeneration(prompt + planRules, requestBody, uiHooks);
    if (!result) return;

    if (Array.isArray(result.data.videoTitles)) {
      setVideoTitles(result.data.videoTitles);
      const promptText = generateImagePromptFromTitles(result.data.videoTitles, game, ep);
      setImagePrompt(promptText);
      showToast(t('toastTitlesRegenerated'), 'success');
    }
  } catch (err) {
    handleGenerationError(err);
  } finally {
    setIsRegeneratingTitles(false);
  }
};

// Independent Regenerate Shorts via Gemini API with Groq Fallback
const handleRegenerateShorts = async () => {
  const textProvider = safeGetLocalStorage('text_provider', 'gemini');
  const geminiKey = getSecret('gemini_api_key').trim();
  const openaiKey = getSecret('openai_api_key').trim();
  const groqKey = getSecret('groq_api_key').trim();

  if (textProvider === 'chatgpt' && !openaiKey) {
    showToast(t('toastOpenAiKeyRequired'), 'error');
    return;
  }
  if (textProvider === 'groq' && !groqKey) {
    showToast(t('toastGroqKeyRequired'), 'error');
    return;
  }
  if (textProvider === 'gemini' && !geminiKey && !groqKey) {
    showToast(t('toastGeminiKeyRequired'), 'error');
    return;
  }

  const game = gameName.trim() || 'My Game';
  const ep = episode.trim();

  setIsRegeneratingShorts(true);

  try {
    const langInstruction = lang === 'en' ? 'Respond in English.' : 'Respond in Arabic.';
    const descContext = description.trim()
      ? `Based on this description, generate 3 shorts titles:\n"${description.trim()}". `
      : '';
    let prompt = '';
    if (activeTab === 'chat') {
      const userText = chatPrompt.trim() || 'Create YouTube content';
      prompt = `Based on the following request: ${userText}. ${descContext}Generate 3 catchy shorts titles with hashtags. Ensure the output is in JSON format and follows the exact structure requested. ${langInstruction}`;
    } else {
      prompt = ep
        ? `You are a YouTube metadata expert. Given game name: ${game}, episode: ${ep}. ${descContext}Return 3 catchy shorts titles with hashtags. ${langInstruction}`
        : `You are a YouTube metadata expert. Given game name: ${game}. ${descContext}Return 3 catchy shorts titles with hashtags. ${langInstruction}`;
    }

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            shortsTitles: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            }
          },
          required: ['shortsTitles']
        }
      }
    };

    const result = await executeTextGeneration(prompt + planRules, requestBody, uiHooks);
    if (!result) return;

    if (Array.isArray(result.data.shortsTitles)) {
      setShortsTitles(result.data.shortsTitles);
      showToast(t('toastShortsRegenerated'), 'success');
    }
  } catch (err) {
    handleGenerationError(err);
  } finally {
    setIsRegeneratingShorts(false);
  }
};

// Independent Regenerate Description via Gemini API with Groq Fallback
const handleRegenerateDescription = async () => {
  const textProvider = safeGetLocalStorage('text_provider', 'gemini');
  const geminiKey = getSecret('gemini_api_key').trim();
  const openaiKey = getSecret('openai_api_key').trim();
  const groqKey = getSecret('groq_api_key').trim();

  if (textProvider === 'chatgpt' && !openaiKey) {
    showToast(t('toastOpenAiKeyRequired'), 'error');
    return;
  }
  if (textProvider === 'groq' && !groqKey) {
    showToast(t('toastGroqKeyRequired'), 'error');
    return;
  }
  if (textProvider === 'gemini' && !geminiKey && !groqKey) {
    showToast(t('toastGeminiKeyRequired'), 'error');
    return;
  }

  const game = gameName.trim() || 'My Game';
  const ep = episode.trim();

  setIsRegeneratingDescription(true);

  try {
    const langInstruction = lang === 'en' ? 'Respond in English.' : 'Respond in Arabic.';
    const titlesList = Array.isArray(videoTitles) && videoTitles.length > 0
      ? videoTitles.map((t, idx) => `${idx + 1}. ${t.title}`).join('\n')
      : '';
    const titlesContext = titlesList
      ? `Based on these titles, write a new description:\n${titlesList}\n. `
      : '';
    const rawTemplate = safeGetLocalStorage(STORAGE_KEY, template) || template;
    const templateWithChannels = applyChannelPlaceholders(rawTemplate);
    const templateInstruction = useCustomTemplate
      ? `Use this YouTube description template format and fill in all placeholders:\n"""\n${templateWithChannels}\n"""\n`
      : `Write a creative, high-converting free-form YouTube description without following any template. `;
    let prompt = '';
    if (activeTab === 'chat') {
      const userText = chatPrompt.trim() || 'Create YouTube content';
      prompt = `Based on the following request: ${userText}. ${titlesContext}${templateInstruction}Return 1 full YouTube description. Ensure the output is in JSON format and follows the exact structure requested. ${langInstruction}`;
    } else {
      prompt = ep
        ? `You are a YouTube metadata expert. Given game name: ${game}, episode: ${ep}. ${titlesContext}${templateInstruction}Return 1 full YouTube description. ${langInstruction}`
        : `You are a YouTube metadata expert. Given game name: ${game}. ${titlesContext}${templateInstruction}Return 1 full YouTube description. ${langInstruction}`;
    }

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            description: {
              type: 'STRING'
            }
          },
          required: ['description']
        }
      }
    };

    const result = await executeTextGeneration(prompt + planRules, requestBody, uiHooks);
    if (!result) return;

    if (typeof result.data.description === 'string') {
      setDescription(applyChannelPlaceholders(result.data.description));
      showToast(t('toastDescRegenerated'), 'success');
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
      game: gameName.trim() || 'My Game',
      episode: episode.trim() || '',
      videoTitles,
      shortsTitles,
      description,
      imagePrompt: imagePrompt || '',
      thumbnails: [],
      exportedAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const objectURL = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectURL;
    a.download = `youtube_metadata_${gName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(objectURL);
    }, 100);

    showToast(t('toastExportSuccess'), 'success');
  } catch (err) {
    console.warn('Export failed', err);
    showToast('Export failed', 'error');
  }
};

const copyToClipboard = async (text, sectionId, customToast) => {
  let copied = false;

  // 1. Try modern navigator.clipboard API if available (HTTPS / localhost)
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      copied = false;
    }
  }

  // 2. Fallback to hidden textarea + document.execCommand('copy') for non-HTTPS / unsupported contexts
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
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        copied = true;
      }
    } catch {
      copied = false;
    }
  }

  // 3. Handle toasts
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



const handleCopyAndOpenGemini = async () => {
  const textToCopy = imagePrompt || generateImagePromptFromTitles(videoTitles);
  await copyToClipboard(textToCopy, 'image-prompt', translations[lang]['toastGeminiPromptCopied']);
  window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer');
};

const handleCopyAndOpenChatGPT = async () => {
  const textToCopy = imagePrompt || generateImagePromptFromTitles(videoTitles);
  await copyToClipboard(textToCopy, 'image-prompt', translations[lang]['toastChatGptPromptCopied']);
  window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
};


  return { getCleanInputs, generateTitlesData, generateShortsData, generateDescriptionData, ensureValidImageUrl, generateImagePromptFromTitles, handleGenerationError, handleGenerate, handleRegenerateTitles, handleRegenerateShorts, handleRegenerateDescription, handleExportAll, copyToClipboard, handleCopyAndOpenGemini, handleCopyAndOpenChatGPT };
}
