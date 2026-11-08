// Character and hashtag rules per platform.
// titleMax: max characters of a title or caption. hashtagMax: hard limit. hashtagRecommended: [min, max] suggested range.
// Values come from the platforms' published limits, except where noted in the README.
export const CONTENT_TYPES = ['video', 'short', 'live'];

export const PLATFORMS = {
  youtube_video: {
    id: 'youtube_video', contentType: 'video', label: { ar: 'YouTube (مقطع)', en: 'YouTube (video)' },
    titleMax: 100, descriptionMax: 5000, hashtagMax: 15, hashtagRecommended: [3, 5]
  },
  youtube_short: {
    id: 'youtube_short', contentType: 'short', label: { ar: 'YouTube Shorts', en: 'YouTube Shorts' },
    titleMax: 100, hashtagMax: 15, hashtagRecommended: [3, 5]
  },
  tiktok_short: {
    id: 'tiktok_short', contentType: 'short', label: { ar: 'TikTok', en: 'TikTok' },
    titleMax: 2200, hashtagMax: 30, hashtagRecommended: [5, 7]
  },
  instagram_reel: {
    id: 'instagram_reel', contentType: 'short', label: { ar: 'Instagram Reels', en: 'Instagram Reels' },
    titleMax: 2200, hashtagMax: 30, hashtagRecommended: [5, 10]
  },
  x_post: {
    id: 'x_post', contentType: 'short', label: { ar: 'X (Twitter)', en: 'X (Twitter)' },
    titleMax: 280, hashtagMax: 3, hashtagRecommended: [2, 3]
  },
  youtube_live: {
    id: 'youtube_live', contentType: 'live', label: { ar: 'YouTube Live', en: 'YouTube Live' },
    titleMax: 100, hashtagMax: 15, hashtagRecommended: [3, 5]
  },
  twitch_live: {
    id: 'twitch_live', contentType: 'live', label: { ar: 'Twitch', en: 'Twitch' },
    titleMax: 140, hashtagMax: 0, hashtagRecommended: [0, 0]
  },
  kick_live: {
    id: 'kick_live', contentType: 'live', label: { ar: 'Kick', en: 'Kick' },
    titleMax: 255, hashtagMax: 0, hashtagRecommended: [0, 0]
  },
  tiktok_live: {
    id: 'tiktok_live', contentType: 'live', label: { ar: 'TikTok Live', en: 'TikTok Live' },
    titleMax: 32, hashtagMax: 0, hashtagRecommended: [0, 0]
  }
};

export const PLATFORMS_BY_TYPE = CONTENT_TYPES.reduce((acc, type) => {
  acc[type] = Object.values(PLATFORMS).filter((p) => p.contentType === type).map((p) => p.id);
  return acc;
}, {});

export const DEFAULT_PLAN = { contentType: 'video', platforms: ['youtube_video'] };

// Strictest limits across the selected platforms (used for counters and warnings)
export function strictestLimits(platformIds) {
  const picked = platformIds.map((id) => PLATFORMS[id]).filter(Boolean);
  if (picked.length === 0) return { titleMax: 100, hashtagMax: 15, hashtagRecommended: [3, 5] };
  const hashtagMax = Math.min(...picked.map((p) => p.hashtagMax));
  const recMax = Math.min(hashtagMax, ...picked.map((p) => p.hashtagRecommended[1]));
  // Platforms can disagree (Instagram 5-10, X 2-3): the range is clamped so min never exceeds max
  const recMin = Math.min(recMax, Math.max(...picked.map((p) => p.hashtagRecommended[0])));
  return {
    titleMax: Math.min(...picked.map((p) => p.titleMax)),
    hashtagMax,
    hashtagRecommended: [recMin, recMax]
  };
}

// Saved content plan (type + platforms). Falls back to the default when missing or invalid.
export function loadContentPlan() {
  try {
    const parsed = JSON.parse(localStorage.getItem('content_plan') || 'null');
    const type = CONTENT_TYPES.includes(parsed && parsed.contentType) ? parsed.contentType : DEFAULT_PLAN.contentType;
    const allowed = PLATFORMS_BY_TYPE[type];
    const platforms = Array.isArray(parsed && parsed.platforms)
      ? parsed.platforms.filter((id) => allowed.includes(id))
      : [];
    return { contentType: type, platforms: platforms.length ? platforms : [allowed[0]] };
  } catch {
    return { contentType: DEFAULT_PLAN.contentType, platforms: DEFAULT_PLAN.platforms };
  }
}

// Text added to every generation prompt so the model respects each platform's limits
export function buildPlanRules(platformIds) {
  const lines = platformIds
    .map((id) => PLATFORMS[id])
    .filter(Boolean)
    .map((p) => {
      const tags = p.hashtagMax === 0
        ? 'no hashtags'
        : `hashtags: ${p.hashtagRecommended[0]}-${p.hashtagRecommended[1]} (never more than ${p.hashtagMax})`;
      return `- ${p.label.en}: each title/caption at most ${p.titleMax} characters; ${tags}.`;
    });
  if (lines.length === 0) return '';
  return `\n\nPlatform rules (must follow strictly):\n${lines.join('\n')}\nAlso give each title a "seo" score (0-100, search relevance) and a "ctr" score (0-100, click appeal) in addition to "score".`;
}
