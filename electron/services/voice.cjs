const { spawn, execFile } = require('node:child_process');

let listener = null;
let speaker = null;
let listenerCulture = null;
let listenerStatus = { running:false, culture:null, fallback:false, level:0, hypothesis:'', lastText:'', confidence:null };

const CULTURES = {
  'en-GB':'en-GB','en-US':'en-US','es-ES':'es-ES','de-DE':'de-DE','pl-PL':'pl-PL','ru-RU':'ru-RU','fr-FR':'fr-FR','it-IT':'it-IT','pt-PT':'pt-PT','pt-BR':'pt-BR'
};
function normalizeCulture(value){return CULTURES[value]||'en-GB';}

function speak(text, language = listenerCulture || 'en-GB') {
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
    execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',`[console]::Beep(880,100); Start-Sleep -Milliseconds 35; [console]::Beep(1175,95)`],{windowsHide:true},err=>resolve(err?{ok:false,error:err.message}:{ok:true}));
  });
}

function emitStatus(onStatus, patch) {
  listenerStatus = { ...listenerStatus, ...patch };
  try { onStatus?.({ ...listenerStatus }); } catch {}
}

function start(onText,language='en-GB',onStatus=null){
  if(listener)return{ok:true,alreadyRunning:true,culture:listenerCulture,status:{...listenerStatus}};
  if(process.platform!=='win32')return{ok:false,error:'Built-in voice recognition currently requires Windows System.Speech.'};

  const culture=normalizeCulture(language);
  listenerCulture=culture;
  listenerStatus={running:true,culture,fallback:false,level:0,hypothesis:'',lastText:'',confidence:null};
  const safeCulture=culture.replace(/'/g,"''");

  // Continuous async recognition avoids the old three-second stop/restart gap,
  // which could miss a short wake word such as "Jarvis" between Recognize() calls.
  const script=`
Add-Type -AssemblyName System.Speech;
Add-Type -AssemblyName System.Globalization;
$cultureName='${safeCulture}';
$rec=$null;$fallback=$false;
try {
  $culture=[System.Globalization.CultureInfo]::GetCultureInfo($cultureName);
  $rec=New-Object System.Speech.Recognition.SpeechRecognitionEngine($culture);
} catch {
  $fallback=$true;
  $rec=New-Object System.Speech.Recognition.SpeechRecognitionEngine;
}
try { $rec.InitialSilenceTimeout=[TimeSpan]::FromSeconds(0) } catch {}
try { $rec.BabbleTimeout=[TimeSpan]::FromSeconds(0) } catch {}
try { $rec.EndSilenceTimeout=[TimeSpan]::FromMilliseconds(450) } catch {}
try { $rec.EndSilenceTimeoutAmbiguous=[TimeSpan]::FromMilliseconds(650) } catch {}
$rec.SetInputToDefaultAudioDevice();
$rec.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar));
$lastLevelTick=0L;
$rec.add_SpeechHypothesized({ param($sender,$e)
  if($e.Result -and $e.Result.Text){
    $hyp=$e.Result.Text.Replace([char]13,' ').Replace([char]10,' ');
    [Console]::WriteLine('NVHYP:'+$hyp);
    [Console]::Out.Flush();
  }
});
$rec.add_SpeechRecognized({ param($sender,$e)
  if($e.Result -and $e.Result.Text){
    $confidence=[Math]::Round([double]$e.Result.Confidence,3);
    $text=$e.Result.Text.Replace([char]13,' ').Replace([char]10,' ');
    [Console]::WriteLine('NVVOICE:'+$confidence+':'+$text);
    [Console]::Out.Flush();
  }
});
$rec.add_AudioLevelUpdated({ param($sender,$e)
  $now=[Environment]::TickCount64;
  if(($now-$script:lastLevelTick) -ge 250){
    $script:lastLevelTick=$now;
    [Console]::WriteLine('NVLEVEL:'+$e.AudioLevel);
    [Console]::Out.Flush();
  }
});
$rec.add_RecognizeCompleted({ param($sender,$e)
  if($e.Error){ [Console]::WriteLine('NVERROR:'+$e.Error.Message); [Console]::Out.Flush() }
});
Write-Output ('NVSTATUS:' + $(if($fallback){'fallback'}else{$cultureName}));
[Console]::Out.Flush();
$rec.RecognizeAsync([System.Speech.Recognition.RecognizeMode]::Multiple);
try { while($true){ Start-Sleep -Milliseconds 500 } }
finally { try{$rec.RecognizeAsyncCancel()}catch{}; try{$rec.Dispose()}catch{} }
`;

  listener=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true});
  let buf='';
  listener.stdout.on('data',chunk=>{
    buf+=chunk.toString();
    const lines=buf.split(/\r?\n/);buf=lines.pop()||'';
    for(const line of lines){
      if(line.startsWith('NVVOICE:')){
        const body=line.slice(8);
        const firstColon=body.indexOf(':');
        const confidence=firstColon>=0?Number(body.slice(0,firstColon)):null;
        const text=(firstColon>=0?body.slice(firstColon+1):body).trim();
        if(text){
          emitStatus(onStatus,{lastText:text,hypothesis:'',confidence:Number.isFinite(confidence)?confidence:null});
          onText(text,{confidence:Number.isFinite(confidence)?confidence:null,culture:listenerCulture});
        }
      } else if(line.startsWith('NVHYP:')) {
        emitStatus(onStatus,{hypothesis:line.slice(6).trim()});
      } else if(line.startsWith('NVLEVEL:')) {
        const level=Math.max(0,Math.min(100,Number(line.slice(8))||0));
        emitStatus(onStatus,{level});
      } else if(line.startsWith('NVSTATUS:')) {
        const value=line.slice(9).trim();
        if(value==='fallback'){
          listenerCulture='windows-default';
          emitStatus(onStatus,{culture:'windows-default',fallback:true,running:true});
        } else {
          listenerCulture=value||culture;
          emitStatus(onStatus,{culture:listenerCulture,fallback:false,running:true});
        }
      } else if(line.startsWith('NVERROR:')) {
        emitStatus(onStatus,{error:line.slice(8).trim()});
      }
    }
  });
  listener.stderr.on('data',chunk=>{
    const message=chunk.toString().trim();
    if(message)emitStatus(onStatus,{error:message.slice(0,500)});
  });
  listener.on('exit',(code)=>{
    listener=null;listenerCulture=null;
    emitStatus(onStatus,{running:false,level:0,exitCode:code});
  });
  return{ok:true,requestedCulture:culture,input:'Windows default microphone',continuous:true,status:{...listenerStatus}};
}

function stop(){
  stopSpeaking();
  if(!listener){listenerStatus={...listenerStatus,running:false,level:0};return{ok:true,running:false};}
  try{listener.kill();}catch{}
  listener=null;listenerCulture=null;
  listenerStatus={...listenerStatus,running:false,level:0};
  return{ok:true,running:false};
}
function isRunning(){return Boolean(listener);}
function getCulture(){return listenerCulture;}
function getStatus(){return{...listenerStatus,running:Boolean(listener)};}
module.exports={speak,stopSpeaking,playWakeSound,start,stop,isRunning,getCulture,getStatus,normalizeCulture};
