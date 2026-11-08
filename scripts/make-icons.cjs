// Renders assets/logo.svg into the PNG files the app needs, with Electron (already a dev dependency):
//   build/icon.png           desktop installer and window icon (electron-builder makes the .ico from it)
//   public/icon-192.png ...  web favicon / home-screen icons
//   assets/*.png             sources for "npx @capacitor/assets generate" (Android and iOS icons, splash)
// Run with: npm run icons
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(ROOT, 'assets', 'logo.svg'), 'utf8');
const BG = '#0b0d12';

// Variants of the logo: full icon, the glyph alone (adaptive icon foreground), splash screen
const glyphOnly = svg.replace(/<rect id="background"[^>]*\/>/, '').replace(/<rect width="1024" height="1024" rx="232" fill="url\(#glow\)"\/>/, '');
const page = (inner, size, background = 'transparent') =>
  `<!doctype html><html><body style="margin:0;background:${background};width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;overflow:hidden">${inner}</body></html>`;

const JOBS = [
  { file: 'build/icon.png', size: 1024, html: (s) => page(svg.replace('<svg ', `<svg width="${s}" height="${s}" `), s) },
  { file: 'public/icon-512.png', size: 512, html: (s) => page(svg.replace('<svg ', `<svg width="${s}" height="${s}" `), s) },
  { file: 'public/icon-192.png', size: 192, html: (s) => page(svg.replace('<svg ', `<svg width="${s}" height="${s}" `), s) },
  { file: 'public/favicon.png', size: 64, html: (s) => page(svg.replace('<svg ', `<svg width="${s}" height="${s}" `), s) },
  { file: 'assets/icon-only.png', size: 1024, html: (s) => page(svg.replace('<svg ', `<svg width="${s}" height="${s}" `), s) },
  // Adaptive icon: the glyph sits in the middle 66 % safe zone of the foreground layer
  { file: 'assets/icon-foreground.png', size: 1024, html: (s) => page(glyphOnly.replace('<svg ', `<svg width="${s * 0.7}" height="${s * 0.7}" `), s) },
  { file: 'assets/icon-background.png', size: 1024, html: (s) => page('', s, 'linear-gradient(135deg,#7c3aed,#a21caf 55%,#059669)') },
  { file: 'assets/splash.png', size: 2732, html: (s) => page(svg.replace('<svg ', `<svg width="${s * 0.22}" height="${s * 0.22}" `), s, BG) },
  { file: 'assets/splash-dark.png', size: 2732, html: (s) => page(svg.replace('<svg ', `<svg width="${s * 0.22}" height="${s * 0.22}" `), s, BG) }
];

async function run() {
  for (const job of JOBS) {
    const win = new BrowserWindow({
      width: job.size,
      height: job.size,
      show: false,
      frame: false,
      transparent: true,
      useContentSize: true,
      webPreferences: { offscreen: true }
    });
    // A temporary file is more reliable than a long data: URL
    const tmp = path.join(os.tmpdir(), `vf-icon-${process.pid}-${path.basename(job.file)}.html`);
    fs.writeFileSync(tmp, job.html(job.size));
    await win.loadFile(tmp);
    fs.rmSync(tmp, { force: true });
    await new Promise((r) => setTimeout(r, 300));
    const image = await win.webContents.capturePage({ x: 0, y: 0, width: job.size, height: job.size });
    const out = path.join(ROOT, job.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, image.resize({ width: job.size, height: job.size }).toPNG());
    console.log('saved', job.file);
    win.destroy();
  }
}

app.disableHardwareAcceleration();
// One window per image: keep running between them (Electron quits by default when the last window closes)
app.on('window-all-closed', () => {});
app.whenReady()
  .then(run)
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => app.quit());
