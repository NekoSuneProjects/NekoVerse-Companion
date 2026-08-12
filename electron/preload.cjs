const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nekoVerse', {
  bootstrap: () => ipcRenderer.invoke('app:bootstrap'),
  refreshStatus: () => ipcRenderer.invoke('sc:status'),
  refreshNews: () => ipcRenderer.invoke('sc:news'),
  searchFleet: (query) => ipcRenderer.invoke('fleet:search', query),
  searchMarket: (payload) => ipcRenderer.invoke('market:search', payload),
  analyzeHardware: () => ipcRenderer.invoke('optimizer:analyze'),
  applyOptimization: (profile) => ipcRenderer.invoke('optimizer:apply', profile),
  restoreOptimization: () => ipcRenderer.invoke('optimizer:restore'),
  speak: (text) => ipcRenderer.invoke('voice:speak', text),
  voiceStart: () => ipcRenderer.invoke('voice:start'),
  voiceStop: () => ipcRenderer.invoke('voice:stop'),
  hotkeyRun: (command) => ipcRenderer.invoke('hotkey:run', command),
  assistantAsk: (message) => ipcRenderer.invoke('assistant:ask', message),
  listOllamaModels: (baseUrl) => ipcRenderer.invoke('ollama:models', baseUrl),
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  openExternal: (url) => ipcRenderer.invoke('shell:open', url),
  onVoice: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('voice:recognized', listener);
    return () => ipcRenderer.removeListener('voice:recognized', listener);
  },
  onUpdateAvailable: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('update:available', listener);
    return () => ipcRenderer.removeListener('update:available', listener);
  }
});
