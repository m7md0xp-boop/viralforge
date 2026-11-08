// Library of past generations, stored in IndexedDB (per profile, on this device only).
// IndexedDB holds far more than localStorage and does not block the page while saving.
// When IndexedDB is unavailable (private mode, old WebView) the library lives in memory for the session.

const DB_NAME = 'viralforge';
const DB_VERSION = 1;
const STORE = 'generations';
const MAX_ENTRIES = 1000; // oldest non-favourite entries are dropped past this

let dbPromise = null;

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is not available'));
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' }).createIndex('at', 'at');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

// Runs one request in a transaction and resolves with its result
async function run(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// In-memory fallback with the same API
const memory = new Map();
const fallback = {
  list: async () => [...memory.values()],
  put: async (entry) => void memory.set(entry.id, entry),
  remove: async (id) => void memory.delete(id),
  clear: async () => memory.clear()
};

const idb = {
  list: () => run('readonly', (store) => store.getAll()),
  put: (entry) => run('readwrite', (store) => store.put(entry)),
  remove: (id) => run('readwrite', (store) => store.delete(id)),
  clear: () => run('readwrite', (store) => store.clear())
};

// Uses IndexedDB, and switches to memory for the session if it fails
async function call(method, ...args) {
  try {
    return await idb[method](...args);
  } catch (err) {
    console.warn(`Library: IndexedDB ${method} failed, using memory`, err);
    return fallback[method](...args);
  }
}

export const listEntries = async () => (await call('list')) || [];
export const saveEntry = (entry) => call('put', entry);
export const deleteEntry = (id) => call('remove', id);
export const clearEntries = () => call('clear');

// Keeps the library under MAX_ENTRIES: removes the oldest entries that are not favourites
export async function pruneEntries(entries) {
  if (entries.length <= MAX_ENTRIES) return entries;
  const removable = entries.filter((e) => !e.favorite).sort((a, b) => (a.at < b.at ? -1 : 1));
  const drop = new Set(removable.slice(0, entries.length - MAX_ENTRIES).map((e) => e.id));
  await Promise.all([...drop].map((id) => deleteEntry(id)));
  return entries.filter((e) => !drop.has(e.id));
}
