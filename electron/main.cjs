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

const VOICE_DUPLICATE_COOLDOWN_MS = 4000;
const UPDATE_POLL_MS = 5 * 60 * 1000;
const UPDATE_CACHE_MS = 60 * 1000;
const LEGACY_WAKE_WORDS = ['neko', 'nekoverse', 'computer'];

const defaultSettings = {
  // Direct microphone commands are the default. Users can optionally turn
  // wake-word mode back on and choose their own easier-to-pronounce word.
  wakeWords: [],
  requireWakeWord: false,
  speakReplies: true,
  customInstallPath: '',
  commands: buildDefaultCommands(),
  ollama: {
    baseUrl: ollama.DEFAULT_BASE_URL,
    model: ollama.DEFAULT_MODEL
  }
};

function settingsFile() { return path.join(app.getPath('userData'), 'settings.json'); }
function sameWords(a = [], b = []) {
  return a.length === b.length && a.every((word, i) => String(word).toLowerCase() === String(b[i]).toLowerCase());
}
function loadSettings() {
  let loaded = null;
  try { loaded = JSON.parse(fs.readFileSync(settingsFile(),'utf8')); }
  catch { loaded = null; }

  settings = loaded ? { ...defaultSettings, ...loaded } : structuredClone(defaultSettings);

  // Migrate the old shipped default so existing installs no longer require
  // users to pronounce “Neko”. Custom wake-word setups are left untouched.
  if (loaded?.requireWakeWord === true && sameWords(loaded?.wakeWords || [], LEGACY_WAKE_WORDS)) {
    settings.requireWakeWord = false;
    settings.wakeWords = [];
  }

  settings.commands = { ...defaultSettings.commands, ...(settings.commands || {}) };
  for (const [id, defaults] of Object.entries(defaultSettings.commands)) {
    settings.commands[id] = { ...defaults, ...(settings.commands[id] || {}) };
  }
  settings.ollama = { ...defaultSettings.ollama, ...(settings.ollama || {}) };

  if (loaded?.requireWakeWord === true && sameWords(loaded?.wakeWords || [], LEGACY_WAKE_WORDS)) {
    try {
      fs.mkdirSync(path.dirname(settingsFile()), {recursive:true});
      fs.writeFileSync(settingsFile(), JSON.stringify(settings,null,2));
    } catch {}
  }

  return settings;
}
function saveSettings(next) {
  settings = {
    ...settings,
    ...next,
    commands:{...settings.commands,...(next.commands||{})},
    ollama:{...settings.ollama,...(next.ollama||{})}
  };
  fs.mkdirSync(path.dirname(settingsFile()), {recursive:true});
  fs.writeFileSync(settingsFile(), JSON.stringify(settings,null,2));
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

  if (
    lastUpdateResult?.available &&
    lastUpdateResult.latestVersion &&
    lastUpdateResult.latestVersion !== lastNotifiedVersion &&
    win && !win.isDestroyed()
  ) {
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

async function runRecognized(text) {
  if (!win || win.isDestroyed() || voiceCommandBusy) return;

  const lower = text.toLowerCase();
  const wake = (settings.wakeWords || []).find(w => lower.includes(String(w).toLowerCase()));
  if (settings.requireWakeWord && !wake) return;

  const escapedWake = wake ? String(wake).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
  const cleaned = wake ? text.replace(new RegExp(escapedWake,'i'),'').trim() : text.trim();
  const commandText = cleaned || text;
  const detectedIntent = assistant.detectIntent(commandText);

  // In direct-microphone mode, ignore ordinary background conversation.
  // Only known command/special intents are processed without a wake word.
  if (!settings.requireWakeWord && detectedIntent === 'chat') return;

  // SpeechRecognition can emit the same phrase more than once, and TTS can be
  // picked up by the microphone. Only accept one command at a time and ignore
  // a duplicate intent for a short period after the previous one completes.
  if (detectedIntent === lastVoiceIntent && Date.now() - lastVoiceFinishedAt < VOICE_DUPLICATE_COOLDOWN_MS) return;

  voiceCommandBusy = true;
  try {
    const reply = await assistant.ask(commandText, settings, { optimizer:lastOptimizer?.recommended });
    let actionResult = null;
    if (reply.intent && settings.commands?.[reply.intent]) actionResult = await hotkeys.runCommand(reply.intent, settings);

    lastVoiceIntent = reply.intent || detectedIntent;
    const payload = { recognized:text, command:commandText, reply, actionResult };
    win.webContents.send('voice:recognized', payload);

    // Await TTS so the microphone lock stays active while the app is speaking.
    if (settings.speakReplies) {
      await voice.speak(actionResult?.error ? `${reply.text} ${actionResult.error}` : reply.text);
    }
  } finally {
    lastVoiceFinishedAt = Date.now();
    voiceCommandBusy = false;
  }
}

app.whenReady().then(() => {
  loadSettings();
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
  const [status, news, opt, update] = await Promise.all([
    getStatus(),
    getNews(),
    optimizer.analyze(settings.customInstallPath),
    getUpdateStatus(false)
  ]);
  lastOptimizer = opt;
  return { status, news, optimizer:opt, settings, creator:assistant.CREATOR, appVersion:app.getVersion(), update };
});
ipcMain.handle('sc:status', () => getStatus());
ipcMain.handle('sc:news', () => getNews());
ipcMain.handle('fleet:search', (_e,q) => searchModels(q));
ipcMain.handle('market:search', (_e,p) => searchMarket(p));
ipcMain.handle('optimizer:analyze', async () => { lastOptimizer = await optimizer.analyze(settings.customInstallPath); return lastOptimizer; });
ipcMain.handle('optimizer:apply', (_e,p) => optimizer.apply(p));
ipcMain.handle('optimizer:restore', () => optimizer.restore());
ipcMain.handle('voice:speak', (_e,text) => voice.speak(text));
ipcMain.handle('voice:start', () => voice.start(runRecognized));
ipcMain.handle('voice:stop', () => voice.stop());
ipcMain.handle('hotkey:run', (_e,cmd) => hotkeys.runCommand(cmd, settings));
ipcMain.handle('assistant:ask', async (_e,msg) => {
  if (assistantRequestBusy) {
    return { busy:true, reply:{ intent:'chat', text:'One request is already being processed. Please wait for it to finish.' }, actionResult:null };
  }
  assistantRequestBusy = true;
  try {
    const reply = await assistant.ask(msg, settings, { optimizer:lastOptimizer?.recommended });
    let actionResult = null;
    if (reply.intent && settings.commands?.[reply.intent]) actionResult = await hotkeys.runCommand(reply.intent, settings);
    if (settings.speakReplies) await voice.speak(actionResult?.error ? `${reply.text} ${actionResult.error}` : reply.text);
    return { reply, actionResult };
  } finally {
    assistantRequestBusy = false;
  }
});
ipcMain.handle('ollama:models', (_e,baseUrl) => ollama.listModels(baseUrl || settings.ollama?.baseUrl));
ipcMain.handle('update:check', () => getUpdateStatus(true));
ipcMain.handle('settings:get', () => settings);
ipcMain.handle('settings:save', (_e,next) => saveSettings(next));
ipcMain.handle('shell:open', async (_e,url) => { if (/^https?:\/\//i.test(url)) { await shell.openExternal(url); return true; } return false; });
