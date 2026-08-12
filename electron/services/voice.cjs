const { spawn, execFile } = require('node:child_process');

let listener = null;
let speaker = null;

function speak(text) {
  if (process.platform !== 'win32') return Promise.resolve({ ok:false, error:'Windows TTS is required for built-in voice output.' });
  const safe = String(text || '').replace(/'/g, "''").slice(0, 1500);

  stopSpeaking();

  return new Promise(resolve => {
    const child = execFile(
      'powershell.exe',
      ['-NoProfile','-NonInteractive','-Command', `Add-Type -AssemblyName System.Speech; $s=New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak('${safe}')`],
      { windowsHide:true },
      err => {
        if (speaker === child) speaker = null;
        resolve(err ? {ok:false,error:err.message}:{ok:true});
      }
    );
    speaker = child;
  });
}

function stopSpeaking() {
  if (!speaker) return { ok:true, speaking:false };
  const child = speaker;
  speaker = null;
  try { child.kill(); } catch {}
  return { ok:true, speaking:false, interrupted:true };
}

function playWakeSound() {
  if (process.platform !== 'win32') return Promise.resolve({ ok:false, error:'Wake sound currently uses Windows audio.' });
  return new Promise(resolve => {
    execFile(
      'powershell.exe',
      ['-NoProfile','-NonInteractive','-Command', `[console]::Beep(880,90); Start-Sleep -Milliseconds 35; [console]::Beep(1175,80)`],
      { windowsHide:true },
      err => resolve(err ? {ok:false,error:err.message}:{ok:true})
    );
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
  stopSpeaking();
  if (!listener) return { ok:true, running:false };
  try { listener.kill(); } catch {}
  listener = null;
  return { ok:true, running:false };
}

module.exports = { speak, stopSpeaking, playWakeSound, start, stop };
