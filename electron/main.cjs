const { app, BrowserWindow, Menu, protocol, net, session, shell, ipcMain, safeStorage, clipboard } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const crypto = require('crypto');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const catalog = require('../shared/aiProviders.json');
const brand = require('../shared/brand.json');
// Text and image providers together. Keys are unique by name (Gemini text and image share one key).
const ALL_PROVIDERS = [...catalog.providers, ...catalog.imageProviders];
const SECRET_NAMES = [...new Set(ALL_PROVIDERS.map((p) => p.keyName))];
// Longer than the renderer's 90 s budget, so the renderer always decides when a request has timed out
const AI_TIMEOUT_MS = 100000;
// Largest request body accepted (a reference photo is sent as base64 inside the JSON)
const MAX_BODY_CHARS = 12000000;
const DEFAULT_PROFILE_ID = 'default';
const APP_ORIGIN = 'app://app';

// Content Security Policy for every page the app serves. The renderer never calls external APIs itself
// (the main process does, see ai:request), so it may only talk to its own origin.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'"
].join('; ');

// Only one copy of the app may run: two copies would write profiles.json and the key files at the same time
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// Writes a file in one step: data goes to a temp file first, then replaces the old file.
// A crash or a full disk while writing never leaves a half-written (corrupted) file behind.
function writeFileAtomic(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmp, data, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tmp, file);
  } catch (err) {
    try {
      fs.rmSync(tmp, { force: true });
    } catch {
      // Nothing to clean up
    }
    throw new Error(`Could not save ${path.basename(file)}: ${err.message}`);
  }
}

// Reads a JSON file. A file that exists but cannot be parsed is kept aside (".corrupt-<time>")
// instead of being silently overwritten, so its data can still be recovered by hand.
function readJsonFile(file, fallback) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return fallback; // missing file
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    try {
      fs.renameSync(file, `${file}.corrupt-${Date.now()}`);
    } catch {
      // Could not move it: it will be overwritten by the next save
    }
    console.warn(`Corrupted ${path.basename(file)} was moved aside`, err);
    return fallback;
  }
}

