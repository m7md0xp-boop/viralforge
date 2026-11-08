import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats } from '../src/utils/history.js';
import { checkText, countChars, countHashtags } from '../src/utils/titleCheck.js';
import { normalizeUrl, sanitizeProfile } from '../src/services/channelProfile.js';
import { buildPlanRules, loadContentPlan, strictestLimits } from '../src/config/platforms.js';
import { detectGenre, schemaExample, buildSchema } from '../src/config/prompts.js';

test('characters are counted the way platforms count them (emoji = 1)', () => {
  assert.equal(countChars('Hi 🔥'), 4);
  assert.equal(countHashtags('#one #اثنين #3 # not'), 3);
});

test('title warnings: length and hashtags', () => {
  const limits = { titleMax: 10, hashtagMax: 2, hashtagRecommended: [1, 1] };
  const kinds = checkText('A long title #a #b #c', limits).warnings.map((w) => w.kind);
  assert.deepEqual(kinds, ['length', 'hashtagsOver']);
  assert.deepEqual(checkText('Short #a #b', { titleMax: 100, hashtagMax: 5, hashtagRecommended: [1, 1] }).warnings.map((w) => w.kind), ['hashtagsHigh']);
});

test('dashboard statistics', () => {
  const stats = computeStats([
    { contentType: 'video', platforms: ['youtube_video'], hasDescription: true },
    { contentType: 'live', platforms: ['twitch_live', 'kick_live'], hasDescription: false },
    { contentType: 'live', platforms: ['twitch_live'], hasDescription: false }
  ]);
  assert.equal(stats.total, 3);
  assert.equal(stats.withDescription, 1);
  assert.deepEqual(stats.byType[0], ['live', 2]);
  assert.deepEqual(stats.byPlatform[0], ['twitch_live', 2]);
});

test('channel links: https added, only http(s) accepted', () => {
  assert.equal(normalizeUrl('youtube.com/@me'), 'https://youtube.com/@me');
  assert.equal(normalizeUrl('javascript:alert(1)'), '');
  assert.equal(normalizeUrl('ftp://x.com'), '');
  const p = sanitizeProfile({ channelName: '  Name  ', channelUrl: 'bad url with spaces', style: 'unknown' });
  assert.equal(p.channelName, 'Name');
  assert.equal(p.channelUrl, '');
  assert.equal(p.style, 'energetic');
  assert.equal(p.onboarded, false);
});

test('content plan: old saved format is migrated, junk is ignored', () => {
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  try {
    store.set('content_plan', JSON.stringify({ contentType: 'short', platforms: ['tiktok_short', 'twitch_live'] }));
    const plan = loadContentPlan();
    assert.equal(plan.contentType, 'short');
    assert.deepEqual(plan.platformsByType.short, ['tiktok_short']);
    assert.deepEqual(plan.platformsByType.live, ['youtube_live']);
    store.set('content_plan', '{not json');
    assert.equal(loadContentPlan().contentType, 'video');
  } finally {
    delete globalThis.localStorage;
  }
});

test('no platform -> safe defaults; plan rules are empty', () => {
  assert.equal(strictestLimits([]).titleMax, 100);
  assert.equal(buildPlanRules([]), '');
});

test('thumbnail genre from the game name, in Arabic too', () => {
  assert.equal(detectGenre('Phasmophobia horror'), 'horror');
  assert.equal(detectGenre('محاكي المزرعة'), 'simulation');
  assert.equal(detectGenre('Call of Duty'), 'action');
});

test('schema example for providers without a native JSON schema', () => {
  const example = JSON.parse(schemaExample(buildSchema('video')));
  assert.deepEqual(Object.keys(example), ['videoTitles', 'description', 'hashtags']);
  assert.deepEqual(Object.keys(example.videoTitles[0]), ['title', 'score', 'seo', 'ctr']);
});
