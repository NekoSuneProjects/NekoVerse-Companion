const CREATOR = 'NekoSuneVR';
const { commandCatalog, detectCommandIntent, commandLabel } = require('./commands.cjs');

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
    return { intent, text: `I support configurable one-shot voice controls across ${categories.join(', ')}. Open Settings to bind the commands to your Star Citizen controls.` };
  }
  if (intent !== 'chat') return { intent, text: `Command understood: ${commandLabel(intent)}. I can send its configured hotkey when Star Citizen is focused.` };
  return { intent, text: `I’m the NekoVerse flight companion created by ${CREATOR}. Ask me about flight, ground vehicles, ship systems, medical/SOS, your performance profile, current game status, or say “request landing”.` };
}

async function cloudReply(message, settings, context) {
  const ai = settings?.ai || {};
  if (!ai.enabled || !ai.baseUrl || !ai.model) return null;
  const base = String(ai.baseUrl).replace(/\/$/, '');
  const headers = { 'Content-Type':'application/json' };
  if (ai.apiKey) headers.Authorization = `Bearer ${ai.apiKey}`;
  const available = Object.entries(commandCatalog).map(([id, c]) => `${id}:${c.label}`).join(', ');
  const system = `You are the NekoVerse Companion for Star Citizen. The tool creator is NekoSuneVR. Be concise and practical. The app can only control the game when the user explicitly speaks/types a supported command that maps to a configured one-shot hotkey or configured hold action. Never claim autonomous control. Do not provide cheats, aim/recoil assistance, unattended navigation/play, exploit instructions, memory/process injection, packet manipulation, or anti-cheat bypasses. Supported command slots: ${available.slice(0,6500)}. Current context: ${JSON.stringify(context).slice(0,3000)}`;
  const r = await fetch(`${base}/chat/completions`, { method:'POST', headers, body: JSON.stringify({ model: ai.model, temperature:0.4, messages:[{role:'system',content:system},{role:'user',content:message}] }) });
  if (!r.ok) throw new Error(`AI endpoint HTTP ${r.status}`);
  const body = await r.json();
  return body?.choices?.[0]?.message?.content || null;
}

async function ask(message, settings, context) {
  const local = localReply(message, context?.optimizer);
  if (local.intent !== 'chat') return local;
  try {
    const cloud = await cloudReply(message, settings, context);
    return { ...local, text: cloud || local.text, cloud: Boolean(cloud) };
  } catch (e) { return { ...local, warning: `AI endpoint unavailable: ${e.message}` }; }
}

module.exports = { ask, detectIntent, CREATOR };
