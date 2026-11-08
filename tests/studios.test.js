import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSchema, buildSectionPrompt } from '../src/config/prompts.js';
import { normalizePlan, strictestLimits, buildPlanRules } from '../src/config/platforms.js';
import { cleanStreamTags, normalizeStreamMeta } from '../src/utils/streamMeta.js';

const base = { game: 'Minecraft', ep: '', lang: 'en', template: '', useCustomTemplate: false };

test('shorts schema asks for titles only when YouTube Shorts is selected', () => {
  assert.ok('shortTitles' in buildSchema('short', { titles: true }).properties);
  assert.ok(!('shortTitles' in buildSchema('short', { titles: false }).properties));
});

test('shorts prompt asks for a title within the YouTube Shorts limit', () => {
  const prompt = buildSectionPrompt({ ...base, section: 'short', wantTitles: true, wantDescription: true, titleMax: 100, captionMax: 280 });
  assert.match(prompt, /"shortTitles": 3 YouTube Shorts titles, each at most 100 characters/);
  assert.match(prompt, /under 280 characters/);
});

test('live schema includes Twitch and Kick blocks only when selected', () => {
  const both = buildSchema('live', { titles: false, description: false, streamPlatforms: ['twitch', 'kick'] });
  assert.deepEqual(Object.keys(both.properties), ['templates', 'twitch', 'kick']);
  const none = buildSchema('live', { titles: false, description: false });
  assert.deepEqual(Object.keys(none.properties), ['templates']);
});

test('live prompt uses the strictest title limit (TikTok Live: 32)', () => {
  const limits = strictestLimits(['twitch_live', 'tiktok_live']);
  assert.equal(limits.titleMax, 32);
  const prompt = buildSectionPrompt({ ...base, section: 'live', titleMax: limits.titleMax, streamPlatforms: ['twitch'] });
  assert.match(prompt, /each at most 32 characters/);
  assert.match(prompt, /"twitch": \{ "category"/);
  assert.doesNotMatch(prompt, /"kick"/);
});

test('platforms without a title say so in the rules', () => {
  assert.match(buildPlanRules(['tiktok_short']), /TikTok: caption at most 2200 characters including hashtags; no title field/);
  assert.equal(strictestLimits(['tiktok_short', 'x_post']).captionMax, 280);
});

test('stream tags: letters and digits only, unique, max 10 x 25', () => {
  const tags = cleanStreamTags(['#Horror Game', 'horrorgame', 'عربي', 'a'.repeat(40), '!!', ...Array.from({ length: 12 }, (_, i) => `t${i}`)]);
  assert.equal(tags[0], 'HorrorGame');
  assert.equal(tags[1], 'عربي');
  assert.equal(tags[2].length, 25);
  assert.equal(tags.length, 10);
});

test('stream meta is read for the selected platforms only', () => {
  const data = { twitch: { category: 'Minecraft', tags: ['Survival'] }, kick: { category: 'Minecraft', tags: ['x'] } };
  const meta = normalizeStreamMeta(data, ['twitch_live', 'youtube_live']);
  assert.deepEqual(Object.keys(meta), ['twitch']);
  assert.deepEqual(meta.twitch.tags, ['Survival']);
  assert.equal(normalizeStreamMeta(data, ['youtube_live']), null);
});

test('each studio keeps its own platforms', () => {
  const plan = normalizePlan({ contentType: 'live', platformsByType: { live: ['kick_live', 'youtube_video'], short: [] } });
  assert.deepEqual(plan.platformsByType.live, ['kick_live']);
  assert.deepEqual(plan.platformsByType.short, ['youtube_short']);
  assert.deepEqual(plan.platformsByType.video, ['youtube_video']);
});
