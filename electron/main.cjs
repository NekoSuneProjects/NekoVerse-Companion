const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { getStatus, getNews } = require('./services/starcitizen.cjs');
const { searchModels } = require('./services/fleetyards.cjs');
const { searchMarket } = require('./services/marketplace.cjs');
const { buildDefaultCommands } = require('./services/commands.cjs');
const optimizer = require('./services/optimizer.cjs');
const hotkeys = require('./services/hotkeys.cjs');
const voice = require('./services/voice.cjs');
const assistant = require('./services/assistant.cjs');
const ollama = require('./services/ollama.cjs');
const updates = require('./services/updates.cjs');
const wiki = require('./services/wiki.cjs');
const storage = require('./services/storage.cjs');

let win;
let settings = null;
let lastOptimizer = null;
let voiceCommandBusy = false;
let lastVoiceIntent = null;
let lastVoiceFinishedAt = 0;
let assistantRequestBusy = false;
let updateTimer = null;
let lastUpdateCheckAt = 0;
let lastUpdateResult = null;
let lastNotifiedVersion = null;
let wakeActiveUntil = 0;
let voiceCancelEpoch = 0;

const VOICE_DUPLICATE_COOLDOWN_MS = 4000;
const WAKE_WINDOW_MS = 8000;
const UPDATE_POLL_MS = 5 * 60 * 1000;
const UPDATE_CACHE_MS = 60 * 1000;
const LEGACY_WAKE_WORDS = ['neko', 'nekoverse', 'computer'];
const STOP_SPEAKING_RE = /\b(shut\s*up|stop\s+(talking|speaking)|be\s+quiet|silence|quiet\s+please|c[aá]llate|deja\s+de\s+hablar|silencio|sei\s+still|h[oö]r\s+auf\s+zu\s+reden|ruhe|zamknij\s+si[eę]|przesta[nń]\s+m[oó]wi[cć]|cisza|замолчи|перестань\s+говорить|тихо|tais[- ]toi|arr[eê]te\s+de\s+parler|stai\s+zitto|smetti\s+di\s+parlare|cala[- ]te|para\s+de\s+falar)\b/i;

const defaultSettings = {
  language: 'en-GB',
  onboardingComplete: false,
  wakeWords: ['jarvis'],
  requireWakeWord: true,
  speakReplies: true,
  customInstallPath: '',
  commands: buildDefaultCommands(),
  ollama: {
    baseUrl: ollama.DEFAULT_BASE_URL,
    model: ollama.DEFAULT_MODEL
  }
};

function legacySettingsFile() { return path.join(app.getPath('userData'), 'settings.json'); }
function databaseFile() { return path.join(app.getPath('userData'), 'nekoverse.sqlite'); }
function sameWords(a = [], b = []) {
  return a.length === b.length && a.every((word, i) => String(word).toLowerCase() === String(b[i]).toLowerCase());
}

function normalizeSettings(loaded) {
  const next = loaded ? { ...defaultSettings, ...loaded } : structuredClone(defaultSettings);
  if (sameWords(loaded?.wakeWords || [], LEGACY_WAKE_WORDS)) {
    next.wakeWords = ['jarvis'];
    next.requireWakeWord = true;
  }
  if (!Array.isArray(next.wakeWords) || !next.wakeWords.length) next.wakeWords = ['jarvis'];
  if (!next.language) next.language = 'en-GB';
  if (typeof next.onboardingComplete !== 'boolean') next.onboardingComplete = false;
  next.commands = { ...defaultSettings.commands, ...(next.commands || {}) };
  for (const [id, defaults] of Object.entries(defaultSettings.commands)) {
    next.commands[id] = { ...defaults, ...(next.commands[id] || {}) };
  }
  next.ollama = { ...defaultSettings.ollama, ...(next.ollama || {}) };
  return next;
}

async function loadSettings() {
  let loaded = storage.getJson('settings', null);
  if (!loaded) {
    try {
      loaded = JSON.parse(fs.readFileSync(legacySettingsFile(), 'utf8'));
      storage.setMeta('migrated_from_json', new Date().toISOString());
    } catch { loaded = null; }
  }
  settings = normalizeSettings(loaded);
  storage.setJson('settings', settings);
  return settings;
}

function publishVoiceStatus(status) {
  if (win && !win.isDestroyed()) win.webContents.send('voice:status', status);
}

function startVoiceListener() {
  return voice.start(runRecognized, settings.language, publishVoiceStatus);
}

