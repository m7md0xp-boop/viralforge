import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSectionPrompt, buildThumbnailPrompt } from '../src/config/prompts.js';
import { strictestLimits } from '../src/config/platforms.js';

const base = { game: 'Minecraft', ep: '3', lang: 'ar', wantTitles: true, wantDescription: true, template: '', useCustomTemplate: false };

test('long video prompt asks for 3-5 hashtags', () => {
  const prompt = buildSectionPrompt({ ...base, section: 'video' });
  assert.match(prompt, /"hashtags": 3-5 /);
  assert.doesNotMatch(prompt, /10-15/);
});

test('hashtag range follows the platforms', () => {
  const prompt = buildSectionPrompt({ ...base, section: 'short', hashtagRange: [2, 3] });
  assert.match(prompt, /"hashtags": 2-3 /);
});

test('chat request is the topic of the selected section', () => {
  const prompt = buildSectionPrompt({ ...base, section: 'live', game: '', userText: 'night horror stream' });
  assert.match(prompt, /live-stream copywriter/);
  assert.match(prompt, /night horror stream/);
});

test('template with a slot asks the AI for the body only', () => {
  const prompt = buildSectionPrompt({ ...base, section: 'video', useCustomTemplate: true, templateHasSlot: true });
  assert.match(prompt, /No links, no call to subscribe/);
});

test('thumbnail prompt mentions a reference photo only when there is one', () => {
  assert.match(buildThumbnailPrompt({ game: 'Phasmophobia', hasReference: true }), /reference photo/);
  assert.doesNotMatch(buildThumbnailPrompt({ game: 'Phasmophobia', hasReference: false }), /reference photo/);
});

test('combined platform range never has min above max', () => {
  const { hashtagRecommended: [min, max] } = strictestLimits(['instagram_reel', 'x_post']);
  assert.ok(min <= max);
  assert.equal(max, 3);
});
