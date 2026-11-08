import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzePixels, scoreMetrics, combineScores, scoreGrade, ramp, band, colorfulness, largestRegion } from '../src/utils/imageAnalysis.js';
import { nextEpisode, recordInSeries, findSeries, forgetSeries, seriesPromptContext, seriesKey } from '../src/utils/series.js';
import { createEntry, entryTitles, entryText, filterEntries, entryHeadline } from '../src/utils/libraryEntries.js';
import { buildVisionRequest, readJsonResponse } from '../src/services/providerRequests.js';
import { buildVisionPrompt, normalizeVisionReview } from '../src/utils/visionReview.js';
import { buildSectionPrompt } from '../src/config/prompts.js';

// ---------- synthetic images ----------
const solid = (w, h, [r, g, b]) => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) data.set([r, g, b, 255], i);
  return { data, width: w, height: h };
};
// Bold thumbnail: saturated halves, a skin-coloured block (a "face") and white bars ("text")
const bold = (w = 320, h = 180) => {
  const img = solid(w, h, [20, 30, 160]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (x > w / 2) img.data.set([230, 40, 30, 255], i);
      if (x > w * 0.1 && x < w * 0.42 && y > h * 0.15 && y < h * 0.8) img.data.set([224, 172, 140, 255], i);
      if (y > h * 0.82 && y < h * 0.92 && x % 24 < 14) img.data.set([255, 255, 255, 255], i);
    }
  }
  return img;
};

test('scoring helpers', () => {
  assert.equal(ramp(50, 0, 100), 50);
  assert.equal(ramp(-5, 0, 100), 0);
  assert.equal(ramp(30, 60, 20), 75); // works in the falling direction too
  assert.equal(band(100, 0, 50, 150, 200), 100);
  assert.equal(band(25, 0, 50, 150, 200), 50);
});

test('a grey, low-resolution 4:3 image scores low on the right checks', () => {
  const metrics = analyzePixels(solid(320, 240, [128, 128, 128]), { width: 320, height: 240 });
  const byId = Object.fromEntries(scoreMetrics(metrics).checks.map((c) => [c.id, c]));
  assert.equal(byId.contrast.status, 'bad');
  assert.equal(byId.color.status, 'bad');
  assert.equal(byId.aspect.status, 'bad');
  assert.equal(byId.resolution.status, 'bad');
  assert.ok(scoreMetrics(metrics).score < 45);
});

test('a bold 1280x720 thumbnail scores clearly better and finds the face area', () => {
  const metrics = analyzePixels(bold(), { width: 1280, height: 720 });
  const result = scoreMetrics(metrics);
  const byId = Object.fromEntries(result.checks.map((c) => [c.id, c]));
  assert.equal(byId.resolution.status, 'good');
  assert.equal(byId.aspect.status, 'good');
  assert.equal(byId.color.status, 'good');
  assert.ok(metrics.face.box > 0.15, `face box ${metrics.face.box}`);
  assert.ok(result.score > 60, `score ${result.score}`);
  assert.equal(result.checks.length, 9);
});

test('colourfulness: grey is 0, saturated is high', () => {
  assert.equal(Math.round(colorfulness(solid(10, 10, [90, 90, 90]))), 0);
  assert.ok(colorfulness(bold(40, 20)) > 50);
});

test('largest region of a mask', () => {
  // Two separate regions: an L of 5 cells and a single cell in the corner
  const mask = new Uint8Array([1, 1, 0, 0, 1, 1, 1, 0, 0]);
  const region = largestRegion(mask, 3, 3);
  assert.equal(region.pixels, 4);
  assert.equal(largestRegion(new Uint8Array(9), 3, 3).pixels, 0);
});

test('final score weighs the AI review when there is one', () => {
  assert.equal(combineScores(50, null), 50);
  assert.equal(combineScores(50, 100), 80);
  assert.equal(scoreGrade(90), 'excellent');
  assert.equal(scoreGrade(40), 'weak');
});

// ---------- series memory ----------
test('next episode keeps the format', () => {
  assert.equal(nextEpisode('7'), '8');
  assert.equal(nextEpisode('09'), '10');
  assert.equal(nextEpisode('007'), '008');
  assert.equal(nextEpisode('Part 5'), 'Part 6');
  assert.equal(nextEpisode('الحلقة ٩'), 'الحلقة 10');
  assert.equal(nextEpisode('S2 E3'), 'S2 E4');
  assert.equal(nextEpisode('finale'), '');
});

