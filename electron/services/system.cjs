const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const execFileAsync = promisify(execFile);

async function ps(script) {
  if (process.platform !== 'win32') return null;
  const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    windowsHide: true, timeout: 15000, maxBuffer: 4 * 1024 * 1024
  });
  return stdout.trim();
}

async function getHardware() {
  const basic = {
    platform: process.platform,
    cpu: os.cpus()?.[0]?.model || 'Unknown CPU',
    cpuThreads: os.cpus()?.length || 0,
    ramGB: Math.round((os.totalmem() / 1024 ** 3) * 10) / 10,
    gpu: 'Unknown GPU',
    vramGB: null
  };
  if (process.platform !== 'win32') return basic;
  try {
    const raw = await ps(`Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM | ConvertTo-Json -Compress`);
    const list = JSON.parse(raw || '[]');
    const gpus = Array.isArray(list) ? list : [list];
    const preferred = gpus.find(g => /nvidia|radeon|arc/i.test(g.Name || '')) || gpus[0];
    if (preferred) {
      basic.gpu = preferred.Name || basic.gpu;
      if (Number(preferred.AdapterRAM) > 0) basic.vramGB = Math.round((Number(preferred.AdapterRAM) / 1024 ** 3) * 10) / 10;
    }
    if (/nvidia/i.test(basic.gpu)) {
      try {
        const { stdout } = await execFileAsync('nvidia-smi.exe', ['--query-gpu=name,memory.total', '--format=csv,noheader,nounits'], { windowsHide: true, timeout: 8000 });
        const first = stdout.trim().split(/\r?\n/)[0];
        const parts = first.split(',').map(x => x.trim());
        if (parts[0]) basic.gpu = parts[0];
        const mib = Number(parts[1]);
        if (mib > 0) basic.vramGB = Math.round((mib / 1024) * 10) / 10;
      } catch {}
    }
  } catch { /* keep portable fallback */ }
  return basic;
}

