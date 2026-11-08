// Builds JSON-mode chat requests and reads their replies for each API format in shared/aiProviders.json.
// Pure functions (no imports) so they can be tested in Node. Gemini has its own path in ai.js.

const userMessage = (prompt) => [{ role: 'user', content: prompt }];

// Request for a provider. `provider` is one catalog entry, `key` is the API key (browser build only).
export function buildJsonRequest(provider, { key, model, prompt }) {
  const headers = { 'Content-Type': 'application/json' };
  if (provider.auth && provider.auth.header) {
    headers[provider.auth.header] = `${provider.auth.prefix || ''}${key}`;
  }
  Object.assign(headers, provider.headers || {});

  let body;
  switch (provider.format) {
    case 'openai':
      body = { model, messages: userMessage(prompt), response_format: { type: 'json_object' } };
      break;
    case 'anthropic':
      body = { model, max_tokens: 4096, messages: userMessage(prompt) };
      break;
    case 'cohere':
      body = { model, messages: userMessage(prompt), response_format: { type: 'json_object' } };
      break;
    default:
      throw new Error(`Unsupported API format: ${provider.format}`);
  }

  return { url: `${provider.base}${provider.path}`, headers, body };
}

// Image + text request for vision models (thumbnail evaluator). Only providers with "vision": true
// in the catalog are used. `image` is { mime, base64 }.
export function buildVisionRequest(provider, { key, prompt, image }) {
  if (!provider.vision) throw new Error(`${provider.id} cannot read images`);
  const headers = { 'Content-Type': 'application/json' };
  if (provider.auth && provider.auth.header) headers[provider.auth.header] = `${provider.auth.prefix || ''}${key}`;
  Object.assign(headers, provider.headers || {});

  switch (provider.format) {
    case 'gemini':
      return {
        url: `${provider.base}/v1beta/models/${provider.model}:generateContent`,
        headers,
        body: {
          contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: image.mime, data: image.base64 } }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }
      };
    case 'openai':
      return {
        url: `${provider.base}${provider.path}`,
        headers,
        body: {
          model: provider.model,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:${image.mime};base64,${image.base64}` } }
              ]
            }
          ]
        }
      };
    case 'anthropic':
      return {
        url: `${provider.base}${provider.path}`,
        headers,
        body: {
          model: provider.model,
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: image.mime, data: image.base64 } },
                { type: 'text', text: prompt }
              ]
            }
          ]
        }
      };
    default:
      throw new Error(`Vision is not supported for format: ${provider.format}`);
  }
}

// Text of the model's reply, or '' when the response has no content.
export function readJsonResponse(provider, json) {
  switch (provider.format) {
    case 'gemini':
      return (json?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    case 'openai':
      return json?.choices?.[0]?.message?.content || '';
    case 'anthropic':
      return (json?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    case 'cohere':
      return (json?.message?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    default:
      return '';
  }
}

// Pulls a JSON object out of a model reply, even when it is wrapped in code fences or prose.
export function parseJsonLoose(raw) {
  let text = String(raw || '').trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last > first) return JSON.parse(text.slice(first, last + 1));
    throw new Error('The AI reply was not valid JSON');
  }
}

// Normalizes AI output so the UI always gets the expected shapes (titles as objects, hashtags with #, ...)
export const normalizeAiResponse = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return {};
  const result = { ...parsed };

  const rawTitles = result.videoTitles || result.video_titles || result.titles;
  if (Array.isArray(rawTitles)) {
    result.videoTitles = rawTitles.map((item) => {
      if (typeof item === 'string') return { title: item, score: 85, seo: 80, ctr: 75 };
      return {
        title: item?.title || item?.name || '',
        score: Number(item?.score) || 85,
        seo: Number(item?.seo) || 80,
        ctr: Number(item?.ctr) || 75
      };
    });
  }

  const rawHashtags = result.hashtags;
  if (Array.isArray(rawHashtags)) {
    result.hashtags = rawHashtags
      .map((h) => String(h || '').trim())
      .filter(Boolean)
      .map((h) => (h.startsWith('#') ? h : `#${h}`));
  } else if (typeof rawHashtags === 'string') {
    result.hashtags = rawHashtags.split(/\s+/).filter(Boolean).map((h) => (h.startsWith('#') ? h : `#${h}`));
  }

  const rawDescription = result.description ?? result.youtube_description ?? result.desc;
  if (typeof rawDescription === 'string') result.description = rawDescription;
  else if (Array.isArray(rawDescription)) result.description = rawDescription.join('\n\n');

  // Lists of plain strings (live titles, Shorts titles): some models return { title } or { text } objects
  for (const key of ['templates', 'shortTitles']) {
    if (Array.isArray(result[key])) {
      result[key] = result[key].map((t) => (typeof t === 'string' ? t : t?.text || t?.title || ''));
    }
  }

  return result;
};
