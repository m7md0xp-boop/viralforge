// Fills the description template placeholders with the user's real values.
// Pure functions (no React, no storage) so they can be tested in Node.

// Slot where the AI-written text goes when the template has one
export const AI_SLOT = '{ai_description}';

// Placeholder -> value. Link placeholders are optional: when empty, their whole line is removed.
export function placeholderValues({ game = '', episode = '', profile = {} } = {}) {
  const channelUrl = profile.channelUrl || '';
  let subscribeLink = '';
  if (channelUrl) {
    try {
      const url = new URL(channelUrl);
      url.searchParams.set('sub_confirmation', '1');
      subscribeLink = url.toString();
    } catch {
      subscribeLink = '';
    }
  }
  return {
    game: game || '',
    episode: episode || '',
    ep: episode || '',
    channel_name: profile.channelName || '',
    channel_link: channelUrl,
    subscribe_link: subscribeLink,
    linktree_link: profile.linktreeUrl || '',
    discord_link: profile.discordUrl || ''
  };
}

const NAMES = ['game', 'episode', 'ep', 'channel_name', 'channel_link', 'subscribe_link', 'linktree_link', 'discord_link'];
const PATTERN = new RegExp(`\\{(${NAMES.join('|')})\\}`, 'gi');

// Replaces every known placeholder. A line whose placeholders are all empty is dropped,
// so an unset Discord link never leaves "Discord: " behind. Unknown {words} are kept as they are.
export function fillPlaceholders(text, values) {
  if (typeof text !== 'string' || !text) return text;
  const lines = text.split('\n').filter((line) => {
    const found = line.match(PATTERN);
    if (!found) return true;
    return found.some((p) => values[p.slice(1, -1).toLowerCase()]);
  });
  return lines
    .join('\n')
    .replace(PATTERN, (_, name) => values[name.toLowerCase()] || '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Final description: the template with the AI text in its {ai_description} slot.
// Without a slot, the AI text is used as it is (placeholders filled).
export function composeDescription({ template, aiText, values, useTemplate }) {
  // The AI sometimes copies placeholders into its own text, so the body is filled too
  const body = fillPlaceholders((aiText || '').trim(), values) || '';
  if (useTemplate && typeof template === 'string' && template.includes(AI_SLOT)) {
    const [before, ...rest] = template.split(AI_SLOT);
    const after = rest.join('');
    return [fillPlaceholders(before, values), body, fillPlaceholders(after, values)].filter(Boolean).join('\n\n');
  }
  return body;
}

// Keeps unique hashtags, at most `max` of them
export function limitHashtags(hashtags, max) {
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(hashtags) ? hashtags : []) {
    const tag = String(raw || '').trim().replace(/\s+/g, '');
    if (!tag || tag === '#') continue;
    const withHash = tag.startsWith('#') ? tag : `#${tag}`;
    const key = withHash.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(withHash);
    if (out.length >= max) break;
  }
  return out;
}
