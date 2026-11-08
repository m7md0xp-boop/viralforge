// Live-stream category and tags (Twitch, Kick). Pure functions so they can be tested in Node.
import { PLATFORMS } from '../config/platforms.js';

// Platforms whose stream settings have a category and a tag list, with the key used in the AI reply
export const STREAM_META_PLATFORMS = [
  { platformId: 'twitch_live', key: 'twitch' },
  { platformId: 'kick_live', key: 'kick' }
];

// Tags keep letters (any language) and digits only, no spaces or #, unique, within the platform limits
export function cleanStreamTags(tags, { maxTags = 10, maxLen = 25 } = {}) {
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(tags) ? tags : []) {
    const tag = String(raw || '').replace(/[^\p{L}\p{N}]+/gu, '').slice(0, maxLen);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= maxTags) break;
  }
  return out;
}

// Reads { twitch: {category, tags}, kick: {...} } from the AI reply, for the selected platforms only
export function normalizeStreamMeta(data, platformIds) {
  const out = {};
  for (const { platformId, key } of STREAM_META_PLATFORMS) {
    if (!platformIds.includes(platformId)) continue;
    const raw = data && typeof data[key] === 'object' && data[key] ? data[key] : {};
    out[key] = {
      platformId,
      category: String(raw.category || '').trim().slice(0, 100),
      tags: cleanStreamTags(raw.tags, PLATFORMS[platformId].streamTags)
    };
  }
  return Object.keys(out).length ? out : null;
}
