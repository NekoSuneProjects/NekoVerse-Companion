import React, { useEffect, useMemo, useState } from 'react';
import { Mic, MicOff, Radio, TriangleAlert } from 'lucide-react';
import { api, hasDesktopBridge } from './lib/api.js';

export default function VoiceDiagnostics(){
  const [status,setStatus]=useState(null);
  const [wake,setWake]=useState(null);

  useEffect(()=>{
    if(!hasDesktopBridge()) return;
    let mounted=true;
    api.voiceStatus?.().then(s=>mounted&&setStatus(s)).catch(()=>{});
    const offStatus=api.onVoiceStatus?.(s=>setStatus(s));
    const offWake=api.onWake?.(w=>{
      setWake(w);
      setTimeout(()=>setWake(null),3500);
    });
    return()=>{mounted=false;offStatus?.();offWake?.();};
  },[]);

  const level=Math.max(0,Math.min(100,Number(status?.level||0)));
  const confidence=Number.isFinite(Number(status?.confidence))?Math.round(Number(status.confidence)*100):null;
  const heard=useMemo(()=>String(status?.hypothesis||status?.lastText||'').trim(),[status?.hypothesis,status?.lastText]);

  if(!status?.running && !status?.error) return null;

  return <div className="pointer-events-none fixed bottom-5 left-[265px] z-[90] w-[360px] rounded-xl border border-emerald-300/20 bg-[#06100b]/95 p-3 shadow-2xl backdrop-blur-xl">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {status?.running?<Mic size={15} className="text-emerald-300"/>:<MicOff size={15} className="text-red-300"/>}
        <div>
          <div className="text-xs font-medium text-white/80">Windows default microphone</div>
          <div className="text-[10px] text-white/35">{status?.culture||'recognizer starting'}{status?.fallback?' • Windows fallback culture':''}</div>
        </div>
      </div>
      {confidence!==null&&<span className="text-[10px] text-emerald-200/55">{confidence}%</span>}
    </div>

    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
      <div className="h-full rounded-full bg-emerald-300 transition-[width] duration-150" style={{width:`${level}%`}}/>
    </div>
    <div className="mt-1 flex justify-between text-[9px] text-white/25"><span>MIC LEVEL</span><span>{level}%</span></div>

    {wake&&<div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-2 text-xs text-emerald-100"><Radio size={13}/>Wake heard: {wake.heard||wake.wakeWord}{wake.fuzzy?' (near match)':''}</div>}
    {heard&&<div className="mt-2 truncate text-xs text-white/48">Heard: “{heard}”</div>}
    {status?.error&&<div className="mt-2 flex items-start gap-2 rounded-lg border border-red-300/20 bg-red-300/10 px-2.5 py-2 text-xs text-red-100/80"><TriangleAlert size={13} className="mt-0.5 shrink-0"/><span className="line-clamp-2">{status.error}</span></div>}
  </div>;
}
