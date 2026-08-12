const { spawn, execFile } = require('node:child_process');

let listener = null;
let speaker = null;
let listenerCulture = null;

const CULTURES = {
  'en-GB':'en-GB','en-US':'en-US','es-ES':'es-ES','de-DE':'de-DE','pl-PL':'pl-PL','ru-RU':'ru-RU','fr-FR':'fr-FR','it-IT':'it-IT','pt-PT':'pt-PT','pt-BR':'pt-BR'
};
function normalizeCulture(value){return CULTURES[value]||'en-GB';}

function speak(text, language='en-GB') {
  if (process.platform !== 'win32') return Promise.resolve({ok:false,error:'Windows TTS is required for built-in voice output.'});
  const safe = String(text||'').replace(/'/g,"''").slice(0,1800);
  const culture = normalizeCulture(language).replace(/'/g,"''");
  stopSpeaking();
  return new Promise(resolve=>{
    const script=`
Add-Type -AssemblyName System.Speech;
$s=New-Object System.Speech.Synthesis.SpeechSynthesizer;
$c='${culture}';
try {
  $v=$s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq $c } | Select-Object -First 1;
  if($v){ $s.SelectVoice($v.VoiceInfo.Name) }
} catch {}
$s.Speak('${safe}')`;
    const child=execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true},err=>{
      if(speaker===child)speaker=null;
      resolve(err?{ok:false,error:err.message}:{ok:true,culture});
    });
    speaker=child;
  });
}

function stopSpeaking(){
  if(!speaker)return{ok:true,speaking:false};
  const child=speaker;speaker=null;
  try{child.kill();}catch{}
  return{ok:true,speaking:false,interrupted:true};
}

function playWakeSound(){
  if(process.platform!=='win32')return Promise.resolve({ok:false,error:'Wake sound currently uses Windows audio.'});
  return new Promise(resolve=>{
    execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',`[console]::Beep(880,90); Start-Sleep -Milliseconds 35; [console]::Beep(1175,80)`],{windowsHide:true},err=>resolve(err?{ok:false,error:err.message}:{ok:true}));
  });
}

function start(onText,language='en-GB'){
  if(listener)return{ok:true,alreadyRunning:true,culture:listenerCulture};
  if(process.platform!=='win32')return{ok:false,error:'Built-in voice recognition currently requires Windows System.Speech.'};
  const culture=normalizeCulture(language);listenerCulture=culture;
  const safeCulture=culture.replace(/'/g,"''");
  const script=`
Add-Type -AssemblyName System.Speech;
Add-Type -AssemblyName System.Globalization;
$cultureName='${safeCulture}';
$rec=$null;$fallback=$false;
try{$culture=[System.Globalization.CultureInfo]::GetCultureInfo($cultureName);$rec=New-Object System.Speech.Recognition.SpeechRecognitionEngine($culture)}catch{$fallback=$true;$rec=New-Object System.Speech.Recognition.SpeechRecognitionEngine}
$rec.SetInputToDefaultAudioDevice();
$rec.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar));
Write-Output ('NVSTATUS:' + $(if($fallback){'fallback'}else{$cultureName}));[Console]::Out.Flush();
while($true){try{$r=$rec.Recognize([TimeSpan]::FromSeconds(3));if($r){Write-Output ('NVVOICE:'+$r.Text);[Console]::Out.Flush()}}catch{}}
`;
  listener=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true});
  let buf='';
  listener.stdout.on('data',chunk=>{
    buf+=chunk.toString();const lines=buf.split(/\r?\n/);buf=lines.pop()||'';
    for(const line of lines){
      if(line.startsWith('NVVOICE:'))onText(line.slice(8).trim());
      if(line.startsWith('NVSTATUS:')&&line.slice(9).trim()==='fallback')listenerCulture='windows-default';
    }
  });
  listener.on('exit',()=>{listener=null;listenerCulture=null;});
  return{ok:true,requestedCulture:culture};
}

function stop(){stopSpeaking();if(!listener)return{ok:true,running:false};try{listener.kill();}catch{}listener=null;listenerCulture=null;return{ok:true,running:false};}
function isRunning(){return Boolean(listener);}
function getCulture(){return listenerCulture;}
module.exports={speak,stopSpeaking,playWakeSound,start,stop,isRunning,getCulture,normalizeCulture};
