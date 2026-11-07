// AI providers the user can pick from in Settings. One provider is active at a time,
// and only that provider's API key field is shown.
// `id` is shared with electron/main.cjs (PROVIDERS) and src/services/aiTransport.js (HOST_TO_PROVIDER).
export const AI_PROVIDERS = [
  {
    id: 'gemini',
    label: { ar: 'Google Gemini', en: 'Google Gemini' },
    keyName: 'gemini_api_key',
    model: 'gemini-3.8-flash',
    placeholder: 'AIza...',
    keyUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    id: 'claude',
    label: { ar: 'Anthropic Claude', en: 'Anthropic Claude' },
    keyName: 'claude_api_key',
    model: 'claude-haiku-5-5',
    placeholder: 'sk-ant-...',
    keyUrl: 'https://console.anthropic.com/settings/keys'
  },
  {
    id: 'deepseek',
    label: { ar: 'DeepSeek', en: 'DeepSeek' },
    keyName: 'deepseek_api_key',
    model: 'deepseek-chat',
    placeholder: 'sk-...',
    keyUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    id: 'chatgpt',
    label: { ar: 'ChatGPT (OpenAI)', en: 'ChatGPT (OpenAI)' },
    keyName: 'openai_api_key',
    model: 'gpt-4o-mini',
    placeholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys'
  }
];

export const PROVIDER_IDS = AI_PROVIDERS.map((p) => p.id);

export const getProvider = (id) => AI_PROVIDERS.find((p) => p.id === id) || AI_PROVIDERS[0];

export const SECRET_KEY_NAMES = AI_PROVIDERS.map((p) => p.keyName);
