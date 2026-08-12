const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const execFileAsync = promisify(execFile);

async function ps(script) {
  if (process.platform !== 'win32') return null;
  const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    windowsHide: true, timeout: 15000, maxBuffer: 1024 * 1024
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

function candidateInstallRoots() {
  const drives = ['C:', 'D:', 'E:', 'F:', 'G:'];
  return drives.flatMap(d => [
    path.join(d + path.sep, 'Program Files', 'Roberts Space Industries', 'StarCitizen'),
    path.join(d + path.sep, 'Roberts Space Industries', 'StarCitizen'),
    path.join(d + path.sep, 'Games', 'Roberts Space Industries', 'StarCitizen')
  ]);
}

function findStarCitizenInstall(customPath) {
  const candidates = [customPath, ...candidateInstallRoots()].filter(Boolean);
  for (const root of candidates) {
    try {
      if (fs.existsSync(root)) {
        const channels = ['LIVE', 'PTU', 'EPTU', 'TECH-PREVIEW'].filter(c => fs.existsSync(path.join(root, c)));
        return { found: true, root, channels };
      }
    } catch {}
  }
  return { found: false, root: customPath || null, channels: [] };
}

module.exports = { ps, getHardware, findStarCitizenInstall };