// External links open in the default browser, and only web links (never file:, custom protocols, etc.)
function openExternalSafe(url) {
  try {
    const { protocol } = new URL(url);
    if (protocol === 'https:' || protocol === 'http:') shell.openExternal(url);
  } catch {
    // Not a valid URL: ignored
  }
}

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
  if (filePath !== DIST_DIR && !filePath.startsWith(DIST_DIR + path.sep)) return new Response('Forbidden', { status: 403 });
  return net.fetch(pathToFileURL(filePath).toString()).then((res) => {
    const headers = new Headers(res.headers);
    headers.set('Content-Security-Policy', CSP);
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  });
}
// Permissions a page may get: clipboard writes (copy buttons) and the microphone (voice input). Everything else is refused.
const ALLOWED_PERMISSIONS = new Set(['clipboard-sanitized-write', 'media']);
function registerAppProtocol(sess) {
  if (registeredSessions.has(sess)) return;
  sess.protocol.handle('app', serveAppFile);
  sess.setPermissionRequestHandler((wc, permission, callback, details) => {
    const fromApp = (details && details.requestingUrl ? details.requestingUrl : wc.getURL()).startsWith(APP_ORIGIN);
    callback(fromApp && ALLOWED_PERMISSIONS.has(permission));
  });
  sess.setPermissionCheckHandler((_wc, permission, requestingOrigin) =>
    String(requestingOrigin || '').startsWith(APP_ORIGIN) && ALLOWED_PERMISSIONS.has(permission)
  );
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
  const list = readJsonFile(profilesFile(), []);
  return Array.isArray(list) ? list.filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string') : [];
}
function writeProfiles(list) {
  writeFileAtomic(profilesFile(), JSON.stringify(list, null, 2));
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
// Provider table built from shared/aiProviders.json (the same file the renderer uses).
// The renderer sends the provider id, a path and the body. This process adds the saved key.
const PROVIDERS = Object.fromEntries(
  ALL_PROVIDERS.map((p) => [
    p.id,
    {
      base: p.base,
      keyName: p.keyName,
      accountKey: p.path && p.path.includes('{accountId}'), // Cloudflare: key is ACCOUNT_ID:TOKEN
      auth: (key) => ({
        ...(p.auth && p.auth.header ? { [p.auth.header]: `${p.auth.prefix || ''}${key}` } : {}),
        ...(p.headers || {})
      })
    }
  ])
);

// Splits an ACCOUNT_ID:TOKEN key. Returns the token and the account id, or throws.
function splitAccountKey(key) {
  const idx = key.indexOf(':');
  if (idx < 1 || idx === key.length - 1) throw new Error('Key must look like ACCOUNT_ID:API_TOKEN');
  return { accountId: key.slice(0, idx), token: key.slice(idx + 1) };
}

// Each key is decrypted on its own, so one damaged entry does not hide the others.
// The async safeStorage methods use the same OS key store as the old sync ones, so keys saved by older versions still decrypt.
async function readSecrets(profileId) {
  const raw = readJsonFile(secretsFile(profileId), {});
  const out = {};
  if (!raw || typeof raw !== 'object' || !(await safeStorage.isAsyncEncryptionAvailable())) return out;
  for (const name of SECRET_NAMES) {
    if (typeof raw[name] !== 'string' || !raw[name]) continue;
    try {
      out[name] = (await safeStorage.decryptStringAsync(Buffer.from(raw[name], 'base64'))).result;
    } catch (err) {
      console.warn(`Saved key "${name}" could not be decrypted and was skipped`, err);
    }
  }
  return out;
}

// Keys are never written in plain text: without OS encryption the save is refused and the UI shows the error
async function writeSecrets(profileId, all) {
  if (!(await safeStorage.isAsyncEncryptionAvailable())) {
    throw new Error('Secure storage is not available on this system, so the key was not saved.');
  }
  const encrypted = {};
  for (const [name, value] of Object.entries(all)) {
    if (value) encrypted[name] = (await safeStorage.encryptStringAsync(value)).toString('base64');
  }
  writeFileAtomic(secretsFile(profileId), JSON.stringify(encrypted, null, 2));
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
  ipcMain.handle('secrets:status', async (event) => {
    const current = await readSecrets(profileOf(event));
    const status = {};
    for (const name of SECRET_NAMES) status[name] = Boolean(current[name]);
    return status;
  });

  // Returns the plaintext key to the Settings screen only. Called when the user opens Settings.
  ipcMain.handle('secrets:reveal', async (event, name) => {
    if (!SECRET_NAMES.includes(name)) throw new Error('Unknown secret name');
    return (await readSecrets(profileOf(event)))[name] || '';
  });

  ipcMain.handle('secrets:set', async (event, name, value) => {
    if (!SECRET_NAMES.includes(name)) throw new Error('Unknown secret name');
    const profileId = profileOf(event);
    const current = await readSecrets(profileId);
    const clean = typeof value === 'string' ? value.trim() : '';
    if (clean) current[name] = clean;
    else delete current[name];
    await writeSecrets(profileId, current);
    return true;
  });

  // ----- AI requests (the key is added here, never in the renderer) -----
  ipcMain.handle('ai:request', async (event, args) => {
    const profileId = profileOf(event);
    const provider = PROVIDERS[args && args.provider];
    if (!provider) throw new Error('Unknown provider');
    const path_ = args.path;
    if (typeof path_ !== 'string' || !path_.startsWith('/') || path_.includes('..')) throw new Error('Invalid path');
    if (typeof args.body !== 'string' || args.body.length > MAX_BODY_CHARS) throw new Error('Invalid body');
    const binary = args.responseType === 'base64';
    const requestId = typeof args.requestId === 'string' && args.requestId.length <= 64 ? args.requestId : null;

    const savedKey = (await readSecrets(profileId))[provider.keyName];
    if (!savedKey) {
      return { status: 401, body: JSON.stringify({ error: { message: 'API key is not saved' } }) };
    }

    let key = savedKey;
    let resolvedPath = path_;
    if (provider.accountKey) {
      const { accountId, token } = splitAccountKey(savedKey);
      key = token;
      resolvedPath = path_.replace('{accountId}', encodeURIComponent(accountId));
    }

    const url = new URL(resolvedPath, provider.base).toString();
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
      if (binary) {
        const bytes = Buffer.from(await res.arrayBuffer());
        return { status: res.status, body: bytes.toString('base64'), contentType: res.headers.get('content-type') || '' };
      }
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
  ipcMain.handle('clipboard:readText', async (event) => {
    profileOf(event);
    return (await clipboard.readText()).slice(0, 2000);
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
    openExternalSafe(url);
    return { action: 'deny' };
  });
  // The window never leaves the app: a link that would navigate it opens in the browser instead
  const stayInApp = (event, url) => {
    if (url.startsWith(`${APP_ORIGIN}/`)) return;
    event.preventDefault();
    openExternalSafe(url);
  };
  win.webContents.on('will-navigate', stayInApp);
  win.webContents.on('will-redirect', stayInApp);
  // No <webview> tags
  win.webContents.on('will-attach-webview', (event) => event.preventDefault());
}

function baseWebPreferences() {
  return {
    preload: path.join(__dirname, 'preload.cjs'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    webviewTag: false
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
    title: brand.name,
    backgroundColor: '#07090e',
    autoHideMenuBar: true,
    webPreferences: { ...baseWebPreferences(), partition: partitionFor(profileId) }
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
    title: brand.name,
    backgroundColor: '#07090e',
    autoHideMenuBar: true,
    webPreferences: baseWebPreferences()
  });
  openExternalOnly(win);
  win.loadURL('app://app/index.html?picker=1');
  return win;
}

// ----- automatic updates -----
// The installed app (NSIS build) checks the GitHub Releases of the project at start-up and every 6 hours,
// downloads a newer version in the background and installs it when the app quits (the OS shows a notice).
// Skipped in development, in the portable build (it cannot update itself) and with VF_DISABLE_UPDATES=1.
const UPDATE_INTERVAL_MS = 6 * 60 * 60 * 1000;
function startAutoUpdates() {
  if (!app.isPackaged || process.env.PORTABLE_EXECUTABLE_FILE || process.env.VF_DISABLE_UPDATES === '1') return;
  let autoUpdater;
  try {
    ({ autoUpdater } = require('electron-updater'));
  } catch (err) {
    console.warn('electron-updater is not available', err);
    return;
  }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('error', (err) => console.warn('Update check failed', err?.message || err));
  const check = () => autoUpdater.checkForUpdatesAndNotify().catch((err) => console.warn('Update check failed', err?.message || err));
  check();
  setInterval(check, UPDATE_INTERVAL_MS).unref();
}

app.whenReady().then(() => {
  if (!gotSingleInstanceLock) return;
  // Windows uses this id to group the app's windows and to show its notifications
  app.setAppUserModelId(brand.appId);
  Menu.setApplicationMenu(null);
  registerIpcHandlers();
  ensureProfiles();
  createPickerWindow();
  startAutoUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createPickerWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
