const CREATOR = 'NekoSuneVR';
const { commandCatalog, detectCommandIntent, commandLabel } = require('./commands.cjs');
const { detectLocalizedCommandIntent } = require('./command-locales.cjs');
const { combatExtraCatalog, detectCombatExtraIntent, combatExtraLabel } = require('./combat-extra.cjs');
const ollama = require('./ollama.cjs');
const wiki = require('./wiki.cjs');

const LANGUAGE_NAMES = {
  'en-GB':'British English','en-US':'English','es-ES':'Spanish','de-DE':'German','pl-PL':'Polish','ru-RU':'Russian','fr-FR':'French','it-IT':'Italian','pt-PT':'European Portuguese','pt-BR':'Brazilian Portuguese'
};
const LOCAL_TEXT = {
  'en-GB':{command:'Command understood.',creator:`NekoVerse Companion was created by ${CREATOR}.`,busy:'Open Optimizer and run a hardware scan first.'},
  'es-ES':{command:'Comando reconocido.',creator:`NekoVerse Companion fue creado por ${CREATOR}.`,busy:'Abre el Optimizador y ejecuta primero un análisis del hardware.'},
  'de-DE':{command:'Befehl erkannt.',creator:`NekoVerse Companion wurde von ${CREATOR} erstellt.`,busy:'Öffne den Optimierer und führe zuerst einen Hardware-Scan aus.'},
  'pl-PL':{command:'Polecenie rozpoznane.',creator:`NekoVerse Companion został stworzony przez ${CREATOR}.`,busy:'Otwórz Optymalizator i najpierw uruchom skan sprzętu.'},
  'ru-RU':{command:'Команда распознана.',creator:`NekoVerse Companion создан ${CREATOR}.`,busy:'Откройте Оптимизатор и сначала запустите сканирование оборудования.'},
  'fr-FR':{command:'Commande reconnue.',creator:`NekoVerse Companion a été créé par ${CREATOR}.`,busy:'Ouvrez l’Optimiseur et lancez d’abord une analyse du matériel.'},
  'it-IT':{command:'Comando riconosciuto.',creator:`NekoVerse Companion è stato creato da ${CREATOR}.`,busy:'Apri l’Ottimizzatore ed esegui prima una scansione hardware.'},
  'pt-PT':{command:'Comando reconhecido.',creator:`NekoVerse Companion foi criado por ${CREATOR}.`,busy:'Abra o Otimizador e execute primeiro uma análise do hardware.'}
};
function lt(settings,key){const lang=settings?.language||'en-GB';return LOCAL_TEXT[lang]?.[key]||LOCAL_TEXT['en-GB'][key];}

function detectIntent(text){
  // Exact one-shot targeting/fire/quantum aliases take priority over broader
  // legacy patterns such as "quantum jump" or generic targeting phrases.
  const command=detectCombatExtraIntent(text)||detectCommandIntent(text)||detectLocalizedCommandIntent(text);
  if(command)return command;
  if(/who (made|created|built) (you|this|the tool)|who is (the )?creator/i.test(text))return'creator';
  if(/optimi[sz]e|performance profile|my hardware/i.test(text))return'optimizer';
  if(/what (commands|can you do)|show commands|command list|voice commands/i.test(text))return'commands_help';
  return'chat';
}

function localReply(message,optimizer,settings){
  const intent=detectIntent(message);
  if(intent==='creator')return{intent,text:lt(settings,'creator')};
  if(intent==='optimizer')return{intent,text:optimizer?`${lt(settings,'command')} ${optimizer.tier}: ${optimizer.renderer}; ${optimizer.upscaler}; ${optimizer.texture}.`:lt(settings,'busy')};
  if(intent==='commands_help'){
    const categories=[...new Set([...Object.values(commandCatalog),...Object.values(combatExtraCatalog)].map(c=>c.category))];
    return{intent,text:`${lt(settings,'command')} ${categories.join(', ')}.`};
  }
  if(intent!=='chat')return{intent,text:`${lt(settings,'command')} ${combatExtraLabel(intent)||commandLabel(intent)}.`};
  return{intent,text:`NekoVerse Companion — ${CREATOR}.`};
}

function systemPrompt(context,settings){
  const available=[...Object.entries(commandCatalog),...Object.entries(combatExtraCatalog)].map(([id,c])=>`${id}:${c.label}`).join(', ');
  const locale=settings?.language||'en-GB';
  const language=LANGUAGE_NAMES[locale]||'English';
  return `You are NekoVerse Companion, an unofficial Star Citizen desktop assistant created by NekoSuneVR. Always answer in ${language} unless the user explicitly asks for another language. Be concise, practical, friendly, and especially helpful to new players. The user may ask where a city, station, shop, item, commodity or ore is located, where to buy/sell something, or where to mine/refine it. When Verse Guide data is present in Current local context, treat that Star Citizen Wiki API data as your factual grounding and explain the route/location in simple steps. If the guide data does not contain an exact match, do not invent a location: say you could not verify the exact term and suggest checking the spelling or using the Verse Guide search. Mention relevant planet/moon/system, shop/terminal, mining body or landing-zone district when the supplied data supports it. The desktop app can only control the game when the user explicitly speaks or types a supported command that maps to a configured one-shot hotkey or configured hold action. Combat actions are limited to explicit single inputs such as selecting/locking a target, changing a mode, deploying a countermeasure, or firing once. Never create sustained/timed rapid-fire loops, automatic target-following, autonomous combat, aim/recoil assistance, unattended navigation/play, exploit instructions, memory/process injection, packet manipulation, or anti-cheat bypasses. Supported command slots: ${available.slice(0,7500)}. Current local context: ${JSON.stringify(context||{}).slice(0,14000)}`;
}

async function ollamaReply(message,settings,context){
  const config=settings?.ollama||{};
  return ollama.chat({baseUrl:config.baseUrl||ollama.DEFAULT_BASE_URL,model:config.model||ollama.DEFAULT_MODEL,messages:[{role:'system',content:systemPrompt(context,settings)},{role:'user',content:message}]});
}

async function ask(message,settings,context){
  const local=localReply(message,context?.optimizer,settings);
  if(local.intent!=='chat')return local;
  let verseGuide=null;
  try{verseGuide=await wiki.getAssistantKnowledge(message,settings?.language);}catch(error){verseGuide={ok:false,items:[],error:error.message};}
  try{
    const result=await ollamaReply(message,settings,{...(context||{}),verseGuide});
    return{...local,text:result.content||local.text,ollama:true,model:result.model,verseGuide:verseGuide?.items?.length?{query:verseGuide.query,source:verseGuide.source,items:verseGuide.items.map(item=>({name:item.name,type:item.type,sourceUrl:item.sourceUrl}))}:null};
  }catch(e){
    return{...local,warning:`Ollama endpoint unavailable: ${e.message}`,text:local.text,verseGuide};
  }
}

module.exports={ask,detectIntent,CREATOR,LANGUAGE_NAMES};
