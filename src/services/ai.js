import { getSecret } from './secrets';
import { safeGetLocalStorage } from '../utils/storage';

// Gemini API caller with up to 3 attempts and 20s global timeout via AbortController
export const callGeminiWithRetry = async (apiKey, requestBody) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 20000);

  const selectedGeminiModel = safeGetLocalStorage('selected_gemini_model', 'gemini-3.8-flash').trim() || 'gemini-3.8-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedGeminiModel}:generateContent`;

  let lastStatus = 'Network error';
  const hasGroqFallback = Boolean(getSecret('groq_api_key').trim());
  const maxAttempts = hasGroqFallback ? 1 : 3;

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (controller.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        if (res.ok) {
          const responseJson = await res.json();
          const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) {
            throw new Error('Empty response');
          }
          return JSON.parse(rawText);
        }

        lastStatus = res.status;
        if (res.status === 401 || res.status === 403 || res.status === 404 || res.status === 400 || res.status === 429) {
          let errMsg = `Status ${res.status}`;
          try {
            const errJson = await res.json();
            if (errJson?.error?.message) errMsg = errJson.error.message;
          } catch {}
          const err = new Error(errMsg);
          err.status = res.status;
          throw err;
        }

        // If retryable status (503, 500, etc.) and attempts remain
        if (attempt < maxAttempts) {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, 1000 * attempt);
            controller.signal.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            }, { once: true });
          });
        }
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          throw err;
        }
        if (err.status === 401 || err.status === 403 || err.status === 404 || err.status === 400 || err.status === 429) {
          throw err;
        }
        lastStatus = err.status || err.message || 'Network error';
        if (attempt < maxAttempts) {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, 1000 * attempt);
            controller.signal.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            }, { once: true });
          });
        }
      }
    }

    // Max attempts failed
    const finalErr = new Error(`Text generation failed after ${maxAttempts} attempts: ${lastStatus}`);
    finalErr.isAllAttemptsFailed = true;
    finalErr.status = lastStatus;
    throw finalErr;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Normalizes AI response from Groq (LLaMA) or Gemini
const normalizeAiResponse = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return {};
  const result = { ...parsed };

  // Video titles normalization
  const rawVideoTitles = result.videoTitles || result.video_titles || result.titles;
  if (Array.isArray(rawVideoTitles)) {
    result.videoTitles = rawVideoTitles.map((item) => {
      if (typeof item === 'string') {
        return { title: item, score: 85 };
      }
      if (item && typeof item === 'object') {
        return {
          title: item.title || item.name || '',
          score: typeof item.score === 'number' ? item.score : (Number(item.score) || 85)
        };
      }
      return { title: String(item || ''), score: 80 };
    });
  }

  // Shorts titles normalization
  const rawShortsTitles = result.shortsTitles || result.shorts_titles || result.shorts;
  if (Array.isArray(rawShortsTitles)) {
    result.shortsTitles = rawShortsTitles.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return item.title || item.text || String(item);
      return String(item || '');
    });
  }

  // Description normalization
  const rawDescription = result.description ?? result.youtube_description ?? result.desc;
  if (typeof rawDescription === 'string') {
    result.description = rawDescription;
  } else if (Array.isArray(rawDescription)) {
    result.description = rawDescription.join('\n\n');
  }

  return result;
};

// Groq API caller using selected model from localStorage
const callGroq = async (groqApiKey, prompt) => {
  const selectedGroqModel = safeGetLocalStorage('selected_groq_model', 'openai/gpt-oss-120b').trim() || 'openai/gpt-oss-120b';
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  // Phase 34: Ensure the prompt sent to Groq explicitly tells the model to output JSON
  const groqPrompt = prompt.includes('Please output the response in JSON format.')
    ? prompt
    : `${prompt}\nPlease output the response in JSON format.`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`
    },
    body: JSON.stringify({
      model: selectedGroqModel,
      messages: [{ role: 'user', content: groqPrompt }],
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    let errMsg = `Status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        errMsg = errJson.error.message;
      } else if (errJson?.message) {
        errMsg = errJson.message;
      }
    } catch {
      const errText = await res.text().catch(() => '');
      if (errText) errMsg = errText;
    }
    const err = new Error(errMsg);
    err.status = res.status;
    throw err;
  }

  const resJson = await res.json();
  const rawContent = resJson.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Empty content from Groq');
  }

  let parsed;
  try {
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    }
    parsed = JSON.parse(cleanJson);
  } catch {
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(rawContent.substring(firstBrace, lastBrace + 1));
    } else {
      parsed = JSON.parse(rawContent);
    }
  }

  return normalizeAiResponse(parsed);
};

