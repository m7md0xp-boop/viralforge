// Pure request builders and response parsers for image providers. No network calls here.
// Each builder returns { path, body, responseType }:
//   path          provider.path from shared/aiProviders.json. May contain {accountId} (Cloudflare), resolved by the caller
//                 (desktop: main process, browser: imageGeneration.js).
//   body          JSON-serialisable object.
//   responseType  'json' (parse the body) or 'binary' (raw image bytes, returned as base64).

const DATA_URL = /^data:([^;]+);base64,(.+)$/;

// Splits a data URL ("data:image/png;base64,...") into { mime, base64 }. Returns null if it does not match.
export const parseDataUrl = (dataUrl) => {
  const m = typeof dataUrl === 'string' ? dataUrl.match(DATA_URL) : null;
  return m ? { mime: m[1], base64: m[2] } : null;
};

// Detects the image type from the first base64 characters (magic numbers).
export const sniffMime = (base64) => {
  if (typeof base64 !== 'string') return null;
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return null;
};

// Converts bytes to base64 without blowing the call stack on large images.
export const bytesToBase64 = (bytes) => {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

// Decodes base64 text (used to read error bodies that came back as bytes)
export const base64ToText = (base64) => {
  try {
    const binary = atob(base64 || '');
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
};

const LANDSCAPE = { width: 1280, height: 720 }; // 16:9, the YouTube thumbnail ratio

// Cloudflare Workers AI, FLUX.1 schnell. Free daily neuron allowance.
const buildCloudflare = (provider, { prompt }) => ({
  path: provider.path,
  body: { prompt, steps: 4, width: 1024, height: 576 },
  responseType: 'json'
});

// Hugging Face inference router, FLUX.1 schnell. Returns raw image bytes.
const buildHuggingFace = (provider, { prompt }) => ({
  path: provider.path,
  body: { inputs: prompt, parameters: { width: LANDSCAPE.width, height: LANDSCAPE.height } },
  responseType: 'binary'
});

// Google Gemini image model. Accepts a reference photo as inline data.
const buildGeminiImage = (provider, { prompt, reference }) => {
  const parts = [{ text: prompt }];
  if (reference) parts.push({ inlineData: { mimeType: reference.mime, data: reference.base64 } });
  return {
    path: provider.path,
    body: {
      contents: [{ parts }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    },
    responseType: 'json'
  };
};

// OpenAI image model. This integration does not send the reference photo (see supportsReference in the catalog).
const buildOpenAiImage = (provider, { prompt }) => ({
  path: provider.path,
  body: { model: provider.model, prompt, size: '1536x1024', n: 1 },
  responseType: 'json'
});

const BUILDERS = {
  'cloudflare-image': buildCloudflare,
  'huggingface-image': buildHuggingFace,
  'gemini-image': buildGeminiImage,
  'openai-image': buildOpenAiImage
};

// Adds the 16:9 hint to the prompt for providers that have no size option
const withAspect = (prompt) => `${prompt}\n\nLandscape 16:9 composition, high detail, sharp text.`;

export const buildImageRequest = (provider, { prompt, reference = null }) => {
  const builder = BUILDERS[provider.format];
  if (!builder) throw new Error(`Unsupported image format: ${provider.format}`);
  return builder(provider, {
    prompt: withAspect(prompt),
    // The reference is only sent to providers that support it
    reference: provider.supportsReference ? reference : null
  });
};

// Reads the image out of a finished response.
// response: { ok, status, json (object|null), base64 (string|null), contentType }
// Returns { mime, base64 } or throws an Error with a readable message.
export const parseImageResponse = (provider, response) => {
  const fail = (msg) => {
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  };

  if (provider.format === 'huggingface-image') {
    if (!response.ok || !response.base64) {
      fail(errorText(response) || `Status ${response.status}`);
    }
    const mime = (response.contentType || '').startsWith('image/') ? response.contentType : sniffMime(response.base64);
    if (!mime) fail(errorText(response) || 'Hugging Face did not return an image');
    return { mime, base64: response.base64 };
  }

  const json = response.json;
  if (!response.ok) fail(jsonError(json) || `Status ${response.status}`);

  if (provider.format === 'cloudflare-image') {
    const b64 = json?.result?.image;
    if (!b64) fail('Cloudflare did not return an image');
    return { mime: sniffMime(b64) || 'image/jpeg', base64: b64 };
  }

  if (provider.format === 'gemini-image') {
    const parts = json?.candidates?.[0]?.content?.parts || [];
    const img = parts.map((p) => p.inlineData || p.inline_data).find(Boolean);
    if (!img?.data) {
      const text = parts.map((p) => p.text).filter(Boolean).join(' ').trim();
      fail(text || 'Gemini did not return an image');
    }
    return { mime: img.mimeType || img.mime_type || sniffMime(img.data) || 'image/png', base64: img.data };
  }

  if (provider.format === 'openai-image') {
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) fail('OpenAI did not return an image');
    return { mime: sniffMime(b64) || 'image/png', base64: b64 };
  }

  fail(`Unsupported image format: ${provider.format}`);
};

const jsonError = (json) => json?.error?.message || json?.errors?.[0]?.message || json?.message || '';

const errorText = (response) => {
  if (response.json) return jsonError(response.json);
  if (response.base64) {
    const text = base64ToText(response.base64);
    try {
      return jsonError(JSON.parse(text)) || text.slice(0, 200);
    } catch {
      return text.slice(0, 200);
    }
  }
  return '';
};

// Cloudflare keys are "ACCOUNT_ID:API_TOKEN". Splits them. Throws if the format is wrong.
export const splitCloudflareKey = (key) => {
  const idx = (key || '').indexOf(':');
  if (idx < 1 || idx === key.length - 1) {
    throw new Error('Cloudflare key must look like ACCOUNT_ID:API_TOKEN');
  }
  return { accountId: key.slice(0, idx), token: key.slice(idx + 1) };
};
