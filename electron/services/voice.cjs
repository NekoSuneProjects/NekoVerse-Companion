const { spawn, execFile } = require('node:child_process');

let listener = null;

function speak(text) {
  if (process.platform !== 'win32') return Promise.resolve({ ok:false, error:'Windows TTS is required for built-in voice output.' });
  const safe = String(text || '').replace(/'/g, "''").slice(0, 1500);
  return new Promise(resolve => {
    execFile('powershell.exe', ['-NoProfile','-NonInteractive','-Command', `Add-Type -AssemblyName System.Speech; $s=New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak('${safe}')`], { windowsHide:true }, err => resolve(err ? {ok:false,error:err.message}:{ok:true}));
  });
}

function start(onText) {
  if (listener) return { ok: true, alreadyRunning: true };
  if (process.platform !== 'win32') return { ok:false, error:'Built-in voice recognition currently requires Windows System.Speech.' };
  const script = `
Add-Type -AssemblyName System.Speech;
$rec=New-Object System.Speech.Recognition.SpeechRecognitionEngine;
$rec.SetInputToDefaultAudioDevice();
$rec.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar));
while($true){ try { $r=$rec.Recognize([TimeSpan]::FromSeconds(3)); if($r){ Write-Output ('NVVOICE:'+$r.Text); [Console]::Out.Flush() } } catch {} }
`;
  listener = spawn('powershell.exe', ['-NoProfile','-NonInteractive','-Command', script], { windowsHide:true });
  let buf='';
  listener.stdout.on('data', chunk => {
    buf += chunk.toString();
    const lines = buf.split(/\r?\n/); buf = lines.pop() || '';
    for (const line of lines) if (line.startsWith('NVVOICE:')) onText(line.slice(8).trim());
  });
  listener.on('exit', () => { listener = null; });
  return { ok:true };
}

function stop() {
  if (!listener) return { ok:true, running:false };
  try { listener.kill(); } catch {}
  listener = null;
  return { ok:true, running:false };
}

module.exports = { speak, start, stop };
