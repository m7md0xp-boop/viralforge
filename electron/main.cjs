const { app, BrowserWindow, Menu, protocol, net, shell, ipcMain, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SECRET_NAMES = ['gemini_api_key', 'openai_api_key', 'groq_api_key', 'openrouter_api_key'];

// Serve the built app from app:// so module scripts load and fetch() to external APIs works
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

function registerAppProtocol() {
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    let relative = decodeURIComponent(pathname);
    if (relative === '/' || relative === '') relative = '/index.html';
    const filePath = path.normalize(path.join(DIST_DIR, relative));
    if (!filePath.startsWith(DIST_DIR)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

// ----- Encrypted API keys (OS keychain via safeStorage) -----
// Keys never leave this process: the renderer can only ask whether a key exists, or ask for a request
// to be sent to one of the known providers.
const secretsFile = () => path.join(app.getPath('userData'), 'secrets.json');

// Keep in sync with src/services/aiTransport.js and the providers used by src/services/ai.js
const PROVIDERS = {
  gemini: { base: 'https://generativelanguage.googleapis.com', keyName: 'gemini_api_key', auth: (k) => ({ 'x-goog-api-key': k }) },
  groq: { base: 'https://api.groq.com', keyName: 'groq_api_key', auth: (k) => ({ Authorization: `Bearer ${k}` }) },
  openai: { base: 'https://api.openai.com', keyName: 'openai_api_key', auth: (k) => ({ Authorization: `Bearer ${k}` }) },
  openrouter: { base: 'https://openrouter.ai', keyName: 'openrouter_api_key', auth: (k) => ({ Authorization: `Bearer ${k}` }) }
};

function readSecrets() {
  try {
    const raw = JSON.parse(fs.readFileSync(secretsFile(), 'utf8'));
    const out = {};
    for (const name of SECRET_NAMES) {
      if (raw[name] && safeStorage.isEncryptionAvailable()) {
        out[name] = safeStorage.decryptString(Buffer.from(raw[name], 'base64'));
      }
    }
    return out;
  } catch {
    return {};
  }
}

function writeSecrets(all) {
  const encrypted = {};
  for (const [name, value] of Object.entries(all)) {
    if (value && safeStorage.isEncryptionAvailable()) {
      encrypted[name] = safeStorage.encryptString(value).toString('base64');
    }
  }
  fs.mkdirSync(path.dirname(secretsFile()), { recursive: true });
  fs.writeFileSync(secretsFile(), JSON.stringify(encrypted, null, 2));
}

function registerIpcHandlers() {
  ipcMain.handle('secrets:status', () => {
    const current = readSecrets();
    const status = {};
    for (const name of SECRET_NAMES) status[name] = Boolean(current[name]);
    return status;
  });

  ipcMain.handle('secrets:set', (_event, name, value) => {
    if (!SECRET_NAMES.includes(name)) throw new Error('Unknown secret name');
    const current = readSecrets();
    const clean = typeof value === 'string' ? value.trim() : '';
    if (clean) current[name] = clean;
    else delete current[name];
    writeSecrets(current);
    return true;
  });

  ipcMain.handle('ai:request', async (_event, args) => {
    const provider = PROVIDERS[args && args.provider];
    if (!provider) throw new Error('Unknown provider');
    const path_ = args.path;
    if (typeof path_ !== 'string' || !path_.startsWith('/') || path_.includes('..')) throw new Error('Invalid path');
    if (typeof args.body !== 'string' || args.body.length > 2000000) throw new Error('Invalid body');

    const key = readSecrets()[provider.keyName];
    if (!key) {
      return { status: 401, body: JSON.stringify({ error: { message: 'API key is not saved' } }) };
    }

    const url = new URL(path_, provider.base).toString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await net.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...provider.auth(key) },
        body: args.body,
        signal: controller.signal
      });
      return { status: res.status, body: await res.text() };
    } catch (err) {
      return { status: 503, body: JSON.stringify({ error: { message: String(err && err.message || err) } }) };
    } finally {
      clearTimeout(timer);
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    title: 'ViralForge',
    backgroundColor: '#0b0d12',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // External links open in the default browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadURL('app://app/index.html');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerAppProtocol();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
