const { ps } = require('./system.cjs');

const KEY = {
  CTRL:0x11, CONTROL:0x11, ALT:0x12, SHIFT:0x10,
  LCTRL:0xA2, RCTRL:0xA3, LALT:0xA4, RALT:0xA5, LSHIFT:0xA0, RSHIFT:0xA1,
  WIN:0x5B, LWIN:0x5B, RWIN:0x5C,
  ENTER:0x0D, RETURN:0x0D, ESC:0x1B, ESCAPE:0x1B, TAB:0x09, SPACE:0x20,
  BACKSPACE:0x08, DELETE:0x2E, INSERT:0x2D, HOME:0x24, END:0x23,
  PAGEUP:0x21, PAGEDOWN:0x22, LEFT:0x25, UP:0x26, RIGHT:0x27, DOWN:0x28,
  CAPSLOCK:0x14, NUMLOCK:0x90, SCROLLLOCK:0x91,
  F1:0x70,F2:0x71,F3:0x72,F4:0x73,F5:0x74,F6:0x75,F7:0x76,F8:0x77,F9:0x78,F10:0x79,F11:0x7A,F12:0x7B,
  NUM0:0x60,NUM1:0x61,NUM2:0x62,NUM3:0x63,NUM4:0x64,NUM5:0x65,NUM6:0x66,NUM7:0x67,NUM8:0x68,NUM9:0x69,
  MULTIPLY:0x6A, ADD:0x6B, SUBTRACT:0x6D, DECIMAL:0x6E, DIVIDE:0x6F
};
for (let i=0;i<=9;i++) KEY[String(i)] = 0x30+i;
for (let i=0;i<26;i++) KEY[String.fromCharCode(65+i)] = 0x41+i;

const MOUSE = {
  MOUSE1:{down:0x0002,up:0x0004,data:0}, LEFTMOUSE:{down:0x0002,up:0x0004,data:0}, LMB:{down:0x0002,up:0x0004,data:0},
  MOUSE2:{down:0x0008,up:0x0010,data:0}, RIGHTMOUSE:{down:0x0008,up:0x0010,data:0}, RMB:{down:0x0008,up:0x0010,data:0},
  MOUSE3:{down:0x0020,up:0x0040,data:0}, MIDDLEMOUSE:{down:0x0020,up:0x0040,data:0}, MMB:{down:0x0020,up:0x0040,data:0},
  MOUSE4:{down:0x0080,up:0x0100,data:1}, XBUTTON1:{down:0x0080,up:0x0100,data:1},
  MOUSE5:{down:0x0080,up:0x0100,data:2}, XBUTTON2:{down:0x0080,up:0x0100,data:2}
};

function tokens(combo='') {
  return String(combo).split('+').map(x => x.trim().toUpperCase()).filter(Boolean);
}

function parseCombo(combo='') {
  return tokens(combo).map(k => KEY[k]).filter(Number.isFinite);
}

function parseMouse(combo='') {
  const mouseToken = tokens(combo).find(k => MOUSE[k] || k === 'WHEELUP' || k === 'WHEELDOWN');
  if (!mouseToken) return null;
  if (mouseToken === 'WHEELUP') return { wheel:120 };
  if (mouseToken === 'WHEELDOWN') return { wheel:-120 };
  return MOUSE[mouseToken];
}

async function sendCombo(combo, options = {}) {
  if (process.platform !== 'win32') return { ok: false, error: 'Hotkey output is Windows-only.' };
  const keys = parseCombo(combo);
  const mouse = parseMouse(combo);
  if (!keys.length && !mouse) return { ok: false, error: `No valid keys or mouse buttons in “${combo}”. Configure the command in Settings.` };

  const holdMs = Math.max(35, Math.min(10000, Number(options.holdMs || 45)));
  const arr = keys.join(',');
  const mouseDown = mouse?.down ?? 0;
  const mouseUp = mouse?.up ?? 0;
  const mouseData = mouse?.data ?? 0;
  const wheel = mouse?.wheel ?? 0;
  const script = `
$src=@'\nusing System; using System.Runtime.InteropServices; public static class NVK { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo); }\n'@;
Add-Type $src -ErrorAction SilentlyContinue;
$keys=@(${arr});
foreach($k in $keys){[NVK]::keybd_event([byte]$k,0,0,[UIntPtr]::Zero)};
if(${wheel} -ne 0){[NVK]::mouse_event(0x0800,0,0,[uint32]([int32]${wheel}),[UIntPtr]::Zero)}
elseif(${mouseDown} -ne 0){[NVK]::mouse_event([uint32]${mouseDown},0,0,[uint32]${mouseData},[UIntPtr]::Zero)};
Start-Sleep -Milliseconds ${holdMs};
if(${mouseUp} -ne 0){[NVK]::mouse_event([uint32]${mouseUp},0,0,[uint32]${mouseData},[UIntPtr]::Zero)};
[array]::Reverse($keys);
foreach($k in $keys){[NVK]::keybd_event([byte]$k,0,2,[UIntPtr]::Zero)}
`;
  try { await ps(script); return { ok: true, combo, holdMs, mouse:Boolean(mouse) }; } catch (e) { return { ok: false, error: e.message }; }
}

async function runCommand(command, settings) {
  const entry = settings?.commands?.[command];
  const combo = entry?.combo;
  if (!combo) return { ok: false, error: `“${command}” has no hotkey assigned yet.` };
  const holdMs = entry?.mode === 'hold' ? (entry.holdMs || 700) : (entry.holdMs || 45);
  return sendCombo(combo, { holdMs });
}

module.exports = { sendCombo, runCommand, parseCombo, parseMouse };
