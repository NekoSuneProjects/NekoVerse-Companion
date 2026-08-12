const CREATOR = 'NekoSuneVR';
const { commandCatalog, detectCommandIntent, commandLabel } = require('./commands.cjs');
const { detectLocalizedCommandIntent } = require('./command-locales.cjs');
const ollama = require('./ollama.cjs');
const wiki = require('./wiki.cjs');

const LANGUAGE_NAMES = {
  'en-GB':'British English', 'en-US':'English', 'es-ES':'Spanish', 'de-DE':'German',
  'pl-PL':'Polish', 'ru-RU':'Russian', 'fr-FR':'French', 'it-IT':'Italian',
  'pt-PT':'European Portuguese', 'pt-BR':'Brazilian Portuguese'
};

function detectIntent(text) {
  const command = detectCommandIntent(text) || detectLocalizedCommandIntent(text);
  if (command) return command;
  if (/who (made|created|built) (you|this|the tool)|who is (the )?creator/i.test(text)) return 'creator';
  if (/optimi[sz]e|performance profile|my hardware/i.test(text)) return 'optimizer';
  if (/what (commands|can you do)|show commands|command list|voice commands/i.test(text)) return 'commands_help';
  return 'chat';
}

function localReply(message, optimizer) {
  const intent = detectIntent(message);
  if (intent === 'creator') return { intent, text: `NekoVerse Companion was created by ${CREATOR}.` };
  if (intent === 'optimizer') return { intent, text: optimizer ? `Your detected ${optimizer.tier} profile recommends ${optimizer.renderer}, ${optimizer.upscaler}, and ${optimizer.texture} textures.` : 'Open Optimizer and run a hardware scan first.' };
  if (intent === 'commands_help') {
    const categories = [...new Set(Object.values(commandCatalog).map(c => c.category))];
    return { intent, text: `I support configurable voice controls across ${categories.join(', ')}. Open Settings to bind the commands to your Star Citizen controls.` };
  }
  if (intent !== 'chat') return { intent, text: `Command understood: ${commandLabel(intent)}. I can send its configured hotkey when Star Citizen is focused.` };
  return { intent, text: `I’m the NekoVerse flight companion created by ${CREATOR}. Ask me about Star Citizen locations, items, mining, shops, ships, flight, ground vehicles, medical/SOS, performance, or current game status.` };
}

function systemPrompt(context, settings) {
  const available = Object.entries(commandCatalog).map(([id, c]) => `${id}:${c.label}`).join(', ');
  const locale = settings?.language || 'en-GB';
  const language = LANGUAGE_NAMES[locale] || 'English';
  return `You are NekoVerse Companion, an unofficial Star Citizen desktop assistant created by NekoSuneVR. Always answer in ${language} unless the user explicitly asks for another language. Be concise, practical, friendly, and especially helpful to new players. The user may ask where a city, station, shop, item, commodity or ore is located, where to buy/sell something, or where to mine/refine it. When Verse Guide data is present in Current local context, treat that Star Citizen Wiki API data as your factual grounding and explain the route/location in simple steps. If the guide data does not contain an exact match, do not invent a location: say you could not verify the exact term and suggest checking the spelling or using the Verse Guide search. Mention relevant planet/moon/system, shop/terminal, mining body or landing-zone district when the supplied data supports it. The desktop app can only control the game when the user explicitly speaks or types a supported command that maps to a configured one-shot hotkey or configured hold action. Never claim autonomous control. Do not provide cheats, aim/recoil assistance, unattended navigation/play, exploit instructions, memory/process injection, packet manipulation, or anti-cheat bypasses. Supported command slots: ${available.slice(0,6500)}. Current local context: ${JSON.stringify(context || {}).slice(0,14000)}`;
}

async function ollamaReply(message, settings, context) {
  const config = settings?.ollama || {};
  const result = await ollama.chat({
    baseUrl: config.baseUrl || ollama.DEFAULT_BASE_URL,
    model: config.model || ollama.DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt(context, settings) },
      { role: 'user', content: message }
    ]
  });
  return result;
}

async function ask(message, settings, context) {
  const local = localReply(message, context?.optimizer);
  if (local.intent !== 'chat') return local;

  let verseGuide = null;
  try { verseGuide = await wiki.getAssistantKnowledge(message, settings?.language); }
  catch (error) { verseGuide = { ok:false, items:[], error:error.message }; }

  try {
    const result = await ollamaReply(message, settings, { ...(context || {}), verseGuide });
    return {
      ...local,
      text: result.content || local.text,
      ollama: true,
      model: result.model,
      verseGuide: verseGuide?.items?.length ? {
        query: verseGuide.query,
        source: verseGuide.source,
        items: verseGuide.items.map(item => ({ name:item.name, type:item.type, sourceUrl:item.sourceUrl }))
      } : null
    };
  } catch (e) {
    const guideHint = verseGuide?.items?.length
      ? ` I found ${verseGuide.items.length} matching Verse Guide result${verseGuide.items.length === 1 ? '' : 's'}, but the configured Ollama assistant is unavailable to summarize them.`
      : '';
    return { ...local, warning:`Ollama endpoint unavailable: ${e.message}`, text:`${local.text}${guideHint}`, verseGuide };
  }
}

module.exports = { ask, detectIntent, CREATOR, LANGUAGE_NAMES };
