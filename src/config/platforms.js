// Character, hashtag and tag rules per platform.
//   titleMax      max characters of the title, or null when the platform has no title (TikTok, Reels, X)
//   captionMax    max characters of the caption/description, hashtags included
//   hashtagMax    hard hashtag limit. hashtagRecommended: [min, max] suggested range
//   streamTags    live platforms with a category + tags field: { maxTags, maxLen }
// Values come from the platforms' published limits, except where noted in the README.
export const CONTENT_TYPES = ['video', 'short', 'live'];

export const PLATFORMS = {
  youtube_video: {
    id: 'youtube_video', contentType: 'video', label: { ar: 'YouTube (مقطع)', en: 'YouTube (video)' },
    titleMax: 100, captionMax: 5000, hashtagMax: 15, hashtagRecommended: [3, 5]
  },
  youtube_short: {
    id: 'youtube_short', contentType: 'short', label: { ar: 'YouTube Shorts', en: 'YouTube Shorts' },
    titleMax: 100, captionMax: 5000, hashtagMax: 15, hashtagRecommended: [3, 5]
  },
  tiktok_short: {
    id: 'tiktok_short', contentType: 'short', label: { ar: 'TikTok', en: 'TikTok' },
    titleMax: null, captionMax: 2200, hashtagMax: 30, hashtagRecommended: [5, 7]
  },
  instagram_reel: {
    id: 'instagram_reel', contentType: 'short', label: { ar: 'Instagram Reels', en: 'Instagram Reels' },
    titleMax: null, captionMax: 2200, hashtagMax: 30, hashtagRecommended: [5, 10]
  },
  x_post: {
    id: 'x_post', contentType: 'short', label: { ar: 'X (Twitter)', en: 'X (Twitter)' },
    titleMax: null, captionMax: 280, hashtagMax: 3, hashtagRecommended: [2, 3]
  },
  youtube_live: {
    id: 'youtube_live', contentType: 'live', label: { ar: 'YouTube Live', en: 'YouTube Live' },
    titleMax: 100, captionMax: 5000, hashtagMax: 15, hashtagRecommended: [3, 5]
  },
  twitch_live: {
    id: 'twitch_live', contentType: 'live', label: { ar: 'Twitch', en: 'Twitch' },
    titleMax: 140, captionMax: null, hashtagMax: 0, hashtagRecommended: [0, 0],
    // Twitch: up to 10 tags, 25 characters each, letters and numbers only
    streamTags: { maxTags: 10, maxLen: 25 }
  },
  kick_live: {
    id: 'kick_live', contentType: 'live', label: { ar: 'Kick', en: 'Kick' },
    titleMax: 255, captionMax: null, hashtagMax: 0, hashtagRecommended: [0, 0],
    // Kick does not publish exact tag limits; Twitch's rules are used as a safe default
    streamTags: { maxTags: 10, maxLen: 25 }
  },
  tiktok_live: {
    id: 'tiktok_live', contentType: 'live', label: { ar: 'TikTok Live', en: 'TikTok Live' },
    titleMax: 32, captionMax: null, hashtagMax: 0, hashtagRecommended: [0, 0]
  }
};

export const PLATFORMS_BY_TYPE = CONTENT_TYPES.reduce((acc, type) => {
  acc[type] = Object.values(PLATFORMS).filter((p) => p.contentType === type).map((p) => p.id);
  return acc;
}, {});

const DEFAULT_PLATFORMS = { video: ['youtube_video'], short: ['youtube_short'], live: ['youtube_live'] };

// Smallest non-empty value of `key` across the platforms, or `fallback`
const minOf = (picked, key, fallback) => {
  const values = picked.map((p) => p[key]).filter((v) => typeof v === 'number');
  return values.length ? Math.min(...values) : fallback;
};

// Strictest limits across the selected platforms (used for counters, warnings and prompts)
export function strictestLimits(platformIds) {
  const picked = platformIds.map((id) => PLATFORMS[id]).filter(Boolean);
  if (picked.length === 0) return { titleMax: 100, captionMax: 5000, hashtagMax: 15, hashtagRecommended: [3, 5] };
  const hashtagMax = Math.min(...picked.map((p) => p.hashtagMax));
  const recMax = Math.min(hashtagMax, ...picked.map((p) => p.hashtagRecommended[1]));
  // Platforms can disagree (Instagram 5-10, X 2-3): the range is clamped so min never exceeds max
  const recMin = Math.min(recMax, Math.max(...picked.map((p) => p.hashtagRecommended[0])));
  return {
    titleMax: minOf(picked, 'titleMax', 100),
    captionMax: minOf(picked, 'captionMax', 5000),
    hashtagMax,
    hashtagRecommended: [recMin, recMax]
  };
}

// Keeps only known platforms of this type, with at least one selected
const cleanPlatforms = (type, list) => {
  const allowed = PLATFORMS_BY_TYPE[type];
  const kept = Array.isArray(list) ? list.filter((id) => allowed.includes(id)) : [];
  return kept.length ? [...new Set(kept)] : [...DEFAULT_PLATFORMS[type]];
};

// Saved plan: the open studio and the platforms picked in each studio.
// Older versions saved { contentType, platforms } for one studio only; that is migrated here.
export function loadContentPlan() {
  let parsed = null;
  try {
    parsed = JSON.parse(localStorage.getItem('content_plan') || 'null');
  } catch {
    parsed = null;
  }
  const type = CONTENT_TYPES.includes(parsed && parsed.contentType) ? parsed.contentType : 'video';
  const saved = (parsed && parsed.platformsByType) || {};
  const platformsByType = {};
  for (const t of CONTENT_TYPES) {
    const legacy = !parsed?.platformsByType && t === type ? parsed?.platforms : null;
    platformsByType[t] = cleanPlatforms(t, saved[t] || legacy);
  }
  return { contentType: type, platformsByType };
}

export const normalizePlan = (plan) => ({
  contentType: CONTENT_TYPES.includes(plan?.contentType) ? plan.contentType : 'video',
  platformsByType: Object.fromEntries(CONTENT_TYPES.map((t) => [t, cleanPlatforms(t, plan?.platformsByType?.[t])]))
});

// Text added to every generation prompt so the model respects each platform's limits
export function buildPlanRules(platformIds) {
  const lines = platformIds
    .map((id) => PLATFORMS[id])
    .filter(Boolean)
    .map((p) => {
      const tags = p.hashtagMax === 0
        ? 'no hashtags'
        : `hashtags: ${p.hashtagRecommended[0]}-${p.hashtagRecommended[1]} (never more than ${p.hashtagMax})`;
      const parts = [];
      if (p.titleMax) parts.push(`title at most ${p.titleMax} characters`);
      if (p.captionMax && p.contentType === 'short') parts.push(`caption at most ${p.captionMax} characters including hashtags`);
      if (!p.titleMax) parts.push('no title field (caption only)');
      return `- ${p.label.en}: ${parts.join('; ')}; ${tags}.`;
    });
  if (lines.length === 0) return '';
  return `\n\nPlatform rules (must follow strictly):\n${lines.join('\n')}`;
}
