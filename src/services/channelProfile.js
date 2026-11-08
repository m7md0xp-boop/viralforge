// The user's own channel details (name, links, writing style), saved in this profile's localStorage.
// Filled in on the welcome screen and editable later. Never sent anywhere except inside the prompts
// the user runs themselves.
import { USER_CONFIG } from '../config/userConfig.js';

const KEY = 'vf_channel_profile_v1';

// Writing styles offered on the welcome screen (labels: i18n "styles.<id>").
// `prompt` is the instruction added to every request.
export const CHANNEL_STYLES = {
  energetic: {
    prompt: 'Energetic, hype tone with short punchy sentences.'
  },
  funny: {
    prompt: 'Light, funny tone with playful jokes.'
  },
  calm: {
    prompt: 'Calm, friendly and relaxed tone.'
  },
  informative: {
    prompt: 'Clear, informative tone that explains tips and strategies.'
  }
};

export const EMPTY_PROFILE = {
  channelName: USER_CONFIG.channelName,
  channelUrl: USER_CONFIG.channelUrl,
  linktreeUrl: USER_CONFIG.linktreeUrl,
  discordUrl: USER_CONFIG.discordUrl,
  style: USER_CONFIG.style,
  onboarded: false
};

// Values the old versions wrote for every user. They belonged to the developer's channel, so they are dropped.
const LEGACY_DEFAULTS = new Set(['izreoxp', 'https://www.youtube.com/@izeroxp']);
const legacyValue = (key) => {
  try {
    const v = (localStorage.getItem(key) || '').trim();
    return LEGACY_DEFAULTS.has(v.toLowerCase()) ? '' : v;
  } catch {
    return '';
  }
};

const clean = (value, max = 300) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Accepts only http(s) links. Adds https:// when the user typed a bare domain. Returns '' for anything else.
export function normalizeUrl(value) {
  const v = clean(value, 500);
  if (!v) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function sanitizeProfile(input = {}) {
  return {
    channelName: clean(input.channelName, 80),
    channelUrl: normalizeUrl(input.channelUrl),
    linktreeUrl: normalizeUrl(input.linktreeUrl),
    discordUrl: normalizeUrl(input.discordUrl),
    style: CHANNEL_STYLES[input.style] ? input.style : USER_CONFIG.style,
    onboarded: Boolean(input.onboarded)
  };
}

export function loadChannelProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return sanitizeProfile(JSON.parse(raw));
  } catch {
    // Corrupted entry: fall through to the migration below
  }
  // First run of this version: keep what an older version saved, minus the developer's defaults
  return sanitizeProfile({
    ...EMPTY_PROFILE,
    channelName: legacyValue('channel_name'),
    channelUrl: legacyValue('channel_link'),
    onboarded: false
  });
}

export function saveChannelProfile(profile) {
  const clean = sanitizeProfile(profile);
  try {
    localStorage.setItem(KEY, JSON.stringify(clean));
    // The old keys are no longer read
    localStorage.removeItem('channel_name');
    localStorage.removeItem('channel_link');
  } catch (err) {
    console.warn('Failed to save channel profile', err);
  }
  return clean;
}
