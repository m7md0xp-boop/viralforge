// Prompt templates for each content section, plus the YouTuber thumbnail prompt.
// Pure functions only (no React, no network), so they can be tested in Node.

const LANG_NAME = { ar: 'Arabic', en: 'English' };

// Gemini-style response schemas (uppercase types). Other providers get a JSON example built from the same schema.
const titleItem = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    score: { type: 'INTEGER' },
    seo: { type: 'INTEGER' },
    ctr: { type: 'INTEGER' }
  },
  required: ['title', 'score', 'seo', 'ctr']
};
const hashtagsProp = { type: 'ARRAY', items: { type: 'STRING' } };

export const SECTION_SCHEMAS = {
  // Long videos (YouTube): comprehensive titles, detailed description, trending hashtags
  video: {
    properties: {
      videoTitles: { type: 'ARRAY', items: titleItem },
      description: { type: 'STRING' },
      hashtags: hashtagsProp
    },
    required: ['videoTitles', 'description', 'hashtags']
  },
  // Shorts, TikTok, Reels, X: very short description + trending hashtags
  short: {
    properties: {
      description: { type: 'STRING' },
      hashtags: hashtagsProp
    },
    required: ['description', 'hashtags']
  },
  // Live streams (Twitch, Kick, YouTube Live, TikTok Live): short catchy stream templates
  live: {
    properties: {
      templates: { type: 'ARRAY', items: { type: 'STRING' } }
    },
    required: ['templates']
  }
};

// Builds the schema for the parts a request needs (e.g. video without titles = description + hashtags only).
export function buildSchema(section, { titles = true, description = true } = {}) {
  const base = SECTION_SCHEMAS[section] || SECTION_SCHEMAS.video;
  const properties = {};
  const required = [];
  for (const key of Object.keys(base.properties)) {
    if (key === 'videoTitles' && !titles) continue;
    if (key === 'description' && !description) continue;
    properties[key] = base.properties[key];
    required.push(key);
  }
  return { type: 'OBJECT', properties, required };
}

// Turns a schema into a JSON example the model can copy (used by providers without responseSchema).
export function schemaExample(schema) {
  const upper = (t) => String(t || '').toUpperCase();
  const build = (s) => {
    switch (upper(s.type)) {
      case 'OBJECT': {
        const out = {};
        for (const [k, v] of Object.entries(s.properties || {})) out[k] = build(v);
        return out;
      }
      case 'ARRAY':
        return [build(s.items || { type: 'STRING' })];
      case 'INTEGER':
        return 0;
      default:
        return '...';
    }
  };
  return JSON.stringify(build(schema), null, 2);
}

const titlesRule = (game, ep) =>
  `3 long, search-optimized video titles for ${game}${ep ? ` episode ${ep}` : ''} (each under 100 characters). ` +
  'For each title give: score (viral appeal 0-100), seo (search optimisation 0-100), ctr (estimated click-through 0-100).';

const descriptionRule = (game, ep, lang) =>
  `A detailed YouTube description in ${LANG_NAME[lang] || 'Arabic'} (150-250 words): a strong hook in the first two lines, ` +
  `what happens in ${game}${ep ? ` episode ${ep}` : ''}, and a short call to subscribe and comment. ` +
  'Do NOT put hashtags inside the description; they go in the hashtags field.';

const hashtagsRule = (game) =>
  `"hashtags": 10-15 currently trending YouTube hashtags for ${game} and its genre, each starting with # and with no spaces. ` +
  'Mix broad gaming tags with game-specific tags. Return them only in this field.';

// Optional style guide from the user's own description template
const templateStyle = (template, useCustomTemplate) =>
  useCustomTemplate && template
    ? `Follow the writing style and structure of this template (do not copy its placeholders):\n${template}\n`
    : '';

