// AI providers. Lists live in shared/aiProviders.json so the renderer and the Electron main process agree.
import catalog from '../../shared/aiProviders.json';

export const AI_PROVIDERS = catalog.providers;
export const IMAGE_PROVIDERS = catalog.imageProviders;
export const USAGE_TYPES = catalog.usageTypes;
export const PROVIDER_IDS = AI_PROVIDERS.map((p) => p.id);
export const IMAGE_PROVIDER_IDS = IMAGE_PROVIDERS.map((p) => p.id);

// Every key name used by any provider (text and image), without duplicates
export const SECRET_KEY_NAMES = [...new Set([...AI_PROVIDERS, ...IMAGE_PROVIDERS].map((p) => p.keyName))];

export const getProvider = (id) => AI_PROVIDERS.find((p) => p.id === id) || AI_PROVIDERS[0];
export const getImageProvider = (id) => IMAGE_PROVIDERS.find((p) => p.id === id) || IMAGE_PROVIDERS[0];
export const findAnyProvider = (id) =>
  AI_PROVIDERS.find((p) => p.id === id) || IMAGE_PROVIDERS.find((p) => p.id === id) || AI_PROVIDERS[0];

// Usage status for a provider: { label: {ar,en}, color }
export const getUsage = (provider) => USAGE_TYPES[provider.usage] || USAGE_TYPES.paid;

// Groups providers by usage status, in the catalog's order (free first, paid last). Empty groups are dropped.
export const groupByUsage = (providers) =>
  Object.keys(USAGE_TYPES)
    .map((usage) => ({
      usage,
      label: USAGE_TYPES[usage].label,
      providers: providers.filter((p) => p.usage === usage)
    }))
    .filter((g) => g.providers.length > 0);
