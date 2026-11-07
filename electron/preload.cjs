const { contextBridge, ipcRenderer } = require('electron');

// Minimal API for the renderer. API keys are never exposed here.
contextBridge.exposeInMainWorld('desktop', {
  secrets: {
    status: () => ipcRenderer.invoke('secrets:status'),
    set: (name, value) => ipcRenderer.invoke('secrets:set', name, value)
  },
  ai: {
    request: ({ provider, path, body }) => ipcRenderer.invoke('ai:request', { provider, path, body })
  }
});
