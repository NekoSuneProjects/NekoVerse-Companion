const { ps } = require('./system.cjs');

const KEY = {
  CTRL: 0x11, ALT: 0x12, SHIFT: 0x10, ENTER: 0x0D, ESC: 0x1B, TAB: 0x09, SPACE: 0x20,
  F1:0x70,F2:0x71,F3:0x72,F4:0x73,F5:0x74,F6:0x75,F7:0x76,F8:0x77,F9:0x78,F10:0x79,F11:0x7A,F12:0x7B
};
for (let i=0;i<=9;i++) KEY[String(i)] = 0x30+i;
for (let i=0;i<26;i++) KEY[String.fromCharCode(65+i)] = 0x41+i;

function parseCombo(combo='') {
  return combo.split('+').map(x => x.trim().toUpperCase()).filter(Boolean).map(k => KEY[k]).filter(Number.isFinite);
}

async function sendCombo(combo) {
  if (process.platform !== 'win32') return { ok: false, error: 'Hotkey output is Windows-only.' };
  const keys = parseCombo(combo);
  if (!keys.length) return { ok: false, error: `No valid keys in “${combo}”. Configure the command in Settings.` };
  const arr = keys.join(',');
  const script = `
$src=@'\nusing System; using System.Runtime.InteropServices; public static class NVK { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }\n'@;
Add-Type $src -ErrorAction SilentlyContinue;
$keys=@(${arr}); foreach($k in $keys){[NVK]::keybd_event([byte]$k,0,0,[UIntPtr]::Zero)}; Start-Sleep -Milliseconds 45; [array]::Reverse($keys); foreach($k in $keys){[NVK]::keybd_event([byte]$k,0,2,[UIntPtr]::Zero)}
`;
  try { await ps(script); return { ok: true, combo }; } catch (e) { return { ok: false, error: e.message }; }
}

async function runCommand(command, settings) {
  const combo = settings?.commands?.[command]?.combo;
  if (!combo) return { ok: false, error: `“${command}” has no hotkey assigned yet.` };
  return sendCombo(combo);
}

module.exports = { sendCombo, runCommand, parseCombo };
