const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { getHardware, findStarCitizenInstall } = require('./system.cjs');

function detectTier(hw) {
  const gpu = (hw.gpu || '').toLowerCase();
  const vram = Number(hw.vramGB || 0);
  const ram = Number(hw.ramGB || 0);
  const threads = Number(hw.cpuThreads || 0);
  let points = 0;
  if (ram >= 32) points += 2; else if (ram >= 16) points += 1;
  if (threads >= 12) points += 2; else if (threads >= 8) points += 1;
  if (/rtx\s?(40|50|60)|rx\s?(7|8|9)\d{3}|arc\s?b/i.test(gpu)) points += 4;
  else if (/rtx\s?(20|30)|rx\s?(5|6)\d{3}|arc\s?a/i.test(gpu)) points += 3;
  else if (/gtx\s?10|rx\s?(4|5)\d{2}/i.test(gpu)) points += 1;
  if (vram >= 12) points += 3; else if (vram >= 8) points += 2; else if (vram >= 6) points += 1;
  if (points >= 9) return 'high';
  if (points >= 6) return 'balanced';
  return 'performance';
}

function recommendations(hw) {
  const tier = detectTier(hw);
  const gpu = (hw.gpu || '').toLowerCase();
  const vram = Number(hw.vramGB || 0);
  const hasRtx = /rtx/i.test(gpu);
  const modernGpu = /rtx|rx\s?(5|6|7|8|9)\d{3}|arc/i.test(gpu);
  const texture = vram && vram <= 6 ? 'Low' : vram && vram <= 8 ? 'Medium' : vram >= 12 ? 'High / Very High' : 'Medium';
  return {
    tier,
    renderer: modernGpu ? 'Vulkan (switch to DirectX 11 if 4.9 causes severe FPS drops)' : 'DirectX 11 / D3D for compatibility',
    graphicsRendererValue: modernGpu ? 1 : 0,
    upscaler: hasRtx ? 'NVIDIA DLSS' : 'CIG TSR',
    upscalerQuality: tier === 'performance' ? 'Performance / Balanced' : tier === 'balanced' ? 'Balanced / Quality' : 'Quality',
    texture,
    clouds: tier === 'high' ? 'Medium' : 'Low / Medium',
    resolution: tier === 'performance' ? '1080p or reduced render resolution' : tier === 'balanced' ? 'Native with Quality/Balanced upscaling' : 'Native; use Quality upscaling if GPU-bound',
    notes: [
      'Keep GPU drivers current and stable.',
      'VRAM pressure can cause large frame-time spikes; texture quality is conservative when VRAM is limited.',
      'Vulkan can reduce CPU overhead on some systems, but current builds may have Vulkan-specific severe FPS issues on some PCs.',
      'This app backs up renderer settings before making any change.'
    ]
  };
}

function graphicsDirs() {
  const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const root = path.join(local, 'Star Citizen');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(e => e.isDirectory() && /^starcitizen_/i.test(e.name))
    .map(e => ({ name: e.name, dir: path.join(root, e.name), mtime: fs.statSync(path.join(root, e.name)).mtimeMs }))
    .sort((a,b) => b.mtime - a.mtime);
}

function locateGraphicsFile() {
  for (const entry of graphicsDirs()) {
    const file = path.join(entry.dir, 'GraphicsSettings', 'GraphicsSettings.json');
    if (fs.existsSync(file)) return { file, versionDir: entry.dir };
  }
  return { file: null, versionDir: null };
}

async function analyze(customPath) {
  const hardware = await getHardware();
  const install = findStarCitizenInstall(customPath);
  const graphics = locateGraphicsFile();
  return { hardware, install, graphics, recommended: recommendations(hardware) };
}

function backupFile(file) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = `${file}.nekoverse-backup-${stamp}`;
  fs.copyFileSync(file, backup);
  return backup;
}

async function apply(profile = {}) {
  if (process.platform !== 'win32') return { ok: false, error: 'Automatic graphics-file optimisation is Windows-only.' };
  const { file } = locateGraphicsFile();
  if (!file) return { ok: false, error: 'GraphicsSettings.json was not found. Launch Star Citizen once, then try again.' };
  try {
    const original = JSON.parse(fs.readFileSync(file, 'utf8'));
    const backup = backupFile(file);
    const value = Number.isFinite(Number(profile.graphicsRendererValue)) ? Number(profile.graphicsRendererValue) : 0;
    const next = { ...original };
    next.GraphicsSettings = { ...(next.GraphicsSettings || {}), GraphicsRenderer: value };
    fs.writeFileSync(file, JSON.stringify(next, null, 2) + '\n', 'utf8');
    const marker = path.join(path.dirname(file), 'NekoVerse-RecommendedProfile.json');
    fs.writeFileSync(marker, JSON.stringify({ appliedAt: new Date().toISOString(), ...profile }, null, 2), 'utf8');
    return { ok: true, file, backup, marker, changed: { GraphicsRenderer: value } };
  } catch (error) { return { ok: false, error: error.message }; }
}

function restore() {
  const { file } = locateGraphicsFile();
  if (!file) return { ok: false, error: 'Graphics settings file not found.' };
  const dir = path.dirname(file);
  const base = path.basename(file) + '.nekoverse-backup-';
  const backups = fs.readdirSync(dir).filter(x => x.startsWith(base)).map(x => ({ x, m: fs.statSync(path.join(dir,x)).mtimeMs })).sort((a,b)=>b.m-a.m);
  if (!backups.length) return { ok: false, error: 'No NekoVerse backup exists yet.' };
  const source = path.join(dir, backups[0].x);
  fs.copyFileSync(source, file);
  return { ok: true, restoredFrom: source, file };
}

module.exports = { analyze, apply, restore, recommendations, detectTier };
