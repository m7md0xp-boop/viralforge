import { test } from 'node:test';
import assert from 'node:assert/strict';
import { composeDescription, fillPlaceholders, limitHashtags, placeholderValues } from '../src/utils/placeholders.js';
import { DEFAULT_TEMPLATE, PRESET_TEMPLATES } from '../src/config/templates.js';

const profile = {
  channelName: 'Test Channel',
  channelUrl: 'https://www.youtube.com/@test',
  linktreeUrl: 'https://linktr.ee/test',
  discordUrl: ''
};
const values = placeholderValues({ game: 'Minecraft', episode: '7', profile });

test('fills every known placeholder with the user values', () => {
  const out = fillPlaceholders('{game} #{episode} by {channel_name} {channel_link} {linktree_link}', values);
  assert.equal(out, 'Minecraft #7 by Test Channel https://www.youtube.com/@test https://linktr.ee/test');
});

test('builds the subscribe link from the channel link', () => {
  assert.equal(values.subscribe_link, 'https://www.youtube.com/@test?sub_confirmation=1');
});

test('drops a line whose link is not set, and keeps unknown {words}', () => {
  const out = fillPlaceholders('Discord: {discord_link}\nKeep {unknown}', values);
  assert.equal(out, 'Keep {unknown}');
});

test('puts the AI text in the {ai_description} slot', () => {
  const out = composeDescription({ template: DEFAULT_TEMPLATE, aiText: 'AI BODY {game}', values, useTemplate: true });
  assert.ok(out.startsWith('AI BODY Minecraft'));
  assert.ok(out.includes('https://www.youtube.com/@test?sub_confirmation=1'));
  assert.ok(!out.includes('Discord'), 'empty Discord line is removed');
  assert.ok(!/\{[a-z_]+\}/.test(out), 'no placeholder left');
});

test('without the template the AI text is used as it is', () => {
  assert.equal(composeDescription({ template: DEFAULT_TEMPLATE, aiText: 'Just {game}', values, useTemplate: false }), 'Just Minecraft');
});

test('presets contain no hashtags, no hard-coded channel and an AI slot', () => {
  for (const preset of PRESET_TEMPLATES) {
    assert.ok(preset.text.includes('{ai_description}'), preset.id);
    assert.ok(!/youtube\.com\/@/i.test(preset.text), preset.id);
    assert.ok(!/(^|\s)#[\p{L}{]/u.test(preset.text), preset.id);
  }
});

test('limits hashtags to unique entries and the max count', () => {
  assert.deepEqual(limitHashtags(['#A', 'a', '#b', 'c d', '#e', '#f', '#g'], 5), ['#A', '#b', '#cd', '#e', '#f']);
  assert.deepEqual(limitHashtags(undefined, 5), []);
});