export function buildSectionPrompt({ section, game, ep, lang, template, useCustomTemplate, userText, wantTitles, wantDescription, titleContext }) {
  const epPart = ep ? `, episode: ${ep}` : '';
  const langName = LANG_NAME[lang] || 'Arabic';

  if (userText) {
    return (
      `You are a gaming YouTube/social media expert. The user's custom request: '${userText}'.\n` +
      `Return a JSON object with exactly these keys: ${Object.keys(SECTION_SCHEMAS[section].properties).join(', ')}. ` +
      `Write in ${langName}. Return only the JSON.`
    );
  }

  if (section === 'short') {
    return (
      `You are a short-form video copywriter for ${game}${epPart}. Write in ${langName}.\n` +
      `"description": ONE very short, punchy caption (1-2 sentences, under 150 characters) with a hook and a reason to watch. ` +
      `${hashtagsRule(game)}`
    );
  }

  if (section === 'live') {
    return (
      `You are a live-stream copywriter for ${game}${epPart}. Write in ${langName}.\n` +
      `"templates": 3 very short, catchy live-stream titles or descriptions (each under 140 characters). ` +
      'Each one needs an energetic hook and a call to follow or join the stream. Make them distinct from each other.'
    );
  }

  // video (long content)
  const parts = [];
  if (wantTitles) parts.push(`"videoTitles": ${titlesRule(game, ep)}${titleContext ? ` Avoid repeating these: ${titleContext}.` : ''}`);
  if (wantDescription) parts.push(`"description": ${descriptionRule(game, ep, lang)}`);
  parts.push(hashtagsRule(game));
  return (
    `You are a senior YouTube SEO copywriter for gaming channels. Game: ${game}${epPart}. Write in ${langName}.\n` +
    templateStyle(template, useCustomTemplate) +
    `Return a JSON object with these fields:\n- ${parts.join('\n- ')}\nReturn only the JSON.`
  );
}

// ----- Thumbnail prompt (YouTuber style, adapted to the game's genre) -----

const GENRE_RULES = [
  {
    genre: 'horror',
    test: /horror|scary|fear|ghost|zombie|haunt|survival horror|رعب|مرعب|خوف|اشباح|أشباح|زومبي|زومبيز/i,
    scene:
      'Extreme close-up of the person from the reference photo with a genuine shock-and-terror expression: eyes wide, mouth open, ' +
      'pale skin, sweat on the forehead. Lit by a flickering red and green horror glow, with a creepy in-game monster or dark corridor blurred behind.'
  },
  {
    genre: 'simulation',
    test: /simulat|simulator|tycoon|farm|farming|build|building|craft|minecraft|roblox|sandbox|cook|restaurant|manage|محاكاة|محاكي|مزرعة|زراعة|بناء|تطوير|روبلوكس|طبخ/i,
    scene:
      'The person from the reference photo wearing a costume that fits the game\'s job (overalls and a straw hat for farming, a hard hat and ' +
      'safety vest for building or engineering, a chef apron for cooking), performing a real action with a prop or tool: ' +
      'carrying a heavy sack or block, operating equipment, or building and dismantling a structure. Bright, colourful in-game world behind.'
  },
  {
    genre: 'action',
    test: null, // default
    scene:
      'The person from the reference photo in a dynamic action pose with an intense, confident expression, holding the game\'s weapon or vehicle. ' +
      'Dramatic rim lighting and an explosive in-game background.'
  }
];

export function detectGenre(game = '', topic = '') {
  const text = `${game} ${topic}`;
  const match = GENRE_RULES.find((r) => r.test && r.test.test(text));
  return match ? match.genre : 'action';
}

// `gameTitle` is shown as bold 3D text. Keep the game name exactly as the user wrote it.
export function buildThumbnailPrompt({ game = 'My Game', ep = '', topic = '' }) {
  const genre = detectGenre(game, topic);
  const rule = GENRE_RULES.find((r) => r.genre === genre);
  const label = ep ? `${game} ${ep}` : game;
  return [
    `YouTube thumbnail, 16:9 (1280x720), ${genre} style. Use the attached reference photo as the exact face and identity of the person; keep their facial features.`,
    `Scene: ${rule.scene}`,
    'Composition: the face is large (about 40% of the frame), placed on one third, with strong emotional expression. High contrast, saturated colours, shallow depth of field, clean and uncluttered.',
    `Text: bold, extruded 3D lettering reading exactly "${label}" with a thick outline, placed in a clear area and readable at small size.`,
    topic ? `Video topic: ${topic}.` : ''
  ]
    .filter(Boolean)
    .join('\n');
}
