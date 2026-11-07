const { contextBridge, ipcRenderer } = require('electron');

// Minimal API for the renderer. Keys are only returned by secrets.reveal (called when Settings opens).
contextBridge.exposeInMainWorld('desktop', {
  secrets: {
    status: () => ipcRenderer.invoke('secrets:status'),
    set: (name, value) => ipcRenderer.invoke('secrets:set', name, value),
    reveal: (name) => ipcRenderer.invoke('secrets:reveal', name)
  },
  ai: {
    request: ({ provider, path, body, requestId, responseType }) =>
      ipcRenderer.invoke('ai:request', { provider, path, body, requestId, responseType }),
    cancel: (requestId) => ipcRenderer.invoke('ai:cancel', requestId)
  },
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard:readText')
  },
  profiles: {
    list: () => ipcRenderer.invoke('profiles:list'),
    current: () => ipcRenderer.invoke('profiles:current'),
    create: (name) => ipcRenderer.invoke('profiles:create', name),
    open: (id) => ipcRenderer.invoke('profiles:open', id),
    openPicker: () => ipcRenderer.invoke('profiles:openPicker')
  }
});