function saveSettings(next) {
  const wasListening = voice.isRunning();
  const previousLanguage = settings?.language;
  settings = normalizeSettings({
    ...settings,
    ...next,
    commands:{...settings.commands,...(next.commands||{})},
    ollama:{...settings.ollama,...(next.ollama||{})}
  });
  storage.setJson('settings', settings);
  if (wasListening && previousLanguage !== settings.language) {
    voice.stop();
    startVoiceListener();
  }
  return settings;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1500, height: 950, minWidth: 1120, minHeight: 720,
    backgroundColor:'#07110d', title:'NekoVerse Companion',
    webPreferences:{ preload:path.join(__dirname,'preload.cjs'), contextIsolation:true, nodeIntegration:false, sandbox:true }
  });
  const dev = process.env.VITE_DEV_SERVER_URL;
  if (dev) win.loadURL(dev); else win.loadFile(path.join(__dirname,'..','dist','index.html'));
  win.webContents.setWindowOpenHandler(({url}) => { if (/^https?:\/\//i.test(url)) shell.openExternal(url); return {action:'deny'}; });
}

async function getUpdateStatus(force = false) {
  const now = Date.now();
  if (!force && lastUpdateResult && now - lastUpdateCheckAt < UPDATE_CACHE_MS) return lastUpdateResult;
  lastUpdateCheckAt = now;
  lastUpdateResult = await updates.checkForUpdate(app.getVersion());
  if (lastUpdateResult?.available && lastUpdateResult.latestVersion && lastUpdateResult.latestVersion !== lastNotifiedVersion && win && !win.isDestroyed()) {
    lastNotifiedVersion = lastUpdateResult.latestVersion;
    win.webContents.send('update:available', lastUpdateResult);
  }
  return lastUpdateResult;
}

function startUpdatePolling() {
  if (updateTimer) clearInterval(updateTimer);
  setTimeout(() => { getUpdateStatus(true).catch(() => {}); }, 10000);
  updateTimer = setInterval(() => { getUpdateStatus(true).catch(() => {}); }, UPDATE_POLL_MS);
  updateTimer.unref?.();
}

function speechToken(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '');
}

function levenshtein(a, b) {
  a = speechToken(a); b = speechToken(b);
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = Array.from({length:b.length+1}, (_,i)=>i);
  for (let i=1;i<=a.length;i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j=1;j<=b.length;j++) {
      const old = prev[j];
      prev[j] = Math.min(prev[j]+1, prev[j-1]+1, diag + (a[i-1] === b[j-1] ? 0 : 1));
      diag = old;
    }
  }
  return prev[b.length];
}

function findWakeWord(text) {
  const original = String(text || '');
  const lower = original.toLowerCase();
  const wakeWords = settings.wakeWords || ['jarvis'];
  const exact = wakeWords.find(w => lower.includes(String(w).toLowerCase()));
  if (exact) return { configured:exact, heard:exact, fuzzy:false };

  // System.Speech commonly varies a single vowel/consonant in proper names.
  // Allow only a one-character difference for wake names of 5+ characters.
  const heardTokens = original.split(/[\s,.:;!?\-]+/).map(speechToken).filter(Boolean);
  for (const configured of wakeWords) {
    const target = speechToken(configured);
    if (target.length < 5) continue;
    for (const heard of heardTokens) {
      if (Math.abs(heard.length - target.length) > 1) continue;
      if (levenshtein(heard, target) <= 1) return { configured, heard, fuzzy:true };
    }
  }
  return null;
}

function stripWakeWord(text, wakeMatch) {
  if (!wakeMatch) return String(text || '').trim();
  const heard = wakeMatch.heard || wakeMatch.configured;
  const escapedWake = String(heard).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(text || '').replace(new RegExp(escapedWake,'i'),'').replace(/^[,\s:;-]+/, '').trim();
}

function stopCurrentSpeech(reason = 'Speech stopped.') {
  voiceCancelEpoch += 1;
  wakeActiveUntil = 0;
  const result = voice.stopSpeaking();
  if (win && !win.isDestroyed()) {
    win.webContents.send('voice:recognized', { recognized:reason, command:'stop_speaking', reply:{ intent:'stop_speaking', text:reason }, actionResult:result });
  }
  return result;
}

