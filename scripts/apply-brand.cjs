// Copies the app identity from shared/brand.json to every file that holds the name:
// package.json (desktop installer), capacitor.config.json, the Android and iOS app names,
// index.html and the web manifest. Run after editing shared/brand.json: npm run brand
//
// The app id (com.viralforge.app) is only checked, not rewritten: changing it on Android also means
// moving the Java package folder, and on stores it makes a different app.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const brand = require('../shared/brand.json');
const file = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(file(p), 'utf8'));
const writeJson = (p, data) => fs.writeFileSync(file(p), `${JSON.stringify(data, null, 2)}\n`);
const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const changed = [];

function update(p, fn) {
  if (!fs.existsSync(file(p))) return;
  const before = fs.readFileSync(file(p), 'utf8');
  const after = fn(before);
  if (after !== before) {
    fs.writeFileSync(file(p), after);
    changed.push(p);
  }
}

// package.json: product name of the installer, shortcut and release target
{
  const pkg = readJson('package.json');
  const before = JSON.stringify(pkg);
  pkg.build.productName = brand.name;
  pkg.build.nsis = { ...pkg.build.nsis, shortcutName: brand.name };
  pkg.build.copyright = `© ${new Date().getFullYear()} ${brand.publisher}`;
  pkg.build.publish = [{ provider: 'github', owner: brand.repository.owner, repo: brand.repository.repo, releaseType: 'release' }];
  pkg.homepage = `https://github.com/${brand.repository.owner}/${brand.repository.repo}`;
  pkg.repository = { type: 'git', url: `${pkg.homepage}.git` };
  if (pkg.build.appId !== brand.appId) console.warn(`! package.json build.appId is ${pkg.build.appId}, brand.json says ${brand.appId}`);
  if (JSON.stringify(pkg) !== before) {
    writeJson('package.json', pkg);
    changed.push('package.json');
  }
}

// Capacitor
{
  const cap = readJson('capacitor.config.json');
  if (cap.appName !== brand.name) {
    cap.appName = brand.name;
    writeJson('capacitor.config.json', cap);
    changed.push('capacitor.config.json');
  }
  if (cap.appId !== brand.appId) console.warn(`! capacitor.config.json appId is ${cap.appId}, brand.json says ${brand.appId}`);
}

// Android: English (default) and Arabic app names
const setAndroidName = (xml, name) =>
  xml
    .replace(/(<string name="app_name">)[^<]*(<\/string>)/, `$1${xmlEscape(name)}$2`)
    .replace(/(<string name="title_activity_main">)[^<]*(<\/string>)/, `$1${xmlEscape(name)}$2`);
update('android/app/src/main/res/values/strings.xml', (xml) => setAndroidName(xml, brand.name));
update('android/app/src/main/res/values-ar/strings.xml', (xml) => setAndroidName(xml, brand.nameAr));

// iOS: name under the icon
update('ios/App/App/Info.plist', (plist) =>
  plist.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/, `$1${xmlEscape(brand.name)}$2`)
);

// Web page title and manifest
update('index.html', (html) => html.replace(/<title>[^<]*<\/title>/, `<title>${brand.name} · ${brand.nameAr}</title>`));
update('public/manifest.webmanifest', (text) => {
  const manifest = JSON.parse(text);
  manifest.name = `${brand.name} · ${brand.tagline.en}`;
  manifest.short_name = brand.name;
  return `${JSON.stringify(manifest, null, 2)}\n`;
});

console.log(changed.length ? `Updated: ${changed.join(', ')}` : 'Everything already matches shared/brand.json');
