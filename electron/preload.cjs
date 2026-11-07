const { contextBridge, ipcRenderer } = require('electron');

// Minimal, explicit API for the renderer. Keys never leave the main process unencrypted on disk.
contextBridge.exposeInMainWorld('desktop', {
  secrets: {
    getAll: () => ipcRenderer.invoke('secrets:getAll'),
    set: (name, value) => ipcRenderer.invoke('secrets:set', name, value)
  }
});