async function runRecognized(text, recognition = {}) {
  if (!win || win.isDestroyed()) return;
  const wakeMatch = findWakeWord(text);
  const cleaned = stripWakeWord(text, wakeMatch);
  const now = Date.now();
  const wakeWasActive = now < wakeActiveUntil;

  if (STOP_SPEAKING_RE.test(cleaned || text)) {
    if (wakeMatch) await voice.playWakeSound();
    stopCurrentSpeech('Speech stopped.');
    return;
  }

  if (wakeMatch) {
    wakeActiveUntil = now + WAKE_WINDOW_MS;
    await voice.playWakeSound();
    win.webContents.send('voice:wake', {
      wakeWord:wakeMatch.configured,
      heard:wakeMatch.heard,
      fuzzy:wakeMatch.fuzzy,
      confidence:recognition?.confidence ?? null,
      activeUntil:wakeActiveUntil
    });
    if (!cleaned) return;
  }

  if (voiceCommandBusy) return;
  const commandText = cleaned || String(text || '').trim();
  const detectedIntent = assistant.detectIntent(commandText);
  const activated = Boolean(wakeMatch || wakeWasActive);

  if (settings.requireWakeWord && !activated) return;
  if (!settings.requireWakeWord && detectedIntent === 'chat' && !activated) return;
  if (detectedIntent === lastVoiceIntent && Date.now() - lastVoiceFinishedAt < VOICE_DUPLICATE_COOLDOWN_MS) return;

  voiceCommandBusy = true;
  const requestEpoch = voiceCancelEpoch;
  try {
    const reply = await assistant.ask(commandText, settings, { optimizer:lastOptimizer?.recommended });
    let actionResult = null;
    if (reply.intent && settings.commands?.[reply.intent]) actionResult = await hotkeys.runCommand(reply.intent, settings);
    if (requestEpoch !== voiceCancelEpoch) return;
    lastVoiceIntent = reply.intent || detectedIntent;
    win.webContents.send('voice:recognized', { recognized:text, command:commandText, confidence:recognition?.confidence ?? null, reply, actionResult });
    if (settings.speakReplies && requestEpoch === voiceCancelEpoch) {
      await voice.speak(actionResult?.error ? `${reply.text} ${actionResult.error}` : reply.text, settings.language);
    }
  } finally {
    lastVoiceFinishedAt = Date.now();
    voiceCommandBusy = false;
  }
}

app.whenReady().then(async () => {
  await storage.init(databaseFile());
  await loadSettings();
  createWindow();
  startUpdatePolling();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length===0) createWindow(); });
});
app.on('window-all-closed', () => {
  voice.stop();
  if (updateTimer) clearInterval(updateTimer);
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('app:bootstrap', async () => {
  const [status, news, opt, update] = await Promise.all([getStatus(), getNews(), optimizer.analyze(settings.customInstallPath), getUpdateStatus(false)]);
  lastOptimizer = opt;
  return { status, news, optimizer:opt, settings, creator:assistant.CREATOR, appVersion:app.getVersion(), update, storagePath:storage.getPath(), voiceStatus:voice.getStatus() };
});
ipcMain.handle('sc:status', () => getStatus());
ipcMain.handle('sc:news', () => getNews());
ipcMain.handle('fleet:search', (_e,q) => searchModels(q));
ipcMain.handle('market:search', (_e,p) => searchMarket(p));
ipcMain.handle('wiki:search', (_e,q) => wiki.searchVerse(q));
ipcMain.handle('optimizer:analyze', async () => { lastOptimizer = await optimizer.analyze(settings.customInstallPath); return lastOptimizer; });
ipcMain.handle('optimizer:apply', (_e,p) => optimizer.apply(p));
ipcMain.handle('optimizer:restore', () => optimizer.restore());
ipcMain.handle('voice:speak', (_e,text) => voice.speak(text, settings.language));
ipcMain.handle('voice:stop-speaking', () => stopCurrentSpeech('Speech stopped.'));
ipcMain.handle('voice:start', () => startVoiceListener());
ipcMain.handle('voice:stop', () => voice.stop());
ipcMain.handle('voice:status', () => voice.getStatus());
ipcMain.handle('hotkey:run', (_e,cmd) => hotkeys.runCommand(cmd, settings));
ipcMain.handle('assistant:ask', async (_e,msg) => {
  if (assistantRequestBusy) return { busy:true, reply:{ intent:'chat', text:'One request is already being processed. Please wait for it to finish.' }, actionResult:null };
  assistantRequestBusy = true;
  const requestEpoch = voiceCancelEpoch;
  try {
    const reply = await assistant.ask(msg, settings, { optimizer:lastOptimizer?.recommended });
    let actionResult = null;
    if (reply.intent && settings.commands?.[reply.intent]) actionResult = await hotkeys.runCommand(reply.intent, settings);
    if (settings.speakReplies && requestEpoch === voiceCancelEpoch) await voice.speak(actionResult?.error ? `${reply.text} ${actionResult.error}` : reply.text, settings.language);
    return { reply, actionResult };
  } finally { assistantRequestBusy = false; }
});
ipcMain.handle('ollama:models', (_e,baseUrl) => ollama.listModels(baseUrl || settings.ollama?.baseUrl));
ipcMain.handle('update:check', () => getUpdateStatus(true));
ipcMain.handle('settings:get', () => settings);
ipcMain.handle('settings:save', (_e,next) => saveSettings(next));
ipcMain.handle('shell:open', async (_e,url) => { if (/^https?:\/\//i.test(url)) { await shell.openExternal(url); return true; } return false; });
