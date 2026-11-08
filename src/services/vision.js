// Vision AI review of a thumbnail. Uses the active text provider when it can see images
// ("vision": true in shared/aiProviders.json), otherwise Gemini if its key is saved.
import { AI_PROVIDERS, getProvider } from '../config/aiProviders';
import { getActiveProviderId } from './ai';
import { getSecret } from './secrets';
import { providerFetch } from './aiTransport';
import { buildVisionRequest, readJsonResponse, parseJsonLoose } from './providerRequests';
import { buildVisionPrompt, normalizeVisionReview } from '../utils/visionReview';

const TIMEOUT_MS = 90000;
// The provider that will review the image, or null when none is usable
export function pickVisionProvider() {
  const active = getProvider(getActiveProviderId());
  if (active.vision && getSecret(active.keyName)) return active;
  return AI_PROVIDERS.find((p) => p.vision && getSecret(p.keyName)) || null;
}

// Sends the image to the vision provider. Returns { review, provider } or throws { provider, error }.
export async function reviewThumbnail({ image, title, lang }) {
  const provider = pickVisionProvider();
  if (!provider) return null;
  const key = getSecret(provider.keyName);
  const { url, headers, body } = buildVisionRequest(provider, { key, prompt: buildVisionPrompt({ title, lang }), image });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await providerFetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal });
    if (!res.ok) {
      let message = `Status ${res.status}`;
      try {
        const err = await res.json();
        message = err?.error?.message || err?.message || message;
      } catch {
        // Body is not JSON: keep the status text
      }
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    const text = readJsonResponse(provider, await res.json());
    if (!text) throw new Error('Empty reply');
    return { review: normalizeVisionReview(parseJsonLoose(text)), provider: provider.id };
  } catch (error) {
    throw { provider: provider.id, error };
  } finally {
    clearTimeout(timer);
  }
}