test('series store records episodes and titles, newest first, no duplicates', () => {
  let store = {};
  store = recordInSeries(store, { game: ' Minecraft ', episode: '7', titles: ['A', 'B'] });
  store = recordInSeries(store, { game: 'minecraft', episode: '8', titles: ['C', 'A'] });
  const s = findSeries(store, 'MINECRAFT');
  assert.equal(s.lastEpisode, '8');
  assert.deepEqual(s.titles, ['C', 'A', 'B']);
  assert.equal(s.count, 2);
  assert.equal(seriesKey('  Elden   Ring '), 'elden ring');
  assert.equal(recordInSeries({}, { game: 'My Game', titles: ['x'] })['my game'], undefined);
  assert.equal(findSeries(forgetSeries(store, 'Minecraft'), 'Minecraft'), null);
});

test('series context goes into the prompt', () => {
  const store = recordInSeries({}, { game: 'Minecraft', episode: '7', titles: ['Old title'] });
  const context = seriesPromptContext(findSeries(store, 'Minecraft'));
  assert.match(context, /last episode: 7/);
  assert.match(context, /Old title/);
  const prompt = buildSectionPrompt({ section: 'video', game: 'Minecraft', ep: '8', lang: 'en', wantTitles: true, wantDescription: false, seriesContext: context });
  assert.match(prompt, /never repeat or closely paraphrase/);
  assert.equal(seriesPromptContext(null), '');
});

// ---------- library ----------
test('library entries: no image stored, titles, text, search and filters', () => {
  const a = createEntry({
    studio: 'video',
    game: 'Minecraft',
    platforms: ['youtube_video'],
    results: { videoTitles: [{ title: 'Night one' }], description: 'Desc', generatedImage: { src: 'data:...' }, entryId: 'x' },
    at: '2026-01-02T00:00:00Z'
  });
  const b = { ...createEntry({ studio: 'live', game: 'Fortnite', results: { liveTitles: ['Live now'], streamMeta: { twitch: { category: 'Fortnite', tags: ['Arabic'] } } }, at: '2026-01-03T00:00:00Z' }), favorite: true };
  assert.equal(a.results.generatedImage, undefined);
  assert.equal(a.results.entryId, undefined);
  assert.deepEqual(entryTitles(a), ['Night one']);
  assert.equal(entryHeadline(b), 'Live now');
  assert.match(entryText(b), /Fortnite\nArabic/);
  assert.deepEqual(filterEntries([a, b]).map((e) => e.game), ['Fortnite', 'Minecraft']);
  assert.deepEqual(filterEntries([a, b], { query: 'night' }).map((e) => e.game), ['Minecraft']);
  assert.deepEqual(filterEntries([a, b], { studio: 'video' }).map((e) => e.game), ['Minecraft']);
  assert.deepEqual(filterEntries([a, b], { favoritesOnly: true }).map((e) => e.game), ['Fortnite']);
  assert.notEqual(a.id, b.id);
});

// ---------- vision requests ----------
const catalog = JSON.parse(readFileSync(new URL('../shared/aiProviders.json', import.meta.url), 'utf8'));
const provider = (id) => catalog.providers.find((p) => p.id === id);
const image = { mime: 'image/jpeg', base64: '/9j/AAA' };

test('vision flags: only providers whose models see images', () => {
  assert.deepEqual(catalog.providers.filter((p) => p.vision).map((p) => p.id).sort(), ['chatgpt', 'claude', 'gemini']);
});

test('vision request per format carries the image', () => {
  const gemini = buildVisionRequest(provider('gemini'), { key: 'k', prompt: 'p', image });
  assert.match(gemini.url, /:generateContent$/);
  assert.equal(gemini.body.contents[0].parts[1].inlineData.data, '/9j/AAA');
  const openai = buildVisionRequest(provider('chatgpt'), { key: 'k', prompt: 'p', image });
  assert.equal(openai.body.messages[0].content[1].image_url.url, 'data:image/jpeg;base64,/9j/AAA');
  assert.equal(openai.headers.Authorization, 'Bearer k');
  const claude = buildVisionRequest(provider('claude'), { key: 'k', prompt: 'p', image });
  assert.equal(claude.body.messages[0].content[0].source.media_type, 'image/jpeg');
  assert.throws(() => buildVisionRequest(provider('groq'), { key: 'k', prompt: 'p', image }));
  assert.equal(readJsonResponse(provider('gemini'), { candidates: [{ content: { parts: [{ text: '{"a":1}' }] } }] }), '{"a":1}');
});

test('vision prompt and reply normalisation', () => {
  assert.match(buildVisionPrompt({ title: 'My title', lang: 'ar' }), /"My title"[\s\S]*Arabic/);
  const review = normalizeVisionReview({ score: '87', face: { present: 1, score: 140 }, strengths: ['a', '', 'b'], improvements: 'nope' });
  assert.equal(review.score, 87);
  assert.equal(review.face.score, 100);
  assert.equal(review.face.present, true);
  assert.deepEqual(review.strengths, ['a', 'b']);
  assert.deepEqual(review.improvements, []);
  assert.equal(review.composition, null);
  assert.equal(normalizeVisionReview(null).score, null);
});
