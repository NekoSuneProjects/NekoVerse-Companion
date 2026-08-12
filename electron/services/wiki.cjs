const API_BASE = 'https://api.star-citizen.wiki/api';
const WIKI_SEARCH_URL = 'https://starcitizen.tools/index.php?search=';

const RESOURCE_ENDPOINTS = {
  location: 'locations',
  locations: 'locations',
  item: 'items',
  items: 'items',
  commodity: 'commodities',
  commodities: 'commodities',
  vehicle: 'vehicles',
  vehicles: 'vehicles',
  mission: 'missions',
  missions: 'missions'
};

function normalizeList(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.results)) return body.results;
  if (Array.isArray(body?.items)) return body.items;
  if (body?.data && typeof body.data === 'object') return [body.data];
  return [];
}

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'NekoVerse-Companion/0.1.1'
      }
    });
    if (!response.ok) throw new Error(`Star Citizen Wiki API HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function pickName(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.name || value.label || value.display_name || value.displayName || value.code || null;
}

function compactArray(value, limit = 8) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, limit).map(item => {
    if (typeof item === 'string') return item;
    return item?.name || item?.label || item?.display_name || item?.location?.name || item?.terminal?.name || null;
  }).filter(Boolean);
}

function inferType(resource, fallback = 'resource') {
  const raw = String(
    resource?.resource_type || resource?.resourceType || resource?.type || resource?.kind || fallback
  ).toLowerCase();
  if (raw.includes('location')) return 'location';
  if (raw.includes('commodity')) return 'commodity';
  if (raw.includes('vehicle') || raw.includes('ship')) return 'vehicle';
  if (raw.includes('mission')) return 'mission';
  if (raw.includes('item') || raw.includes('weapon') || raw.includes('armor') || raw.includes('component')) return 'item';
  return fallback;
}

function normalizeResource(resource, fallbackType = 'resource') {
  const type = inferType(resource, fallbackType);
  const name = resource?.name || resource?.title || resource?.display_name || resource?.displayName || resource?.label || resource?.identifier || 'Unknown resource';
  const identifier = resource?.slug || resource?.identifier || resource?.uuid || resource?.id || null;
  const description = resource?.description || resource?.short_description || resource?.shortDescription || resource?.summary || null;
  const parent = pickName(resource?.parent) || pickName(resource?.location) || pickName(resource?.planet) || null;
  const system = pickName(resource?.system) || pickName(resource?.star_system) || pickName(resource?.starSystem) || null;
  const manufacturer = pickName(resource?.manufacturer);
  const version = resource?.version || resource?.game_version || resource?.gameVersion || null;

  const amenities = compactArray(resource?.amenities || resource?.services || resource?.features, 12);
  const shops = compactArray(resource?.shops || resource?.shop_locations || resource?.shopLocations, 12);
  const locations = compactArray(resource?.locations || resource?.location_data || resource?.locationData, 12);
  const prices = compactArray(resource?.market_prices || resource?.marketPrices || resource?.prices, 12);

  const raw = JSON.stringify(resource, (key, value) => {
    if (typeof value === 'string' && value.length > 800) return `${value.slice(0, 800)}…`;
    return value;
  }).slice(0, 6500);

  return {
    type,
    name,
    identifier,
    description,
    parent,
    system,
    manufacturer,
    version,
    classification: resource?.classification_label || resource?.classification || resource?.sub_type_label || resource?.subType || null,
    amenities,
    shops,
    locations,
    prices,
    sourceUrl: `${WIKI_SEARCH_URL}${encodeURIComponent(name)}`,
    raw
  };
}

function hitType(hit) {
  return String(hit?.resource_type || hit?.resourceType || hit?.type || hit?.kind || '').toLowerCase();
}

function hitIdentifier(hit) {
  return hit?.identifier || hit?.slug || hit?.uuid || hit?.id || hit?.resource?.identifier || hit?.resource?.slug || hit?.resource?.uuid || null;
}

async function expandHit(hit) {
  const type = hitType(hit);
  const endpoint = RESOURCE_ENDPOINTS[type] || RESOURCE_ENDPOINTS[inferType(hit, type)];
  const id = hitIdentifier(hit);
  if (!endpoint || !id) return normalizeResource(hit, inferType(hit));

  try {
    const body = await fetchJson(`${API_BASE}/${endpoint}/${encodeURIComponent(id)}`);
    const record = body?.data || body;
    return normalizeResource(record, endpoint.replace(/s$/, ''));
  } catch {
    return normalizeResource(hit, endpoint.replace(/s$/, ''));
  }
}

async function genericSearch(query) {
  const variants = [
    `${API_BASE}/search/${encodeURIComponent(query)}`,
    `${API_BASE}/search?query=${encodeURIComponent(query)}`
  ];

  for (const url of variants) {
    try {
      const body = await fetchJson(url);
      const hits = normalizeList(body);
      if (hits.length) return hits;
    } catch {}
  }
  return [];
}

async function filteredSearch(query) {
  const endpoints = ['locations', 'commodities', 'items', 'vehicles', 'missions'];
  const results = [];

  // Run these sequentially to stay friendly to the public API and avoid bursts.
  for (const endpoint of endpoints) {
    try {
      const url = `${API_BASE}/${endpoint}?filter%5Bname%5D=${encodeURIComponent(query)}`;
      const body = await fetchJson(url);
      for (const resource of normalizeList(body).slice(0, 4)) {
        results.push(normalizeResource(resource, endpoint.replace(/s$/, '')));
      }
      if (results.length >= 10) break;
    } catch {}
  }
  return results;
}

async function searchVerse(query) {
  const clean = String(query || '').trim();
  if (!clean) return { ok:false, query:clean, items:[], error:'Enter an item, ore, ship, mission, city, moon, station or other Star Citizen term.' };

  try {
    const hits = await genericSearch(clean);
    const expanded = [];
    for (const hit of hits.slice(0, 8)) expanded.push(await expandHit(hit));

    const fallback = expanded.length ? [] : await filteredSearch(clean);
    const combined = [...expanded, ...fallback];
    const seen = new Set();
    const items = combined.filter(item => {
      const key = `${item.type}:${String(item.identifier || item.name).toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 12);

    return {
      ok:true,
      query:clean,
      source:'Star Citizen Wiki API',
      credit:'api.star-citizen.wiki / starcitizen.tools',
      items,
      fallbackUrl:`${WIKI_SEARCH_URL}${encodeURIComponent(clean)}`
    };
  } catch (error) {
    return {
      ok:false,
      query:clean,
      source:'Star Citizen Wiki API',
      items:[],
      fallbackUrl:`${WIKI_SEARCH_URL}${encodeURIComponent(clean)}`,
      error:error.message
    };
  }
}

function looksLikeGuideQuestion(text) {
  return /\b(where|find|located|location|buy|sell|shop|store|mine|mining|ore|refine|refinery|city|planet|moon|station|landing zone|what is|how do i get|how to get|which place|which moon|which planet)\b/i.test(String(text || ''));
}

async function getAssistantKnowledge(message) {
  if (!looksLikeGuideQuestion(message)) return null;
  const result = await searchVerse(message);
  if (!result.ok || !result.items.length) return result;
  return {
    ...result,
    items: result.items.slice(0, 6).map(item => ({
      type:item.type,
      name:item.name,
      description:item.description,
      parent:item.parent,
      system:item.system,
      manufacturer:item.manufacturer,
      classification:item.classification,
      amenities:item.amenities,
      shops:item.shops,
      locations:item.locations,
      prices:item.prices,
      version:item.version,
      sourceUrl:item.sourceUrl,
      raw:item.raw
    }))
  };
}

module.exports = { API_BASE, searchVerse, looksLikeGuideQuestion, getAssistantKnowledge };
