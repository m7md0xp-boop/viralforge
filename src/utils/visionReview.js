// Prompt and reply shape of the Vision AI thumbnail review. Pure functions (tested in Node).

const LANG_NAME = { ar: 'Arabic', en: 'English' };

export function buildVisionPrompt({ title, lang }) {
  return [
    'You are a YouTube thumbnail expert for gaming channels. Review the attached thumbnail as it would appear in the YouTube feed (small, on a phone).',
    title ? `The video title shown next to it: "${title}".` : '',
    `Write every text value in ${LANG_NAME[lang] || 'Arabic'}.`,
    'Return ONLY one JSON object with these keys:',
    '"score": overall click appeal 0-100 (be strict: 90+ only for professional thumbnails),',
    '"face": { "present": true/false, "emotion": short text, "score": 0-100 for how big, clear and expressive the face is },',
    '"text": { "content": the words written on the image or "", "score": 0-100 for readability at small size (100 if no text is needed) },',
    '"composition": 0-100 (one clear subject, rule of thirds, no clutter),',
    '"curiosity": 0-100 (does it make people want to click; does it work with the title instead of repeating it),',
    '"strengths": 2-3 short points,',
    '"improvements": 3-5 short, concrete actions (what to change and how).'
  ]
    .filter(Boolean)
    .join('\n');
}

const num = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.min(100, Math.round(Number(v)))) : null);
const list = (v) => (Array.isArray(v) ? v.map((s) => String(s || '').trim()).filter(Boolean).slice(0, 6) : []);

// Normalises the model's reply so the UI always gets the same shape
export function normalizeVisionReview(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    score: num(r.score),
    face: { present: Boolean(r.face?.present), emotion: String(r.face?.emotion || ''), score: num(r.face?.score) },
    text: { content: String(r.text?.content || ''), score: num(r.text?.score) },
    composition: num(r.composition),
    curiosity: num(r.curiosity),
    strengths: list(r.strengths),
    improvements: list(r.improvements)
  };
}
