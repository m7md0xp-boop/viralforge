const { app, BrowserWindow, Menu, protocol, net, session, shell, ipcMain, safeStorage, clipboard } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const crypto = require('crypto');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SECRET_NAMES = ['gemini_api_key', 'claude_api_key', 'deepseek_api_key', 'openai_api_key'];
// Longer than the renderer's 90 s budget, so the renderer always decides when a request has timed out
const AI_TIMEOUT_MS = 100000;
const DEFAULT_PROFILE_ID = 'default';

// Serve the built app from app:// so module scripts load and fetch() to external APIs works
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

// Each session (the picker's default session and every profile partition) needs its own app:// handler
const registeredSessions = new WeakSet();
function serveAppFile(request) {
  const { pathname } = new URL(request.url);
  let relative = decodeURIComponent(pathname);
  if (relative === '/' || relative === '') relative = '/index.html';
  const filePath = path.normalize(path.join(DIST_DIR, relative));
  if (!filePath.startsWith(DIST_DIR)) return new Response('Forbidden', { status: 403 });
  return net.fetch(pathToFileURL(filePath).toString());
}
function registerAppProtocol(sess) {
  if (registeredSessions.has(sess)) return;
  sess.protocol.handle('app', serveAppFile);
  registeredSessions.add(sess);
}

// ----- Profiles (one isolated workspace per user) -----
// A profile = its own storage partition (localStorage, cookies, cache) + its own encrypted secrets file.
// The renderer never picks its profile: the main process maps each window to its profile.
const profilesFile = () => path.join(app.getPath('userData'), 'profiles.json');
const secretsFile = (profileId) =>
  path.join(app.getPath('userData'), profileId === DEFAULT_PROFILE_ID ? 'secrets.json' : `secrets-${profileId}.json`);
const partitionFor = (profileId) => `persist:profile-${profileId}`;

function readProfiles() {
  try {
    const list = JSON.parse(fs.readFileSync(profilesFile(), 'utf8'));
    return Array.isArray(list) ? list.filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string') : [];
  } catch {
    return [];
  }
}
function writeProfiles(list) {
  fs.mkdirSync(path.dirname(profilesFile()), { recursive: true });
  fs.writeFileSync(profilesFile(), JSON.stringify(list, null, 2));
}
function ensureProfiles() {
  const list = readProfiles();
  if (list.length === 0) {
    // Existing single-user installs keep their saved keys under the default profile
    list.push({ id: DEFAULT_PROFILE_ID, name: 'Default' });
    writeProfiles(list);
  }
  return list;
}

const windowProfile = new Map(); // webContents id -> profile id (only profile windows)
function profileOf(event) {
  const id = windowProfile.get(event.sender.id);
  if (!id) throw new Error('This window is not a profile');
  return id;
}
function findProfileWindow(profileId) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (windowProfile.get(win.webContents.id) === profileId) return win;
  }
  return null;
}

// ----- Encrypted API keys (OS keychain via safeStorage) -----
// Keys never leave this process except when the user opens Settings (secrets:reveal).
// Keep the provider ids in sync with src/config/aiProviders.js and src/services/aiTransport.js
const PROVIDERS = {
  gemini: { base: 'https://generativelanguage.googleapis.com', keyName: 'gemini_api_key', auth: (k) => ({ 'x-goog-api-key': k }) },
  claude: {
    base: 'https://api.anthropic.com',
    keyName: 'claude_api_key',
    auth: (k) => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' })
  },
  deepseek: { base: 'https://api.deepseek.com', keyName: 'deepseek_api_key', auth: (k) => ({ Authorization: `Bearer ${k}` }) },
  chatgpt: { base: 'https://api.openai.com', keyName: 'openai_api_key', auth: (k) => ({ Authorization: `Bearer ${k}` }) }
};

