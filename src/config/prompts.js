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
const streamMetaProp = {
  type: 'OBJECT',
  properties: { category: { type: 'STRING' }, tags: { type: 'ARRAY', items: { type: 'STRING' } } },
  required: ['category', 'tags']
};

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
  // Shorts, TikTok, Reels, X: YouTube Shorts titles + very short caption + trending hashtags
  short: {
    properties: {
      shortTitles: { type: 'ARRAY', items: { type: 'STRING' } },
      description: { type: 'STRING' },
      hashtags: hashtagsProp
    },
    required: ['shortTitles', 'description', 'hashtags']
  },
  // Live streams (Twitch, Kick, YouTube Live, TikTok Live): short stream titles,
  // plus a category and tags for Twitch and Kick
  live: {
    properties: {
      templates: { type: 'ARRAY', items: { type: 'STRING' } },
      twitch: streamMetaProp,
      kick: streamMetaProp
    },
    required: ['templates', 'twitch', 'kick']
  }
};

// Builds the schema for the parts a request needs (e.g. video without titles = description + hashtags only).
// `streamPlatforms`: live only, the keys of the stream-meta blocks to include ('twitch', 'kick').
export function buildSchema(section, { titles = true, description = true, streamPlatforms = [] } = {}) {
  const base = SECTION_SCHEMAS[section] || SECTION_SCHEMAS.video;
  const properties = {};
  const required = [];
  for (const key of Object.keys(base.properties)) {
    if ((key === 'videoTitles' || key === 'shortTitles') && !titles) continue;
    if (key === 'description' && !description) continue;
    if ((key === 'twitch' || key === 'kick') && !streamPlatforms.includes(key)) continue;
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

const titlesRule = (topic, ep) =>
  `3 long, search-optimized video titles for ${topic}${ep ? ` episode ${ep}` : ''} (each under 100 characters). ` +
  'For each title give: score (viral appeal 0-100), seo (search optimisation 0-100), ctr (estimated click-through 0-100).';

// `bodyOnly`: the user's template already holds the call to action and the links, so the AI writes only the body.
const descriptionRule = (topic, ep, lang, bodyOnly) =>
  bodyOnly
    ? `The main text of a YouTube description in ${LANG_NAME[lang] || 'Arabic'} (80-150 words): a strong hook in the first two lines ` +
      `and what happens in ${topic}${ep ? ` episode ${ep}` : ''}. No links, no call to subscribe and no hashtags: the rest of the description is added by the app.`
    : `A detailed YouTube description in ${LANG_NAME[lang] || 'Arabic'} (150-250 words): a strong hook in the first two lines, ` +
      `what happens in ${topic}${ep ? ` episode ${ep}` : ''}, and a short call to subscribe and comment. ` +
      'Do NOT put hashtags inside the description; they go in the hashtags field.';

// YouTube shows at most 3 hashtags above the title and ignores all of them past 15, so 3-5 is the default.
export const DEFAULT_HASHTAG_RANGE = [3, 5];
const hashtagsRule = (topic, [min, max] = DEFAULT_HASHTAG_RANGE) =>
  `"hashtags": ${min === max ? min : `${min}-${max}`} relevant, currently trending hashtags for ${topic} (never more than ${max}), ` +
  'each starting with # and with no spaces. Put the most specific one first. Return them only in this field.';

// Template used as a style guide when it has no {ai_description} slot. It arrives with the user's links already filled in.
const templateStyle = (template, useCustomTemplate) =>
  useCustomTemplate && template
    ? `Follow the writing style and structure of this template, and keep every link line from it exactly as written:\n${template}\n`
    : '';

const styleLine = (styleHint) => (styleHint ? `Tone: ${styleHint}\n` : '');

// The user's free-text request (chat studio) becomes the topic of the normal section prompt,
// so chat mode returns the same fields as quick mode for the selected content type.
const requestLine = (userText) =>
  userText ? `The creator's request (treat it as the topic and follow its wishes): '${userText}'.\n` : '';

export function buildSectionPrompt({
  section,
  game,
  ep,
  lang,
  template,
  useCustomTemplate,
  templateHasSlot = false,
  userText = '',
  wantTitles,
  wantDescription,
  titleContext,
  hashtagRange = DEFAULT_HASHTAG_RANGE,
  styleHint = '',
  // Shorts and live: the second input field ("what happens in the clip" / "stream idea")
  details = '',
  // Strictest title and caption lengths of the selected platforms
  titleMax = 100,
  captionMax = 5000,
  // Live: stream-meta blocks to fill ('twitch', 'kick')
  streamPlatforms = [],
  // Series memory (utils/series.js): earlier titles of this game, to keep the style and avoid repeats
  seriesContext = ''
}) {
  const topic = game || "the topic in the creator's request";
  const epPart = ep ? `, episode: ${ep}` : '';
  const langName = LANG_NAME[lang] || 'Arabic';
  const intro =
    requestLine(userText) + styleLine(styleHint) + (details ? `Details: ${details}\n` : '') + (seriesContext ? `${seriesContext}\n` : '');
  const noTags = !hashtagRange || hashtagRange[1] === 0;

  if (section === 'short') {
    const parts = [];
    if (wantTitles) {
      parts.push(
        `"shortTitles": 3 YouTube Shorts titles, each at most ${Math.min(titleMax, 100)} characters (aim for under 60). ` +
          'Hook in the first words, no hashtags in the title, all three distinct.' +
          (titleContext ? ` Avoid repeating these: ${titleContext}.` : '')
      );
    }
    if (wantDescription) {
      parts.push(
        `"description": ONE very short, punchy caption (1-2 sentences) with a hook and a reason to watch. ` +
          `Caption plus hashtags must stay under ${Math.min(captionMax, 300)} characters.`
      );
    }
    parts.push(noTags ? '"hashtags": return an empty list.' : hashtagsRule(topic, hashtagRange));
    return (
      `You are a short-form video copywriter for ${topic}${epPart}. Write in ${langName}.\n` +
      intro +
      `Return a JSON object with these fields:\n- ${parts.join('\n- ')}\nReturn only the JSON.`
    );
  }

  if (section === 'live') {
    const parts = [
      `"templates": 3 catchy live-stream titles, each at most ${titleMax} characters (count every character, emoji included). ` +
        'Each one needs an energetic hook and a reason to join now. Make them distinct from each other.' +
        (titleContext ? ` Avoid repeating these: ${titleContext}.` : '')
    ];
    if (streamPlatforms.includes('twitch')) {
      parts.push(
        '"twitch": { "category": the exact Twitch category name as listed in the Twitch directory (usually the game, or "Just Chatting"), ' +
          '"tags": up to 10 Twitch tags, each 1-25 letters or digits with no spaces, no # and no symbols }'
      );
    }
    if (streamPlatforms.includes('kick')) {
      parts.push(
        '"kick": { "category": the exact Kick category name (usually the game, or "Just Chatting"), ' +
          '"tags": up to 10 Kick tags, each 1-25 letters or digits with no spaces, no # and no symbols }'
      );
    }
    return (
      `You are a live-stream copywriter for ${topic}${epPart}. Write in ${langName} (category names stay as listed on the platform).\n` +
      intro +
      `Return a JSON object with these fields:\n- ${parts.join('\n- ')}\nReturn only the JSON.`
    );
  }

  // video (long content)
  const bodyOnly = useCustomTemplate && templateHasSlot;
  const parts = [];
  if (wantTitles) parts.push(`"videoTitles": ${titlesRule(topic, ep)}${titleContext ? ` Avoid repeating these: ${titleContext}.` : ''}`);
  if (wantDescription) parts.push(`"description": ${descriptionRule(topic, ep, lang, bodyOnly)}`);
  parts.push(hashtagsRule(topic, hashtagRange));
  return (
    `You are a senior YouTube SEO copywriter for gaming channels. Game: ${topic}${epPart}. Write in ${langName}.\n` +
    intro +
    (bodyOnly || !wantDescription ? '' : templateStyle(template, useCustomTemplate)) +
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
// `hasReference`: the user attached a photo of their face. Without one, the prompt describes a generic gamer
// instead of pointing at a photo that does not exist.
export function buildThumbnailPrompt({ game = 'My Game', ep = '', topic = '', hasReference = false }) {
  const genre = detectGenre(game, topic);
  const rule = GENRE_RULES.find((r) => r.genre === genre);
  const label = ep ? `${game} ${ep}` : game;
  return [
    `YouTube thumbnail, 16:9 (1280x720), ${genre} style. ` +
      (hasReference
        ? 'Use the attached reference photo as the exact face and identity of the person; keep their facial features.'
        : 'The main character is an expressive young gamer YouTuber (no real person).'),
    `Scene: ${hasReference ? rule.scene : rule.scene.replace(/the person from the reference photo/gi, 'the gamer')}`,
    'Composition: the face is large (about 40% of the frame), placed on one third, with strong emotional expression. High contrast, saturated colours, shallow depth of field, clean and uncluttered.',
    `Text: bold, extruded 3D lettering reading exactly "${label}" with a thick outline, placed in a clear area and readable at small size.`,
    topic ? `Video topic: ${topic}.` : ''
  ]
    .filter(Boolean)
    .join('\n');
}
