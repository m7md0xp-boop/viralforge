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

// ----- Encrypted API key storage (OS keychain via safeStorage) -----
const secretsFile = () => path.join(app.getPath('userData'), 'secrets.json');

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

function registerSecretHandlers() {
  ipcMain.handle('secrets:getAll', () => readSecrets());
  ipcMain.handle('secrets:set', (_event, name, value) => {
    if (!SECRET_NAMES.includes(name)) throw new Error('Unknown secret name');
    const current = readSecrets();
    current[name] = typeof value === 'string' ? value.trim() : '';
    writeSecrets(current);
    return true;
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
  registerSecretHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
