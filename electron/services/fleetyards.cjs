const API = 'https://api.fleetyards.net/v1';

async function json(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'NekoVerse-Companion/0.1' } });
    if (!r.ok) throw new Error(`FleetYards HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(timer); }
}

function normalizeSlugs(payload) {
  if (Array.isArray(payload)) return payload.map(x => typeof x === 'string' ? x : x.slug).filter(Boolean);
  for (const k of ['data', 'slugs', 'models']) if (Array.isArray(payload?.[k])) return normalizeSlugs(payload[k]);
  return [];
}

function normalizeModel(m) {
  m = m?.data || m || {};
  return {
    slug: m.slug || m.id,
    name: m.name || m.fullName || m.slug || 'Unknown ship',
    manufacturer: m.manufacturer?.name || m.manufacturer?.shortName || m.manufacturer || 'Unknown',
    focus: m.focus || m.role || m.classification || '—',
    size: m.size || m.sizeLabel || '—',
    crew: m.crew?.max || m.maxCrew || m.crew || '—',
    cargo: m.cargo || m.cargoCapacity || m.scu || '—',
    productionStatus: m.productionStatus || m.production_status || '—',
    image: m.media?.storeImage || m.media?.gallery?.[0]?.source || m.storeImage || null,
    url: m.slug ? `https://fleetyards.net/models/${m.slug}` : 'https://fleetyards.net/'
  };
}

async function searchModels(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return { items: [], source: 'FleetYards' };
  try {
    const slugsPayload = await json(`${API}/models/slugs`);
    const slugs = normalizeSlugs(slugsPayload).filter(s => s.toLowerCase().includes(q)).slice(0, 10);
    const settled = await Promise.allSettled(slugs.map(slug => json(`${API}/models/${encodeURIComponent(slug)}`)));
    const items = settled.filter(x => x.status === 'fulfilled').map(x => normalizeModel(x.value));
    return { items, source: 'FleetYards API', error: items.length ? null : 'No matching ship models.' };
  } catch (error) {
    return { items: [], source: 'FleetYards API', error: error.message };
  }
}

module.exports = { searchModels, API };
