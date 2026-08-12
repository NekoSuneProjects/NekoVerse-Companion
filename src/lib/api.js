const bridge = window.nekoVerse;

export function hasDesktopBridge() { return Boolean(bridge); }
export const api = {
  bootstrap: () => bridge?.bootstrap?.(),
  refreshStatus: () => bridge?.refreshStatus?.(),
  refreshNews: () => bridge?.refreshNews?.(),
  searchFleet: (query) => bridge?.searchFleet?.(query),
  searchMarket: (query, ltiOnly) => bridge?.searchMarket?.({ query, ltiOnly }),
  analyzeHardware: () => bridge?.analyzeHardware?.(),
  applyOptimization: (profile) => bridge?.applyOptimization?.(profile),
  restoreOptimization: () => bridge?.restoreOptimization?.(),
  speak: (text) => bridge?.speak?.(text),
  voiceStart: () => bridge?.voiceStart?.(),
  voiceStop: () => bridge?.voiceStop?.(),
  hotkeyRun: (command) => bridge?.hotkeyRun?.(command),
  assistantAsk: (message) => bridge?.assistantAsk?.(message),
  listOllamaModels: (baseUrl) => bridge?.listOllamaModels?.(baseUrl),
  getSettings: () => bridge?.getSettings?.(),
  saveSettings: (settings) => bridge?.saveSettings?.(settings),
  openExternal: (url) => bridge?.openExternal?.(url),
  onVoice: (fn) => bridge?.onVoice?.(fn)
};
