import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildJsonRequest, readJsonResponse, parseJsonLoose, normalizeAiResponse } from '../src/services/providerRequests.js';
import { buildImageRequest, parseImageResponse, parseDataUrl, sniffMime, splitCloudflareKey } from '../src/services/imageRequests.js';

const catalog = JSON.parse(readFileSync(new URL('../shared/aiProviders.json', import.meta.url), 'utf8'));
const textProvider = (id) => catalog.providers.find((p) => p.id === id);
const imageProvider = (id) => catalog.imageProviders.find((p) => p.id === id);

test('every catalog provider has the fields the app and the desktop app rely on', () => {
  for (const p of [...catalog.providers, ...catalog.imageProviders]) {
    for (const field of ['id', 'label', 'format', 'keyName', 'host', 'base', 'model', 'usage', 'usageNote']) {
      assert.ok(p[field], `${p.id}: ${field}`);
    }
    assert.ok(p.base.startsWith('https://'), `${p.id}: base must be https`);
    assert.ok(catalog.usageTypes[p.usage], `${p.id}: unknown usage ${p.usage}`);
    assert.ok(p.label.ar && p.label.en && p.usageNote.ar && p.usageNote.en, `${p.id}: needs ar and en texts`);
  }
  const ids = [...catalog.providers, ...catalog.imageProviders].map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'provider ids are unique');
});

test('OpenAI-style request: bearer key, JSON mode, model', () => {
  const groq = textProvider('groq');
  const { url, headers, body } = buildJsonRequest(groq, { key: 'k', model: groq.model, prompt: 'hi' });
  assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(headers.Authorization, 'Bearer k');
  assert.deepEqual(body.response_format, { type: 'json_object' });
  assert.equal(body.messages[0].content, 'hi');
});

test('Anthropic request: x-api-key and version header, max_tokens', () => {
  const claude = textProvider('claude');
  const { headers, body } = buildJsonRequest(claude, { key: 'k', model: claude.model, prompt: 'hi' });
  assert.equal(headers['x-api-key'], 'k');
  assert.equal(headers['anthropic-version'], '2023-06-01');
  assert.ok(body.max_tokens > 0);
});

test('reads the reply text of each format', () => {
  assert.equal(readJsonResponse({ format: 'openai' }, { choices: [{ message: { content: '{"a":1}' } }] }), '{"a":1}');
  assert.equal(readJsonResponse({ format: 'anthropic' }, { content: [{ type: 'text', text: 'x' }, { type: 'tool_use' }] }), 'x');
  assert.equal(readJsonResponse({ format: 'cohere' }, { message: { content: [{ type: 'text', text: 'y' }] } }), 'y');
  assert.equal(readJsonResponse({ format: 'openai' }, {}), '');
});

test('unsupported format is rejected', () => {
  assert.throws(() => buildJsonRequest({ format: 'nope', base: '', path: '' }, { key: '', model: '', prompt: '' }));
});

test('JSON is found inside code fences and prose', () => {
  assert.deepEqual(parseJsonLoose('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(parseJsonLoose('Sure! Here it is: {"b":2} Enjoy.'), { b: 2 });
  assert.throws(() => parseJsonLoose('no json here'));
});

test('AI replies are normalised to the shapes the UI expects', () => {
  const out = normalizeAiResponse({
    titles: ['Plain title', { name: 'Named', score: '91' }],
    hashtags: 'gaming #minecraft',
    youtube_description: ['a', 'b'],
    shortTitles: [{ title: 'Short' }, 'Two'],
    templates: [{ text: 'Live' }]
  });
  assert.deepEqual(out.videoTitles[0], { title: 'Plain title', score: 85, seo: 80, ctr: 75 });
  assert.equal(out.videoTitles[1].score, 91);
  assert.deepEqual(out.hashtags, ['#gaming', '#minecraft']);
  assert.equal(out.description, 'a\n\nb');
  assert.deepEqual(out.shortTitles, ['Short', 'Two']);
  assert.deepEqual(out.templates, ['Live']);
  assert.deepEqual(normalizeAiResponse(null), {});
});

test('image requests: reference photo only for providers that support it', () => {
  const reference = { mime: 'image/png', base64: 'AAAA' };
  const gemini = buildImageRequest(imageProvider('gemini-image'), { prompt: 'p', reference });
  assert.equal(gemini.body.contents[0].parts[1].inlineData.mimeType, 'image/png');
  const cloudflare = buildImageRequest(imageProvider('cloudflare-image'), { prompt: 'p', reference });
  assert.ok(!JSON.stringify(cloudflare.body).includes('AAAA'));
  assert.match(cloudflare.body.prompt, /16:9/);
});

test('image responses: image found, provider errors explained', () => {
  const png = 'iVBORw0KGgoAAAA';
  assert.deepEqual(parseImageResponse(imageProvider('openai-image'), { ok: true, status: 200, json: { data: [{ b64_json: png }] } }), {
    mime: 'image/png',
    base64: png
  });
  assert.throws(
    () => parseImageResponse(imageProvider('gemini-image'), { ok: true, status: 200, json: { candidates: [{ content: { parts: [{ text: 'Blocked' }] } }] } }),
    /Blocked/
  );
  // Error bodies of binary requests arrive as base64 bytes and are decoded for the message
  const body = Buffer.from(JSON.stringify({ error: { message: 'Bad token' } })).toString('base64');
  assert.throws(() => parseImageResponse(imageProvider('cloudflare-image'), { ok: false, status: 401, json: null, base64: body }), /Bad token/);
});

test('data URLs, image types and Cloudflare keys', () => {
  assert.deepEqual(parseDataUrl('data:image/jpeg;base64,/9j/abc'), { mime: 'image/jpeg', base64: '/9j/abc' });
  assert.equal(parseDataUrl('not a data url'), null);
  assert.equal(sniffMime('/9j/xyz'), 'image/jpeg');
  assert.equal(sniffMime('UklGRxyz'), 'image/webp');
  assert.deepEqual(splitCloudflareKey('acc:tok'), { accountId: 'acc', token: 'tok' });
  assert.throws(() => splitCloudflareKey('missing-colon'));
});