// OpenAI API caller using gpt-4o-mini
const callOpenAI = async (openaiApiKey, prompt) => {
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const jsonInstructionPrompt = `${prompt}\nEnsure the output is a valid JSON object with keys: "videoTitles", "shortsTitles", "description" (or the specific requested fields).`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: jsonInstructionPrompt }],
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    let errMsg = `Status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        errMsg = errJson.error.message;
      } else if (errJson?.message) {
        errMsg = errJson.message;
      }
    } catch {
      const errText = await res.text().catch(() => '');
      if (errText) errMsg = errText;
    }
    throw new Error(`OpenAI: ${errMsg}`);
  }

  const resJson = await res.json();
  const rawContent = resJson.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Empty content from OpenAI');
  }

  const parsed = JSON.parse(rawContent);
  return normalizeAiResponse(parsed);
};

// Text generation runner with Gemini primary & Groq fallback
const executeWithGroqFallback = async (prompt, geminiRequestBody, ui) => {
  const geminiKey = getSecret('gemini_api_key').trim();
  const groqKey = getSecret('groq_api_key').trim();

  if (!geminiKey && !groqKey) {
    ui.showToast(ui.t('toastKeyRequired'), 'error');
    return null;
  }

  if (geminiKey) {
    try {
      const geminiData = await callGeminiWithRetry(geminiKey, geminiRequestBody);
      return { data: geminiData, provider: 'gemini' };
    } catch (geminiErr) {
      // Without Groq key -> throw Gemini error so only Gemini error is displayed
      if (!groqKey) {
        throw { isGeminiOnly: true, error: geminiErr };
      }

      // With Groq key -> show fallback toast and call Groq
      ui.showToast(ui.t('toastFallbackToGroq'), 'info');

      try {
        const groqData = await callGroq(groqKey, prompt);
        return { data: groqData, provider: 'groq' };
      } catch (groqErr) {
        console.warn('Groq fallback failed:', groqErr);
        throw { isBothFailed: true, geminiError: geminiErr, groqError: groqErr };
      }
    }
  } else {
    // geminiKey is missing but groqKey is present: trigger Groq
    ui.showToast(ui.t('toastFallbackToGroq'), 'info');
    try {
      const groqData = await callGroq(groqKey, prompt);
      return { data: groqData, provider: 'groq' };
    } catch (groqErr) {
      throw { isBothFailed: true, groqError: groqErr };
    }
  }
};

// Universal Text Generation Dispatcher
export const executeTextGeneration = async (prompt, geminiRequestBody, ui) => {
  const textProvider = safeGetLocalStorage('text_provider', 'gemini');
  const geminiKey = getSecret('gemini_api_key').trim();
  const openaiKey = getSecret('openai_api_key').trim();
  const groqKey = getSecret('groq_api_key').trim();

  if (textProvider === 'chatgpt') {
    if (!openaiKey) {
      ui.showToast(ui.t('toastOpenAiKeyRequired'), 'error');
      return null;
    }
    try {
      const openAiData = await callOpenAI(openaiKey, prompt);
      return { data: openAiData, provider: 'chatgpt' };
    } catch (openAiErr) {
      throw { isChatGpt: true, error: openAiErr };
    }
  }

  if (textProvider === 'groq') {
    if (!groqKey) {
      ui.showToast(ui.t('toastGroqKeyRequired'), 'error');
      return null;
    }
    try {
      const groqData = await callGroq(groqKey, prompt);
      return { data: groqData, provider: 'groq' };
    } catch (groqErr) {
      throw { isGroqOnly: true, groqError: groqErr };
    }
  }

  // Default: Gemini with Groq fallback
  if (!geminiKey && !groqKey) {
    ui.showToast(ui.t('toastGeminiKeyRequired'), 'error');
    return null;
  }
  return executeWithGroqFallback(prompt, geminiRequestBody, ui);
};

// Phase 28: Specific API Error Formatter for Gemini and Groq
export const getSpecificApiErrorMessage = (err, provider = 'gemini') => {
  if (!err) return 'Unknown error occurred.';
  const status = err?.status || (typeof err === 'number' ? err : null) || (err?.message && err.message.match(/\b(401|429|403|404|500|503)\b/)?.[1]);
  const message = err?.message || (typeof err === 'string' ? err : '');

  if (provider === 'gemini') {
    if (status == 429 || message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('resource_exhausted')) {
      return 'Gemini Quota Exceeded. Try again later or use Groq.';
    }
    if (status == 401 || message.includes('401') || message.toLowerCase().includes('api_key_invalid') || message.toLowerCase().includes('api key')) {
      return 'Gemini API Key is invalid.';
    }
    return message || `Gemini error (${status || 'Network error'})`;
  }

  if (provider === 'groq') {
    if (status == 401 || message.includes('401') || message.toLowerCase().includes('invalid_api_key')) {
      return 'Groq API Key is invalid.';
    }
    if (status == 429 || message.includes('429') || message.toLowerCase().includes('rate_limit_exceeded') || message.toLowerCase().includes('quota')) {
      return 'Groq Quota Exceeded. Try again later.';
    }
    return message || `Groq error (${status || 'Network error'})`;
  }

  return message || `${provider} error`;
};
