import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES, flattenKeys, interpolate, translate } from '../src/i18n/translate.js';

const arKeys = flattenKeys(LOCALES.ar).sort();
const enKeys = flattenKeys(LOCALES.en).sort();

test('Arabic and English have exactly the same keys', () => {
  assert.deepEqual(
    arKeys.filter((k) => !enKeys.includes(k)),
    [],
    'keys missing in en.js'
  );
  assert.deepEqual(
    enKeys.filter((k) => !arKeys.includes(k)),
    [],
    'keys missing in ar.js'
  );
});

test('no empty texts', () => {
  for (const lang of ['ar', 'en']) {
    for (const key of flattenKeys(LOCALES[lang])) assert.ok(translate(lang, key).trim(), `${lang}: ${key} is empty`);
  }
});

test('variables are filled, unknown placeholders are kept', () => {
  assert.equal(translate('en', 'settings.keyRequired', { provider: 'Groq' }), 'Add your Groq API key in Settings first.');
  assert.equal(interpolate('Fill {channel_link}', { name: 'x' }), 'Fill {channel_link}');
  assert.equal(translate('ar', 'missing.key'), 'missing.key');
});

// Every t('...') key written in the source code must exist. Dynamic keys (t(`studios.${type}.tab`))
// are checked by their fixed beginning, which must be a group of the locale.
const sourceFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(jsx?|js)$/.test(name) ? [path] : [];
  });

test('every translation key used in src exists', () => {
  const missing = [];
  for (const file of sourceFiles('src')) {
    if (file.includes('locales')) continue;
    const code = readFileSync(file, 'utf8');
    for (const [, key] of code.matchAll(/\bt\(\s*'([\w.-]+)'/g)) {
      if (!arKeys.includes(key)) missing.push(`${file}: ${key}`);
    }
    for (const [, prefix] of code.matchAll(/\bt\(\s*`([\w.]+)\.\$\{/g)) {
      if (!arKeys.some((k) => k.startsWith(`${prefix}.`))) missing.push(`${file}: ${prefix}.*`);
    }
  }
  assert.deepEqual(missing, []);
});

test('no hard-coded Arabic text in components (it belongs in the locales)', () => {
  const offenders = sourceFiles('src/components').filter((file) => /[؀-ۿ]/.test(readFileSync(file, 'utf8')));
  assert.deepEqual(offenders, []);
});
