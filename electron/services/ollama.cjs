const DEFAULT_BASE_URL = 'https://ollama.nekosunevr.co.uk';
const DEFAULT_MODEL = 'qwen2.5:3b';

function normalizeBaseUrl(value) {
  const raw = String(value || DEFAULT_BASE_URL).trim();
  return raw.replace(/\/+$/, '');
}

async function fetchJson(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function listModels(baseUrl = DEFAULT_BASE_URL) {
  const base = normalizeBaseUrl(baseUrl);
  const body = await fetchJson(`${base}/api/tags`, { headers: { Accept: 'application/json' } }, 15000);
  const models = Array.isArray(body?.models) ? body.models : [];
  return {
    baseUrl: base,
    models: models.map(model => ({
      name: model.name || model.model,
      model: model.model || model.name,
      modifiedAt: model.modified_at || null,
      size: Number(model.size || 0),
      digest: model.digest || '',
      details: model.details || {},
      capabilities: Array.isArray(model.capabilities) ? model.capabilities : [],
      remoteModel: model.remote_model || null,
      remoteHost: model.remote_host || null,
      canChat: Array.isArray(model.capabilities)
        ? model.capabilities.includes('completion')
        : true
    })).filter(model => model.name)
  };
}

async function chat({ baseUrl = DEFAULT_BASE_URL, model = DEFAULT_MODEL, messages = [], options = {} }) {
  const base = normalizeBaseUrl(baseUrl);
  const selectedModel = String(model || DEFAULT_MODEL).trim();
  if (!selectedModel) throw new Error('No Ollama model selected.');

  const body = await fetchJson(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      stream: false,
      think: false,
      keep_alive: '10m',
      options: {
        temperature: 0.4,
        num_predict: 320,
        ...options
      }
    })
  }, 90000);

  return {
    model: body?.model || selectedModel,
    content: body?.message?.content || '',
    done: Boolean(body?.done),
    doneReason: body?.done_reason || null,
    totalDuration: body?.total_duration || null,
    evalCount: body?.eval_count || null
  };
}

module.exports = { DEFAULT_BASE_URL, DEFAULT_MODEL, normalizeBaseUrl, listModels, chat };