function normalizeCandidate(value) {
  if (!value) return null;
  let candidate = String(value).trim().replace(/^['"]|['"]$/g, '');
  if (!candidate) return null;
  try { candidate = path.normalize(candidate); } catch {}

  const lower = candidate.toLowerCase();
  const marker = `${path.sep}starcitizen${path.sep}`.toLowerCase();
  const index = lower.indexOf(marker);
  if (index >= 0) return candidate.slice(0, index + marker.length - 1);
  if (path.basename(candidate).toLowerCase() === 'starcitizen') return candidate;

  // If a StarCitizen.exe path was returned from a running process, walk up
  // until the StarCitizen root is found.
  let current = candidate;
  try {
    if (path.extname(current)) current = path.dirname(current);
    for (let i = 0; i < 8; i += 1) {
      if (path.basename(current).toLowerCase() === 'starcitizen') return current;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  } catch {}

  return candidate;
}

function validateInstallRoot(candidate) {
  const root = normalizeCandidate(candidate);
  if (!root) return null;
  try {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return null;
    const entries = fs.readdirSync(root, { withFileTypes:true }).filter(e => e.isDirectory());
    const preferredNames = ['LIVE', 'PTU', 'EPTU', 'TECH-PREVIEW', 'HOTFIX'];
    const channels = entries
      .filter(entry => preferredNames.includes(entry.name.toUpperCase()) || fs.existsSync(path.join(root, entry.name, 'Data.p4k')) || fs.existsSync(path.join(root, entry.name, 'Bin64', 'StarCitizen.exe')))
      .map(entry => entry.name);
    if (!channels.length) return null;
    return { found:true, root, channels };
  } catch { return null; }
}

function addCandidate(set, value) {
  const normalized = normalizeCandidate(value);
  if (normalized) set.add(normalized);
}

function addConventionalRoots(set, drive) {
  const root = `${drive}${path.sep}`;
  const bases = [
    path.join(root, 'Program Files', 'Roberts Space Industries', 'StarCitizen'),
    path.join(root, 'Program Files (x86)', 'Roberts Space Industries', 'StarCitizen'),
    path.join(root, 'Roberts Space Industries', 'StarCitizen'),
    path.join(root, 'Games', 'Roberts Space Industries', 'StarCitizen'),
    path.join(root, 'Games', 'StarCitizen'),
    path.join(root, 'RSI', 'StarCitizen'),
    path.join(root, 'StarCitizen')
  ];
  for (const value of bases) addCandidate(set, value);
}

async function runningProcessCandidates(set) {
  if (process.platform !== 'win32') return;
  try {
    const raw = await ps(`Get-CimInstance Win32_Process -Filter "Name='StarCitizen.exe'" | Select-Object -ExpandProperty ExecutablePath | ConvertTo-Json -Compress`);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    for (const value of (Array.isArray(parsed) ? parsed : [parsed])) addCandidate(set, value);
  } catch {}
}

async function registryCandidates(set) {
  if (process.platform !== 'win32') return;
  try {
    const script = `
$paths=@(
 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
 'HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
);
Get-ItemProperty $paths -ErrorAction SilentlyContinue |
 Where-Object { $_.DisplayName -match 'RSI Launcher|Star Citizen|Roberts Space Industries' } |
 Select-Object DisplayName,InstallLocation,DisplayIcon |
 ConvertTo-Json -Compress
`;
    const raw = await ps(script);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    for (const row of rows) {
      const location = row.InstallLocation || (row.DisplayIcon ? path.dirname(String(row.DisplayIcon).split(',')[0]) : null);
      if (!location) continue;
      addCandidate(set, location);
      addCandidate(set, path.join(location, 'StarCitizen'));
      addCandidate(set, path.join(location, '..', 'StarCitizen'));
    }
  } catch {}
}

function scanLauncherHints(set) {
  if (process.platform !== 'win32') return;
  const roots = [
    process.env.APPDATA && path.join(process.env.APPDATA, 'rsilauncher'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'rsilauncher'),
    process.env.APPDATA && path.join(process.env.APPDATA, 'RSI Launcher'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'RSI Launcher')
  ].filter(Boolean);

  const pathRegex = /[A-Za-z]:\\[^\r\n"']*?StarCitizen(?:\\[^\r\n"']*)?/gi;
  let inspected = 0;

  function walk(dir, depth = 0) {
    if (depth > 3 || inspected >= 60) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes:true }); } catch { return; }
    for (const entry of entries) {
      if (inspected >= 60) break;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
        continue;
      }
      if (!/\.(json|log|txt|cfg|ini)$/i.test(entry.name)) continue;
      inspected += 1;
      try {
        const stat = fs.statSync(full);
        if (stat.size > 2 * 1024 * 1024) continue;
        const text = fs.readFileSync(full, 'utf8');
        for (const match of text.match(pathRegex) || []) addCandidate(set, match);
      } catch {}
    }
  }

  for (const root of roots) if (fs.existsSync(root)) walk(root);
}

async function mountedDriveLetters() {
  if (process.platform !== 'win32') return [];
  try {
    const raw = await ps(`Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match '^[A-Za-z]:\\\\$' } | Select-Object -ExpandProperty Name | ConvertTo-Json -Compress`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return (Array.isArray(parsed) ? parsed : [parsed]).map(x => `${String(x).toUpperCase()}:`);
  } catch {
    return 'CDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `${letter}:`).filter(drive => {
      try { return fs.existsSync(`${drive}${path.sep}`); } catch { return false; }
    });
  }
}

async function findStarCitizenInstall(customPath) {
  const candidates = new Set();
  addCandidate(candidates, customPath);

  await runningProcessCandidates(candidates);
  scanLauncherHints(candidates);
  await registryCandidates(candidates);

  const drives = await mountedDriveLetters();
  for (const drive of drives) addConventionalRoots(candidates, drive);

  for (const candidate of candidates) {
    const valid = validateInstallRoot(candidate);
    if (valid) return { ...valid, detectedFrom: candidate === normalizeCandidate(customPath) ? 'custom' : 'automatic' };
  }

  return { found:false, root:customPath || null, channels:[], detectedFrom:null, candidatesChecked:candidates.size };
}

module.exports = { ps, getHardware, findStarCitizenInstall, validateInstallRoot };
