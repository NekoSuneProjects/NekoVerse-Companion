const CREATOR = 'NekoSuneVR';

const aliases = {
  request_landing: [/request (a )?landing/i, /landing permission/i, /call (atc|landing)/i, /contact atc/i],
  landing_gear: [/landing gear/i, /gear (down|up)/i],
  lights: [/(ship )?lights/i, /toggle lights/i],
  doors: [/(open|close|toggle) (the )?(ship )?doors/i],
  quantum: [/quantum (drive|mode)/i]
};

function detectIntent(text) {
  for (const [intent, patterns] of Object.entries(aliases)) if (patterns.some(r => r.test(text))) return intent;
  if (/who (made|created|built) (you|this|the tool)|who is (the )?creator/i.test(text)) return 'creator';
  if (/optimi[sz]e|performance profile|my hardware/i.test(text)) return 'optimizer';
  return 'chat';
}

function localReply(message, optimizer) {
  const intent = detectIntent(message);
  if (intent === 'creator') return { intent, text: `NekoVerse Companion was created by ${CREATOR}.` };
  if (intent === 'optimizer') return { intent, text: optimizer ? `Your detected ${optimizer.tier} profile recommends ${optimizer.renderer}, ${optimizer.upscaler}, and ${optimizer.texture} textures.` : 'Open Optimizer and run a hardware scan first.' };
  if (intent !== 'chat') return { intent, text: `Command understood: ${intent.replaceAll('_',' ')}. I can send its configured hotkey when Star Citizen is focused.` };
  return { intent, text: `I’m the NekoVerse flight companion created by ${CREATOR}. Ask me about your ship tools, performance profile, current game status, or say “request landing”.` };
}

async function cloudReply(message, settings, context) {
  const ai = settings?.ai || {};
  if (!ai.enabled || !ai.baseUrl || !ai.model) return null;
  const base = String(ai.baseUrl).replace(/\/$/, '');
  const headers = { 'Content-Type':'application/json' };
  if (ai.apiKey) headers.Authorization = `Bearer ${ai.apiKey}`;
  const system = `You are the NekoVerse Companion for Star Citizen. The tool creator is NekoSuneVR. Be concise, practical and never claim to control the game unless a configured one-shot hotkey is available. Do not provide cheats, combat automation, aim assistance, unattended play, exploit instructions, or anti-cheat bypasses. Current context: ${JSON.stringify(context).slice(0,3000)}`;
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