function readSecrets(profileId) {
  try {
    const raw = JSON.parse(fs.readFileSync(secretsFile(profileId), 'utf8'));
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

function writeSecrets(profileId, all) {
  const encrypted = {};
  for (const [name, value] of Object.entries(all)) {
    if (value && safeStorage.isEncryptionAvailable()) {
      encrypted[name] = safeStorage.encryptString(value).toString('base64');
    }
  }
  fs.mkdirSync(path.dirname(secretsFile(profileId)), { recursive: true });
  fs.writeFileSync(secretsFile(profileId), JSON.stringify(encrypted, null, 2));
}

// In-flight AI requests, so the renderer can cancel one it has given up on
const inflight = new Map();

function registerIpcHandlers() {
  // ----- profiles -----
  ipcMain.handle('profiles:list', () => ensureProfiles());

  ipcMain.handle('profiles:current', (event) => {
    const id = windowProfile.get(event.sender.id);
    if (!id) return null;
    return ensureProfiles().find((p) => p.id === id) || null;
  });

  ipcMain.handle('profiles:create', (_event, name) => {
    const clean = (typeof name === 'string' ? name : '').trim().slice(0, 40);
    if (!clean) throw new Error('Profile name is required');
    const list = ensureProfiles();
    const profile = { id: `p-${crypto.randomBytes(6).toString('hex')}`, name: clean };
    list.push(profile);
    writeProfiles(list);
    return profile;
  });

  ipcMain.handle('profiles:open', (event, id) => {
    const profile = ensureProfiles().find((p) => p.id === id);
    if (!profile) throw new Error('Unknown profile');
    const existing = findProfileWindow(id);
    if (existing) {
      existing.focus();
    } else {
      createProfileWindow(profile.id);
    }
    // The picker closes itself once a profile is open
    const picker = BrowserWindow.fromWebContents(event.sender);
    if (picker && !windowProfile.has(picker.webContents.id)) picker.close();
    return true;
  });

  ipcMain.handle('profiles:openPicker', () => {
    createPickerWindow();
    return true;
  });

  // ----- secrets (per profile) -----
  ipcMain.handle('secrets:status', (event) => {
    const current = readSecrets(profileOf(event));
    const status = {};
    for (const name of SECRET_NAMES) status[name] = Boolean(current[name]);
    return status;
  });

  // Returns the plaintext key to the Settings screen only. Called when the user opens Settings.
  ipcMain.handle('secrets:reveal', (event, name) => {
    if (!SECRET_NAMES.includes(name)) throw new Error('Unknown secret name');
    return readSecrets(profileOf(event))[name] || '';
  });

  ipcMain.handle('secrets:set', (event, name, value) => {
    if (!SECRET_NAMES.includes(name)) throw new Error('Unknown secret name');
    const profileId = profileOf(event);
    const current = readSecrets(profileId);
    const clean = typeof value === 'string' ? value.trim() : '';
    if (clean) current[name] = clean;
    else delete current[name];
    writeSecrets(profileId, current);
    return true;
  });

  // ----- AI requests (the key is added here, never in the renderer) -----
  ipcMain.handle('ai:request', async (event, args) => {
    const profileId = profileOf(event);
    const provider = PROVIDERS[args && args.provider];
    if (!provider) throw new Error('Unknown provider');
    const path_ = args.path;
    if (typeof path_ !== 'string' || !path_.startsWith('/') || path_.includes('..')) throw new Error('Invalid path');
    if (typeof args.body !== 'string' || args.body.length > 2000000) throw new Error('Invalid body');
    const requestId = typeof args.requestId === 'string' && args.requestId.length <= 64 ? args.requestId : null;

    const key = readSecrets(profileId)[provider.keyName];
    if (!key) {
      return { status: 401, body: JSON.stringify({ error: { message: 'API key is not saved' } }) };
    }

    const url = new URL(path_, provider.base).toString();
    const controller = new AbortController();
    if (requestId) inflight.set(requestId, controller);
    const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    try {
      const res = await net.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...provider.auth(key) },
        body: args.body,
        signal: controller.signal
      });
      return { status: res.status, body: await res.text() };
    } catch (err) {
      const message = controller.signal.aborted
        ? 'Request timed out in the desktop app'
        : String((err && err.message) || err);
      return { status: 503, body: JSON.stringify({ error: { message } }) };
    } finally {
      clearTimeout(timer);
      if (requestId) inflight.delete(requestId);
    }
  });

  // Clipboard read for the "paste" buttons. Runs in the main process, so no browser permission prompt is needed.
  ipcMain.handle('clipboard:readText', (event) => {
    profileOf(event);
    return clipboard.readText().slice(0, 2000);
  });

  ipcMain.handle('ai:cancel', (_event, requestId) => {
    const controller = typeof requestId === 'string' ? inflight.get(requestId) : null;
    if (controller) controller.abort();
    return Boolean(controller);
  });
}

// ----- windows -----
function openExternalOnly(win) {
  // External links open in the default browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function baseWebPreferences(sess) {
  return {
    preload: path.join(__dirname, 'preload.cjs'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  };
}

function createProfileWindow(profileId) {
  const sess = session.fromPartition(partitionFor(profileId));
  registerAppProtocol(sess);
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    title: 'ViralForge',
    backgroundColor: '#07090e',
    autoHideMenuBar: true,
    webPreferences: { ...baseWebPreferences(sess), partition: partitionFor(profileId) }
  });
  const wcId = win.webContents.id;
  windowProfile.set(wcId, profileId);
  win.on('closed', () => windowProfile.delete(wcId));
  openExternalOnly(win);
  win.loadURL('app://app/index.html');
  return win;
}

function createPickerWindow() {
  const existing = BrowserWindow.getAllWindows().find((w) => !windowProfile.has(w.webContents.id) && !w.isDestroyed());
  if (existing) {
    existing.focus();
    return existing;
  }
  const sess = session.defaultSession;
  registerAppProtocol(sess);
  const win = new BrowserWindow({
    width: 520,
    height: 640,
    resizable: false,
    title: 'ViralForge',
    backgroundColor: '#07090e',
    autoHideMenuBar: true,
    webPreferences: baseWebPreferences(sess)
  });
  openExternalOnly(win);
  win.loadURL('app://app/index.html?picker=1');
  return win;
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerIpcHandlers();
  ensureProfiles();
  createPickerWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createPickerWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
