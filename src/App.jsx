import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, Bot, Box, BookOpen, ChevronRight, CircleGauge, Cpu, ExternalLink,
  Gauge, HardDrive, Home, Info, MapPin, MemoryStick, Mic, Newspaper,
  PackageSearch, PlaneLanding, Radio, RefreshCw, RotateCcw, Save, Search,
  Settings, ShieldAlert, Ship, Sparkles, Square, VolumeX, WandSparkles, Zap
} from 'lucide-react';
import { api, hasDesktopBridge } from './lib/api.js';

const nav = [
  ['Command Deck', Home], ['Assistant', Bot], ['Verse Guide', BookOpen],
  ['News', Newspaper], ['FleetYards', Ship], ['Marketplace', PackageSearch],
  ['Optimizer', Gauge], ['Settings', Settings]
];
const greenBtn='bg-emerald-400 text-black hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold';
const ghostBtn='border border-emerald-300/15 bg-emerald-300/[.04] hover:bg-emerald-300/[.08] text-emerald-100 transition';

function Badge({children, tone='green'}) {
  const c=tone==='amber'?'border-amber-300/25 bg-amber-300/10 text-amber-200':tone==='red'?'border-red-300/25 bg-red-300/10 text-red-200':'border-emerald-300/25 bg-emerald-300/10 text-emerald-200';
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] tracking-widest uppercase ${c}`}>{children}</span>;
}
function Card({children,className=''}) { return <div className={`hud-card rounded-xl ${className}`}>{children}</div>; }
function Empty({children}) { return <div className="rounded-lg border border-dashed border-emerald-200/15 p-8 text-center text-sm text-white/45">{children}</div>; }
function Open({url,children}) { return <button onClick={()=>api.openExternal(url)} className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200">{children}<ExternalLink size={13}/></button>; }
function Field({label,value,onChange,type='text',placeholder=''}) { return <label className="block"><span className="mb-1.5 block text-xs text-white/40">{label}</span><input type={type} value={value ?? ''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="w-full rounded-lg border border-emerald-300/15 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-emerald-300/45"/></label>; }
function Check({label,value,onChange}) { return <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(value)} onChange={e=>onChange(e.target.checked)}/>{label}</label>; }
function Spec({icon:I,label,value}) { return <div className="rounded-lg border border-white/6 bg-black/20 p-3"><div className="flex items-center gap-2 text-xs text-white/30"><I size={14} className="text-emerald-300/65"/>{label}</div><div className="mt-2 text-sm text-white/75">{value||'—'}</div></div>; }
function Row({k,v}) { return <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-2"><dt className="text-white/35">{k}</dt><dd className="max-w-[65%] text-right text-white/70">{v||'—'}</dd></div>; }
function humanSize(bytes=0) { if(!bytes)return '—'; const gb=bytes/1024/1024/1024; return gb>=1?`${gb.toFixed(1)} GB`:`${(bytes/1024/1024).toFixed(0)} MB`; }

export default function App(){
  const [page,setPage]=useState('Command Deck');
  const [boot,setBoot]=useState(null);
  const [busy,setBusy]=useState(true);
  const [toast,setToast]=useState('');
  const [voiceOn,setVoiceOn]=useState(false);
  const [voiceEvent,setVoiceEvent]=useState(null);
  const [wakeActive,setWakeActive]=useState(false);
  const [chat,setChat]=useState([{who:'ai',text:'Flight systems ready. Direct commands need no wake word. For questions say “Jarvis, where is New Babbage?” or “Jarvis, where can I mine titanium?”'}]);
  const [message,setMessage]=useState('');
  const [assistantBusy,setAssistantBusy]=useState(false);
  const [fleetQ,setFleetQ]=useState('Carrack');
  const [fleet,setFleet]=useState(null);
  const [marketQ,setMarketQ]=useState('Carrack');
  const [market,setMarket]=useState(null);
  const [lti,setLti]=useState(true);
  const [guideQ,setGuideQ]=useState('New Babbage');
  const [guide,setGuide]=useState(null);
  const [guideBusy,setGuideBusy]=useState(false);
  const [settings,setSettings]=useState(null);
  const [ollamaModels,setOllamaModels]=useState([]);
  const [ollamaBusy,setOllamaBusy]=useState(false);
  const [updateInfo,setUpdateInfo]=useState(null);
  const [updateDismissed,setUpdateDismissed]=useState(null);

  useEffect(()=>{
    (async()=>{
      if(!hasDesktopBridge()){setBusy(false);return;}
      try {
        const b=await api.bootstrap();
        setBoot(b);
        setSettings(b.settings);
        if(b.update?.available)setUpdateInfo(b.update);
      } catch(e){notice(e.message);}
      finally{setBusy(false);}
    })();

    const offVoice=api.onVoice?.(e=>{
      setVoiceEvent(e);
      if(e?.reply?.intent==='stop_speaking'){
        setChat(c=>[...c,{who:'ai',text:'Speech stopped.'}]);
        return;
      }
      const sources=e?.reply?.verseGuide?.items||[];
      setChat(c=>[...c,{who:'user',text:e.command||e.recognized},{who:'ai',text:e.actionResult?.error?`${e.reply.text} ${e.actionResult.error}`:e.reply.text,sources}]);
    });
    const offWake=api.onWake?.(()=>{
      setWakeActive(true);
      setTimeout(()=>setWakeActive(false),8000);
    });
    const offUpdate=api.onUpdateAvailable?.(info=>{
      setUpdateInfo(info);
      setUpdateDismissed(null);
    });
    return()=>{offVoice?.();offWake?.();offUpdate?.();};
  },[]);

  function notice(t){ setToast(String(t)); setTimeout(()=>setToast(''),4200); }
  async function refreshStatus(){const status=await api.refreshStatus();setBoot(b=>({...b,status}));notice('Live/PTU status refreshed');}
  async function toggleVoice(){const r=voiceOn?await api.voiceStop():await api.voiceStart();if(r?.ok){setVoiceOn(!voiceOn);notice(!voiceOn?'Voice listening enabled — direct commands or say Jarvis for questions':'Voice listening stopped');}else notice(r?.error||'Voice action failed');}
  async function stopTalking(){await api.stopSpeaking();notice('Speech stopped');}
  async function sendAssistant(){
    const q=message.trim();
    if(!q||assistantBusy)return;
    setMessage('');
    setAssistantBusy(true);
    setChat(c=>[...c,{who:'user',text:q}]);
    try {
      const r=await api.assistantAsk(q);
      const sources=r?.reply?.verseGuide?.items||[];
      setChat(c=>[...c,{who:'ai',text:r?.actionResult?.error?`${r.reply.text} ${r.actionResult.error}`:r?.reply?.text||'No response',sources}]);
    } finally { setAssistantBusy(false); }
  }
  async function fleetSearch(){setFleet({loading:true});setFleet(await api.searchFleet(fleetQ));}
  async function marketSearch(){setMarket({loading:true});setMarket(await api.searchMarket(marketQ,lti));}
  async function searchGuide(query=guideQ){
    const q=String(query||'').trim(); if(!q||guideBusy)return;
    setGuideQ(q);setGuideBusy(true);setGuide(null);
    try{setGuide(await api.searchVerse(q));}catch(e){setGuide({ok:false,items:[],error:e.message});}
    finally{setGuideBusy(false);}
  }
  async function rescan(){const o=await api.analyzeHardware();setBoot(b=>({...b,optimizer:o}));notice('Hardware scan complete');}
  async function applyOpt(){const r=await api.applyOptimization(boot?.optimizer?.recommended);notice(r?.ok?`Safe profile applied. Backup: ${r.backup}`:r?.error||'Could not apply');}
  async function restoreOpt(){const r=await api.restoreOptimization();notice(r?.ok?'Latest NekoVerse backup restored':r?.error||'Could not restore');}
  async function save(){const s=await api.saveSettings(settings);setSettings(s);notice('Settings saved');}
  async function run(cmd){const r=await api.hotkeyRun(cmd);notice(r?.ok?`Sent ${r.combo}${r.holdMs>100?` for ${r.holdMs} ms`:''}`:r?.error||'Command failed');}
  async function checkUpdate(){const r=await api.checkForUpdates();if(r?.available){setUpdateInfo(r);setUpdateDismissed(null);notice(`Update ${r.latestVersion} is available`);}else notice(r?.ok?'You are on the latest release':r?.error||'Update check failed');}
  async function scanOllama(){
    setOllamaBusy(true);
    try {
      const result=await api.listOllamaModels(settings?.ollama?.baseUrl);
      const models=result?.models||[];
      setOllamaModels(models);
      notice(`Found ${models.length} Ollama model${models.length===1?'':'s'}`);
      if(models.length && !models.some(m=>m.model===settings?.ollama?.model && m.canChat)){
        const preferred=models.find(m=>m.model==='qwen2.5:3b'&&m.canChat)||models.find(m=>m.canChat);
        if(preferred)setSettings(s=>({...s,ollama:{...s.ollama,model:preferred.model}}));
      }
    } catch(e){ notice(`Ollama scan failed: ${e.message}`); }
    finally{ setOllamaBusy(false); }
  }

  const status=boot?.status;
  const opt=boot?.optimizer;
  const hw=opt?.hardware;
  const rec=opt?.recommended;
  const commandGroups=useMemo(()=>{
    const groups={};
    for(const [id,item] of Object.entries(settings?.commands||{})){
      const category=item.category||'Other';
      (groups[category] ||= []).push([id,item]);
    }
    return groups;
  },[settings?.commands]);

  const content={
    'Command Deck': <div className="space-y-5">
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-8 p-6 scanline"><div className="flex items-start justify-between"><div><div className="text-xs tracking-[.32em] text-emerald-300/65">VERSE NETWORK</div><h2 className="mt-2 text-3xl font-light text-white">Flight Command Deck</h2><p className="mt-2 max-w-xl text-sm text-white/48">News, live game data, new-player guidance, voice actions and your local performance profile in one cockpit-friendly desktop companion.</p></div><Radio className="text-emerald-300"/></div><div className="mt-8 grid grid-cols-3 gap-3"><div className="rounded-lg border border-white/6 bg-black/20 p-4"><div className="text-[10px] tracking-[.25em] text-white/35">LIVE</div><div className="mt-2 text-xl text-emerald-300 glow">{status?.live||'—'}</div><div className="mt-1 text-xs text-white/36">{status?.liveBuild||'Official status adapter'}</div></div><div className="rounded-lg border border-white/6 bg-black/20 p-4"><div className="text-[10px] tracking-[.25em] text-white/35">PTU</div><div className="mt-2 text-xl text-white">{status?.ptu||'—'}</div><div className="mt-1 text-xs text-white/36">{status?.stale?'cached fallback':'live check'}</div></div><div className="rounded-lg border border-white/6 bg-black/20 p-4"><div className="text-[10px] tracking-[.25em] text-white/35">APP</div><div className="mt-2 text-xl text-white">v{boot?.appVersion||'—'}</div><div className="mt-1 text-xs text-white/36">Auto-checks GitHub releases</div></div></div><div className="mt-5 flex gap-2"><button onClick={refreshStatus} className={`rounded-lg px-3.5 py-2 text-sm ${ghostBtn}`}><RefreshCw size={14} className="mr-2 inline"/>Refresh network</button><button onClick={()=>setPage('Verse Guide')} className={`rounded-lg px-3.5 py-2 text-sm ${ghostBtn}`}><BookOpen size={14} className="mr-2 inline"/>Open Verse Guide</button><button onClick={()=>setPage('Optimizer')} className={`rounded-lg px-3.5 py-2 text-sm ${greenBtn}`}><WandSparkles size={14} className="mr-2 inline"/>Optimize my PC</button></div></Card>
        <Card className="col-span-4 p-5"><div className="flex items-center justify-between"><div><div className="text-xs tracking-[.28em] text-emerald-300/65">VOICE CORE</div><div className="mt-1 text-xl">Jarvis Assistant</div></div><Bot className="text-emerald-300"/></div><div className="mt-5 rounded-xl border border-emerald-300/10 bg-emerald-300/[.03] p-4"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${voiceOn?'bg-emerald-300 shadow-[0_0_14px_rgba(110,255,170,.8)]':'bg-white/20'}`}/><span className="text-sm text-white/70">{wakeActive?'Jarvis active — ask now':voiceOn?'Listening for commands / Jarvis':'Voice standby'}</span></div><div className="mt-2 text-xs text-emerald-200/55">Direct: “request landing” • AI: “Jarvis, where is New Babbage?”</div><div className="mt-2 text-xs text-white/38">Say “Jarvis, shut up” to interrupt speech.</div></div><button onClick={toggleVoice} className={`mt-4 w-full rounded-lg px-4 py-3 ${voiceOn?ghostBtn:greenBtn}`}>{voiceOn?<><Square size={15} className="mr-2 inline"/>Stop listener</>:<><Mic size={15} className="mr-2 inline"/>Activate voice</>}</button><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={()=>run('request_landing')} className={`rounded-lg px-3 py-2.5 text-sm ${ghostBtn}`}><PlaneLanding size={14} className="mr-1.5 inline"/>Landing</button><button onClick={stopTalking} className={`rounded-lg px-3 py-2.5 text-sm ${ghostBtn}`}><VolumeX size={14} className="mr-1.5 inline"/>Shut up</button></div>{voiceEvent&&<div className="mt-4 text-xs text-white/45">Last command: <span className="text-emerald-200">{voiceEvent.command||voiceEvent.recognized}</span></div>}</Card>
      </div>
      <div className="grid grid-cols-3 gap-4"><Card className="p-5"><Cpu className="text-emerald-300" size={20}/><div className="mt-3 text-xs text-white/35">CPU</div><div className="mt-1 line-clamp-2 text-sm text-white/80">{hw?.cpu||'Scan hardware'}</div></Card><Card className="p-5"><Activity className="text-emerald-300" size={20}/><div className="mt-3 text-xs text-white/35">GPU</div><div className="mt-1 line-clamp-2 text-sm text-white/80">{hw?.gpu||'Scan hardware'}</div></Card><Card className="p-5"><MemoryStick className="text-emerald-300" size={20}/><div className="mt-3 text-xs text-white/35">MEMORY</div><div className="mt-1 text-sm text-white/80">{hw?`${hw.ramGB} GB RAM${hw.vramGB?` • ${hw.vramGB} GB VRAM`:''}`:'Scan hardware'}</div></Card></div>
    </div>,

    'Assistant': <div className="grid h-[calc(100vh-112px)] grid-cols-12 gap-4"><Card className="col-span-8 flex min-h-0 flex-col p-5"><div className="flex items-center justify-between border-b border-white/6 pb-4"><div><div className="text-xs tracking-[.25em] text-emerald-300/60">OLLAMA + VERSE GUIDE</div><div className="mt-1 text-xl">Jarvis Flight Assistant</div><div className="mt-1 text-xs text-white/35">{settings?.ollama?.model||'qwen2.5:3b'} • location/item questions grounded with Star Citizen Wiki data</div></div><div className="flex gap-2"><button onClick={stopTalking} className={`rounded-lg px-3 py-2 text-sm ${ghostBtn}`}><VolumeX size={14} className="mr-2 inline"/>Stop talking</button><button onClick={toggleVoice} className={`rounded-lg px-3 py-2 text-sm ${voiceOn?greenBtn:ghostBtn}`}><Mic size={14} className="mr-2 inline"/>{voiceOn?'Listening':'Voice off'}</button></div></div><div className="min-h-0 flex-1 space-y-3 overflow-auto py-5">{chat.map((m,i)=><div key={i} className={`max-w-[82%] rounded-xl border p-3.5 text-sm leading-relaxed ${m.who==='user'?'ml-auto border-emerald-300/20 bg-emerald-300/10 text-emerald-50':'border-white/7 bg-white/[.025] text-white/72'}`}><div>{m.text}</div>{m.sources?.length>0&&<div className="mt-3 flex flex-wrap gap-2">{m.sources.map((s,j)=><button key={`${s.name}-${j}`} onClick={()=>api.openExternal(s.sourceUrl)} className="rounded-md border border-emerald-300/15 bg-emerald-300/[.04] px-2 py-1 text-[11px] text-emerald-300">{s.type}: {s.name} ↗</button>)}</div>}</div>)}</div><div className="flex gap-2 border-t border-white/6 pt-4"><input disabled={assistantBusy} value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!assistantBusy&&sendAssistant()} placeholder={assistantBusy?'Processing one request…':'Ask about a location, item, ore, ship or command…'} className="flex-1 rounded-lg border border-emerald-300/15 bg-black/30 px-4 py-3 outline-none focus:border-emerald-300/45 disabled:opacity-50"/><button disabled={assistantBusy} onClick={sendAssistant} className={`rounded-lg px-5 ${greenBtn}`}>{assistantBusy?<RefreshCw className="animate-spin" size={18}/>:<ChevronRight/>}</button></div></Card><Card className="col-span-4 min-h-0 overflow-auto p-5"><div className="text-xs tracking-[.25em] text-emerald-300/60">QUICK HELP</div><div className="mt-3 rounded-lg border border-emerald-300/10 bg-emerald-300/[.03] p-3 text-xs leading-relaxed text-white/48">Say <b className="text-emerald-200">Jarvis</b> and you’ll hear a short tone. You then have about 8 seconds to ask a question. Known flight commands can still be spoken directly.</div><div className="mt-4 space-y-2">{['Where is New Babbage?','Where can I mine Titanium?','Where is GrimHEX?','Where can I buy ship components?'].map(q=><button key={q} disabled={assistantBusy} onClick={()=>{setMessage(q);}} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${ghostBtn}`}>{q}</button>)}</div><div className="mt-5 text-xs tracking-[.2em] text-white/30">CONFIGURED ACTIONS</div><div className="mt-3 space-y-3">{Object.entries(commandGroups).slice(0,3).map(([category,items])=><div key={category}><div className="mb-2 text-[10px] uppercase tracking-[.2em] text-white/30">{category}</div>{items.slice(0,3).map(([k,v])=><button key={k} onClick={()=>run(k)} className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs ${ghostBtn}`}><span>{v.label}</span><span className="font-mono text-emerald-300/55">{v.combo||'UNBOUND'}</span></button>)}</div>)}</div></Card></div>,

    'Verse Guide': <div className="space-y-4"><Card className="p-5"><div className="flex items-start justify-between gap-5"><div><div className="text-xs tracking-[.25em] text-emerald-300/60">NEW PLAYER KNOWLEDGE</div><div className="mt-1 text-2xl">Verse Guide</div><p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/45">Search live Star Citizen Wiki API data for cities, landing zones, stations, items, commodities, ores, ships and missions. Jarvis uses the same data when answering location and acquisition questions.</p></div><MapPin className="text-emerald-300" size={30}/></div><div className="mt-5 flex gap-2"><input value={guideQ} onChange={e=>setGuideQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchGuide()} placeholder="New Babbage, Titanium, GrimHEX, Carrack…" className="flex-1 rounded-lg border border-emerald-300/15 bg-black/30 px-4 py-3 outline-none focus:border-emerald-300/45"/><button disabled={guideBusy} onClick={()=>searchGuide()} className={`rounded-lg px-5 ${greenBtn}`}>{guideBusy?<RefreshCw className="animate-spin"/>:<Search/>}</button></div><div className="mt-3 flex flex-wrap gap-2">{['New Babbage','Titanium','GrimHEX','Area18','Lorville','Quantanium'].map(q=><button key={q} onClick={()=>searchGuide(q)} className={`rounded-md px-2.5 py-1.5 text-xs ${ghostBtn}`}>{q}</button>)}</div></Card>{guideBusy?<Empty>Searching the Verse one request at a time…</Empty>:guide?.items?.length?<div className="grid grid-cols-2 gap-3">{guide.items.map((x,i)=><Card key={`${x.type}-${x.identifier||x.name}-${i}`} className="p-5"><div className="flex items-start justify-between gap-3"><div><Badge>{x.type}</Badge><div className="mt-3 text-xl text-white/85">{x.name}</div><div className="mt-1 text-xs text-white/38">{[x.parent,x.system,x.classification].filter(Boolean).join(' • ')||'Star Citizen resource'}</div></div><BookOpen className="text-emerald-300/60"/></div>{x.description&&<p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/48">{x.description}</p>}<div className="mt-4 grid grid-cols-2 gap-2 text-xs">{x.manufacturer&&<div className="rounded-md bg-white/[.025] p-2"><span className="text-white/30">MAKER</span><br/>{x.manufacturer}</div>}{x.version&&<div className="rounded-md bg-white/[.025] p-2"><span className="text-white/30">DATA VERSION</span><br/>{x.version}</div>}</div>{x.amenities?.length>0&&<div className="mt-3 text-xs text-white/42"><span className="text-white/25">AMENITIES:</span> {x.amenities.join(', ')}</div>}{x.shops?.length>0&&<div className="mt-2 text-xs text-white/42"><span className="text-white/25">SHOPS:</span> {x.shops.join(', ')}</div>}{x.locations?.length>0&&<div className="mt-2 text-xs text-white/42"><span className="text-white/25">LOCATIONS:</span> {x.locations.join(', ')}</div>}<div className="mt-4 flex items-center gap-3"><Open url={x.sourceUrl}>Open Wiki source</Open><button onClick={()=>{setMessage(`Where can I find ${x.name}?`);setPage('Assistant');}} className="text-xs text-white/45 hover:text-emerald-200">Ask Jarvis →</button></div></Card>)}</div>:guide?<Card className="p-5"><div className="text-sm text-white/65">No exact data match for <b>{guide.query||guideQ}</b>.</div><div className="mt-2 text-xs text-white/38">Check the spelling or try a shorter term. This is useful for names that voice recognition may have heard incorrectly.</div>{guide.fallbackUrl&&<div className="mt-3"><Open url={guide.fallbackUrl}>Search starcitizen.tools</Open></div>}</Card>:<Empty>Try “New Babbage” to find its planet and landing-zone information, or “Titanium” for current commodity/mining data.</Empty>}</div>,

    'News': <NewsPage boot={boot} setBoot={setBoot} notice={notice}/>,

    'FleetYards': <div className="space-y-4"><Card className="p-5"><div className="flex items-end gap-3"><div className="flex-1"><div className="text-xs tracking-[.25em] text-emerald-300/60">SHIP DATABASE</div><div className="mt-1 text-2xl">FleetYards integration</div><div className="mt-3 flex"><input value={fleetQ} onChange={e=>setFleetQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fleetSearch()} className="w-full rounded-l-lg border border-emerald-300/15 bg-black/30 px-4 py-3 outline-none focus:border-emerald-300/45"/><button onClick={fleetSearch} className={`rounded-r-lg px-5 ${greenBtn}`}><Search/></button></div></div><Ship className="mb-2 text-emerald-300" size={34}/></div></Card>{fleet?.loading?<Empty>Searching FleetYards…</Empty>:fleet?.items?.length?<div className="grid grid-cols-2 gap-4">{fleet.items.map(s=><Card key={s.slug} className="p-5"><div className="flex justify-between"><div><div className="text-xs text-emerald-300/60">{s.manufacturer}</div><div className="mt-1 text-xl">{s.name}</div><div className="mt-2 text-sm text-white/45">{s.focus}</div></div><Box className="text-emerald-300/60"/></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><div className="rounded-md bg-white/[.025] p-2"><span className="text-white/30">SIZE</span><br/>{String(s.size)}</div><div className="rounded-md bg-white/[.025] p-2"><span className="text-white/30">CREW</span><br/>{String(s.crew)}</div><div className="rounded-md bg-white/[.025] p-2"><span className="text-white/30">CARGO</span><br/>{String(s.cargo)}</div></div><div className="mt-4 text-sm"><Open url={s.url}>View on FleetYards</Open></div></Card>)}</div>:<Empty>{fleet?.error||'Search for a ship model to query FleetYards.'}</Empty>}</div>,

    'Marketplace': <div className="space-y-4"><Card className="p-5"><div className="flex items-center justify-between"><div><div className="text-xs tracking-[.25em] text-emerald-300/60">THIRD-PARTY MARKET SEARCH</div><div className="mt-1 text-2xl">Ship listing finder</div></div><ShieldAlert className="text-amber-300"/></div><div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[.06] p-3 text-sm leading-relaxed text-amber-100/70"><b className="text-amber-200">Grey-market warning:</b> third-party pledge trades are not CIG/RSI-supported purchases. Verify insurance, item type, seller, escrow/refund terms and the final transfer yourself.</div><div className="mt-4 flex gap-2"><input value={marketQ} onChange={e=>setMarketQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&marketSearch()} className="flex-1 rounded-lg border border-emerald-300/15 bg-black/30 px-4 py-3 outline-none focus:border-emerald-300/45"/><label className="flex items-center gap-2 rounded-lg border border-white/7 px-3 text-sm text-white/65"><input type="checkbox" checked={lti} onChange={e=>setLti(e.target.checked)}/> LTI only</label><button onClick={marketSearch} className={`rounded-lg px-5 ${greenBtn}`}><Search/></button></div></Card>{market?.loading?<Empty>Searching public marketplace listings…</Empty>:market?.items?.length?<div className="grid grid-cols-2 gap-3">{market.items.map((x,i)=><Card key={x.url+i} className="p-4"><div className="flex items-start justify-between gap-3"><div><Badge tone={x.lti?'green':'amber'}>{x.lti?'LTI MATCH':'LISTING'}</Badge><div className="mt-3 font-medium text-white/85">{x.title}</div><div className="mt-2 text-sm text-white/45">{x.provider} • {x.price}</div></div><button onClick={()=>api.openExternal(x.url)} className="rounded-lg border border-white/8 p-2 text-emerald-300 hover:bg-white/5"><ExternalLink size={16}/></button></div></Card>)}</div>:<Empty>Deep-search public listings across Star Hangar, Space Foundry and The Impound.</Empty>}</div>,

    'Optimizer': <div className="space-y-4"><div className="grid grid-cols-12 gap-4"><Card className="col-span-7 p-5"><div className="flex justify-between"><div><div className="text-xs tracking-[.25em] text-emerald-300/60">HARDWARE TELEMETRY</div><div className="mt-1 text-2xl">Adaptive graphics profile</div></div><CircleGauge className="text-emerald-300"/></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Spec icon={Cpu} label="CPU" value={hw?.cpu}/><Spec icon={Activity} label="GPU" value={hw?.gpu}/><Spec icon={MemoryStick} label="RAM" value={hw?`${hw.ramGB} GB`:null}/><Spec icon={HardDrive} label="VRAM" value={hw?.vramGB?`${hw.vramGB} GB`:'Not reported'}/></div><div className="mt-4 flex gap-2"><button onClick={rescan} className={`rounded-lg px-4 py-2.5 text-sm ${ghostBtn}`}><RefreshCw size={14} className="mr-2 inline"/>Rescan</button><button onClick={applyOpt} className={`rounded-lg px-4 py-2.5 text-sm ${greenBtn}`}><Zap size={14} className="mr-2 inline"/>Apply safe renderer profile</button><button onClick={restoreOpt} className={`rounded-lg px-4 py-2.5 text-sm ${ghostBtn}`}><RotateCcw size={14} className="mr-2 inline"/>Restore backup</button></div></Card><Card className="col-span-5 p-5"><div className="text-xs tracking-[.25em] text-emerald-300/60">RECOMMENDATION</div><div className="mt-2"><Badge>{rec?.tier||'unknown'} profile</Badge></div><dl className="mt-5 space-y-3 text-sm"><Row k="Renderer" v={rec?.renderer}/><Row k="Upscaler" v={rec?`${rec.upscaler} • ${rec.upscalerQuality}`:null}/><Row k="Textures" v={rec?.texture}/><Row k="Clouds" v={rec?.clouds}/><Row k="Resolution" v={rec?.resolution}/></dl></Card></div><Card className="p-5"><div className="text-sm font-medium">What automatic optimisation changes</div><p className="mt-2 max-w-4xl text-sm leading-relaxed text-white/45">NekoVerse deliberately applies only conservative local settings with backups. It avoids undocumented tweak packs that can become unstable after Star Citizen patches.</p><div className="mt-3 text-xs text-white/35">Graphics file: {opt?.graphics?.file||'Not found yet'} • Install: {opt?.install?.root||'Not auto-detected'}</div></Card></div>,

    'Settings': settings?<div className="space-y-4">
      <Card className="p-5"><div className="flex justify-between"><div><div className="text-xs tracking-[.25em] text-emerald-300/60">VOICE & IDENTITY</div><div className="mt-1 text-2xl">Jarvis voice settings</div></div><Settings className="text-emerald-300"/></div><div className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-300/[.035] p-3 text-sm text-emerald-100/70">Known commands such as <b>request landing</b> work directly. Say <b>Jarvis</b> for open-ended AI/location questions; a short two-tone sound confirms activation and opens an ~8 second question window. “Jarvis, shut up” interrupts TTS immediately.</div><div className="mt-5 grid grid-cols-2 gap-4"><Field label="Wake words" placeholder="jarvis" value={(settings.wakeWords||['jarvis']).join(', ')} onChange={v=>setSettings(s=>({...s,wakeWords:v.split(',').map(x=>x.trim()).filter(Boolean)}))}/><Field label="Custom Star Citizen install path" value={settings.customInstallPath||''} onChange={v=>setSettings(s=>({...s,customInstallPath:v}))}/></div><div className="mt-4 flex gap-5 text-sm text-white/65"><Check label="Strict mode: require wake word for every voice command" value={settings.requireWakeWord} onChange={v=>setSettings(s=>({...s,requireWakeWord:v}))}/><Check label="Speak assistant replies" value={settings.speakReplies} onChange={v=>setSettings(s=>({...s,speakReplies:v}))}/></div></Card>

      <Card className="p-5"><div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><Sparkles className="text-emerald-300" size={18}/><div className="text-sm font-medium">Companion AI — native Ollama</div></div><p className="mt-1 text-xs text-white/38">No OpenAI key required. Location/item questions are augmented with live Star Citizen Wiki API search data before being sent to the selected Ollama model.</p></div><Badge>{settings.ollama?.model||'qwen2.5:3b'}</Badge></div><div className="mt-4 grid grid-cols-[1fr_auto] gap-3"><Field label="Ollama server" value={settings.ollama?.baseUrl||'https://ollama.nekosunevr.co.uk'} onChange={v=>setSettings(s=>({...s,ollama:{...s.ollama,baseUrl:v}}))}/><button onClick={scanOllama} disabled={ollamaBusy} className={`self-end rounded-lg px-4 py-2.5 text-sm ${greenBtn}`}><RefreshCw size={14} className={`mr-2 inline ${ollamaBusy?'animate-spin':''}`}/>{ollamaBusy?'Scanning…':'Scan models'}</button></div><div className="mt-4"><label className="block"><span className="mb-1.5 block text-xs text-white/40">Assistant model</span><select value={settings.ollama?.model||'qwen2.5:3b'} onChange={e=>setSettings(s=>({...s,ollama:{...s.ollama,model:e.target.value}}))} className="w-full rounded-lg border border-emerald-300/15 bg-[#08110d] px-3 py-2.5 text-sm outline-none focus:border-emerald-300/45"><option value={settings.ollama?.model||'qwen2.5:3b'}>{settings.ollama?.model||'qwen2.5:3b'} {ollamaModels.length?'(current)':'(default)'}</option>{ollamaModels.filter(m=>m.model!==(settings.ollama?.model||'qwen2.5:3b')).map(m=><option key={m.digest||m.model} value={m.model} disabled={!m.canChat}>{m.model} • {m.details?.parameter_size||'?'} • {m.details?.quantization_level||'remote'}{!m.canChat?' • embedding only':''}</option>)}</select></label></div>{ollamaModels.length>0&&<div className="mt-4 grid grid-cols-2 gap-2">{ollamaModels.map(m=><div key={m.digest||m.model} className={`rounded-lg border p-3 text-xs ${m.canChat?'border-emerald-300/10 bg-emerald-300/[.025]':'border-white/6 bg-white/[.015] opacity-55'}`}><div className="font-medium text-white/75">{m.model}</div><div className="mt-1 text-white/35">{m.details?.parameter_size||'Unknown size'} • {m.details?.quantization_level||'remote'} • {humanSize(m.size)}</div><div className="mt-1 text-emerald-300/50">{(m.capabilities||[]).join(' • ')||'capabilities not reported'}</div></div>)}</div>}</Card>

      <Card className="p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-medium">Updates</div><div className="mt-1 text-xs text-white/38">Current app version: v{boot?.appVersion||'—'}. The desktop app checks the latest public GitHub Release at startup and every 5 minutes while running.</div></div><button onClick={checkUpdate} className={`rounded-lg px-4 py-2.5 text-sm ${ghostBtn}`}><RefreshCw size={14} className="mr-2 inline"/>Check now</button></div></Card>

      <Card className="p-5"><div className="text-sm font-medium">Star Citizen voice / hotkey commands</div><p className="mt-1 text-xs text-white/38">Everything is editable. Blank disables a command. Hold actions such as Rescue Beacon expose their hold duration too.</p><div className="mt-5 space-y-5">{Object.entries(commandGroups).map(([category,items])=><div key={category}><div className="mb-2 text-xs font-medium uppercase tracking-[.2em] text-emerald-300/55">{category}</div><div className="grid grid-cols-2 gap-3">{items.map(([k,v])=><div key={k} className="rounded-lg border border-white/6 bg-black/15 p-3"><Field label={v.label} value={v.combo||''} onChange={value=>setSettings(s=>({...s,commands:{...s.commands,[k]:{...s.commands[k],combo:value}}}))}/>{v.mode==='hold'&&<div className="mt-2"><Field type="number" label="Hold duration (ms)" value={v.holdMs||700} onChange={value=>setSettings(s=>({...s,commands:{...s.commands,[k]:{...s.commands[k],holdMs:Number(value)||700}}}))}/></div>}</div>)}</div></div>)}</div></Card>
      <button onClick={save} className={`rounded-lg px-5 py-3 ${greenBtn}`}><Save size={15} className="mr-2 inline"/>Save all settings</button>
    </div>:<Empty>Settings are loading…</Empty>
  }[page];

  const showUpdate=updateInfo?.available && updateDismissed!==updateInfo.latestVersion;

  return <div className="flex h-screen text-white"><aside className="w-[245px] shrink-0 border-r border-emerald-300/10 bg-[#050b08]/90 p-4 backdrop-blur-xl"><div className="mb-7 flex items-center gap-3 px-2 py-3"><div className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-300/30 bg-emerald-300/10"><Zap className="text-emerald-300" size={20}/></div><div><div className="font-semibold tracking-wide">NekoVerse</div><div className="text-[10px] tracking-[.24em] text-emerald-300/55">COMPANION</div></div></div><nav className="space-y-1">{nav.map(([n,I])=><button key={n} onClick={()=>setPage(n)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${page===n?'border border-emerald-300/20 bg-emerald-300/10 text-emerald-100':'border border-transparent text-white/46 hover:bg-white/[.03] hover:text-white/75'}`}><I size={17}/>{n}</button>)}</nav><div className="absolute bottom-5 left-5 w-[205px] rounded-lg border border-white/6 bg-white/[.018] p-3"><div className="flex items-center gap-2 text-xs text-white/55"><Info size={13} className="text-emerald-300"/> Created by NekoSuneVR</div><div className="mt-1.5 text-[10px] leading-relaxed text-white/28">v{boot?.appVersion||'—'} • Unofficial community companion.</div></div></aside><main className="min-w-0 flex-1 overflow-auto"><header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-emerald-300/10 bg-[#06100b]/85 px-7 backdrop-blur-xl"><div><div className="text-[10px] tracking-[.28em] text-emerald-300/55">NVS // {page.toUpperCase()}</div><div className="mt-1 text-sm text-white/40">STAR CITIZEN COMPANION NETWORK</div></div><div className="flex items-center gap-2">{voiceOn&&<Badge>{wakeActive?'JARVIS ACTIVE':'MIC ONLINE'}</Badge>}<Badge tone={status?.stale?'amber':'green'}>{status?.stale?'cached':'network online'}</Badge><Badge>{status?.live?`LIVE ${status.live}`:'LIVE —'}</Badge></div></header><div className="p-6">{!hasDesktopBridge()?<Card className="mb-4 p-4 text-sm text-amber-100/70">Browser preview detected. Desktop-only hardware, voice and hotkey functions require Electron.</Card>:null}{busy?<Empty>Booting companion systems…</Empty>:content}</div></main>{showUpdate&&<div className="fixed bottom-5 right-5 z-[60] w-[390px] rounded-xl border border-emerald-300/30 bg-[#091710]/98 p-4 shadow-2xl backdrop-blur-xl"><div className="flex items-start justify-between gap-3"><div><div className="text-xs tracking-[.2em] text-emerald-300/70">UPDATE AVAILABLE</div><div className="mt-1 text-lg text-white">NekoVerse Companion v{updateInfo.latestVersion}</div><div className="mt-1 text-sm text-white/48">You are running v{updateInfo.currentVersion}. Click below to open the newest GitHub Release and update.</div></div><button onClick={()=>setUpdateDismissed(updateInfo.latestVersion)} className="text-white/35 hover:text-white">×</button></div><button onClick={()=>api.openExternal(updateInfo.url)} className={`mt-4 w-full rounded-lg px-4 py-3 ${greenBtn}`}><ExternalLink size={15} className="mr-2 inline"/>Open update v{updateInfo.latestVersion}</button></div>}{toast&&<div className={`fixed right-5 z-50 max-w-lg rounded-lg border border-emerald-300/20 bg-[#091710]/95 px-4 py-3 text-sm text-emerald-50 shadow-2xl backdrop-blur-xl ${showUpdate?'bottom-[190px]':'bottom-5'}`}>{toast}</div>}</div>;
}

function NewsPage({boot,setBoot,notice}){
  const news=boot?.news;
  async function refresh(){const n=await api.refreshNews();setBoot(b=>({...b,news:n}));notice('News feed refreshed');}
  return <div className="space-y-4"><Card className="flex items-center justify-between p-5"><div><div className="text-xs tracking-[.25em] text-emerald-300/60">COMM-LINK FEED</div><div className="mt-1 text-2xl">Latest Star Citizen news</div><div className="mt-1 text-xs text-white/35">{news?.source||'RSI archive adapter'}</div></div><button onClick={refresh} className={`rounded-lg px-3.5 py-2 text-sm ${ghostBtn}`}><RefreshCw size={14} className="mr-2 inline"/>Refresh</button></Card><div className="grid grid-cols-2 gap-3">{news?.items?.map((n,i)=><Card className="p-4" key={n.id||i}><div className="text-xs text-emerald-300/55">{n.published?new Date(n.published).toLocaleDateString():'OFFICIAL FEED'}</div><div className="mt-2 text-lg text-white/85">{n.title}</div>{n.excerpt&&<div className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/42">{n.excerpt}</div>}<div className="mt-3 text-sm"><Open url={n.url}>Read source</Open></div></Card>)}</div></div>;
}
