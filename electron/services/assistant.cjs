const CREATOR = 'NekoSuneVR';
const { commandCatalog, detectCommandIntent, commandLabel } = require('./commands.cjs');
const ollama = require('./ollama.cjs');

function detectIntent(text) {
  const command = detectCommandIntent(text);
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
  return { intent, text: `I’m the NekoVerse flight companion created by ${CREATOR}. Ask me about Star Citizen, flight, ground vehicles, ship systems, medical/SOS, performance, or current game status.` };
}

function systemPrompt(context) {
  const available = Object.entries(commandCatalog).map(([id, c]) => `${id}:${c.label}`).join(', ');
  return `You are NekoVerse Companion, an unofficial Star Citizen desktop assistant created by NekoSuneVR. Be concise, practical, friendly, and focused on Star Citizen. The desktop app can only control the game when the user explicitly speaks or types a supported command that maps to a configured one-shot hotkey or configured hold action. Never claim autonomous control. Do not provide cheats, aim/recoil assistance, unattended navigation/play, exploit instructions, memory/process injection, packet manipulation, or anti-cheat bypasses. Supported command slots: ${available.slice(0,6500)}. Current local context: ${JSON.stringify(context || {}).slice(0,3000)}`;
}

async function ollamaReply(message, settings, context) {
  const config = settings?.ollama || {};
  const result = await ollama.chat({
    baseUrl: config.baseUrl || ollama.DEFAULT_BASE_URL,
    model: config.model || ollama.DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt(context) },
      { role: 'user', content: message }
    ]
  });
  return result;
}

async function ask(message, settings, context) {
  const local = localReply(message, context?.optimizer);
  if (local.intent !== 'chat') return local;
  try {
    const result = await ollamaReply(message, settings, context);
    return {
      ...local,
      text: result.content || local.text,
      ollama: true,
      model: result.model
    };
  } catch (e) {
    return {
      ...local,
      warning: `Ollama endpoint unavailable: ${e.message}`,
      text: `${local.text} The configured Ollama assistant is currently unavailable.`
    };
  }
}

module.exports = { ask, detectIntent, CREATOR };
