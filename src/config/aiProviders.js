// AI providers. The list lives in shared/aiProviders.json so the renderer and the Electron main process agree.
import catalog from '../../shared/aiProviders.json';

export const AI_PROVIDERS = catalog.providers;
export const USAGE_TYPES = catalog.usageTypes;
export const PROVIDER_IDS = AI_PROVIDERS.map((p) => p.id);
export const SECRET_KEY_NAMES = AI_PROVIDERS.map((p) => p.keyName);

export const getProvider = (id) => AI_PROVIDERS.find((p) => p.id === id) || AI_PROVIDERS[0];

// Usage status for a provider: { label: {ar,en}, color }
export const getUsage = (provider) => USAGE_TYPES[provider.usage] || USAGE_TYPES.paid;
