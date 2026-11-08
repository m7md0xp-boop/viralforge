import { getSecret, hasDesktopSecrets } from './secrets';
import { providerPost } from './aiTransport';
import { IMAGE_PROVIDERS, getImageProvider } from '../config/aiProviders';
import { buildImageRequest, parseImageResponse, splitCloudflareKey } from './imageRequests';
import { translate } from '../i18n/translate';

const IMAGE_ACTIVE_KEY = 'image_provider';
const DEFAULT_IMAGE_PROVIDER = 'cloudflare-image'; // first free-limit provider in the catalog
const IMAGE_TIMEOUT_MS = 90000;

export const getActiveImageProviderId = () => {
  try {
    const saved = localStorage.getItem(IMAGE_ACTIVE_KEY);
    return IMAGE_PROVIDERS.some((p) => p.id === saved) ? saved : DEFAULT_IMAGE_PROVIDER;
  } catch {
    return DEFAULT_IMAGE_PROVIDER;
  }
};

export const setActiveImageProviderId = (id) => {
  try {
    const valid = IMAGE_PROVIDERS.some((p) => p.id === id) ? id : DEFAULT_IMAGE_PROVIDER;
    localStorage.setItem(IMAGE_ACTIVE_KEY, valid);
  } catch (err) {
    console.warn('Failed to save image provider choice', err);
  }
};

// Browser build only: the key is in localStorage, so the renderer can build the auth headers and the account path.
// Desktop: the main process does this, so the renderer never sees the key.
const browserRequest = (provider, key, req) => {
  if (provider.format === 'cloudflare-image') {
    const { accountId, token } = splitCloudflareKey(key);
    return {
      browserPath: req.path.replace('{accountId}', encodeURIComponent(accountId)),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    };
  }
  return {
    browserPath: req.path,
    headers: { 'Content-Type': 'application/json', [provider.auth.header]: `${provider.auth.prefix || ''}${key}` }
  };
};

// Generates one image with the active image provider.
// `reference` is { mime, base64 } or null. Providers that do not support it ignore it.
// Returns { mime, base64, provider } or null when no key is saved. Errors are thrown as { provider, error }.
export const executeImageGeneration = async ({ prompt, reference = null, ui }) => {
  const providerId = getActiveImageProviderId();
  const provider = getImageProvider(providerId);
  const key = getSecret(provider.keyName).trim();

  if (!key) {
    ui.showToast(ui.t('settings.keyRequired', { provider: provider.label.en }), 'error');
    return null;
  }

  try {
    const req = buildImageRequest(provider, { prompt, reference });
    // Desktop: the renderer holds only a placeholder for the key, so the main process builds the headers
    const { browserPath, headers } = hasDesktopSecrets() ? { browserPath: req.path, headers: {} } : browserRequest(provider, key, req);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
    try {
      const response = await providerPost({
        providerId: provider.id,
        base: provider.base,
        path: req.path,
        browserPath,
        headers,
        body: JSON.stringify(req.body),
        signal: controller.signal,
        binary: req.responseType === 'binary'
      });
      const { mime, base64 } = parseImageResponse(provider, response);
      return { mime, base64, provider: providerId };
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    throw { provider: providerId, error };
  }
};

// Friendly, translated message for a failed image request (keeps the provider's own text when it is clear)
export const getImageErrorMessage = (err, providerId, t = (key, vars) => translate('en', key, vars)) => {
  const name = getImageProvider(providerId).label.en;
  if (err?.name === 'AbortError') return t('errors.imageTimeout', { provider: name, seconds: IMAGE_TIMEOUT_MS / 1000 });
  const status = Number(err?.status || 0);
  const message = err?.message || '';
  if (status === 401 || status === 403) return t('errors.invalidKey', { provider: name });
  if (status === 402 || /credit|balance|billing|quota/i.test(message)) return t('errors.imageBilling', { provider: name });
  if (status === 429) return t('errors.rateLimited', { provider: name });
  return message ? t('errors.generic', { provider: name, message }) : t('errors.network', { provider: name, status: status || '-' });
};
