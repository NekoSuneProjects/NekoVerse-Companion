const API_BASE = 'https://api.star-citizen.wiki/api';
const WIKI_SEARCH_URL = 'https://starcitizen.tools/index.php?search=';

const RESOURCE_ENDPOINTS = {
  location: 'locations', locations: 'locations', item: 'items', items: 'items',
  commodity: 'commodities', commodities: 'commodities', vehicle: 'vehicles', vehicles: 'vehicles',
  mission: 'missions', missions: 'missions'
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
    const response = await fetch(url, { signal:controller.signal, headers:{ Accept:'application/json', 'User-Agent':'NekoVerse-Companion/0.1.1' } });
    if (!response.ok) throw new Error(`Star Citizen Wiki API HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

function pickName(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.name || value.label || value.display_name || value.displayName || value.code || null;
}
function compactArray(value, limit = 8) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, limit).map(item => typeof item === 'string' ? item : item?.name || item?.label || item?.display_name || item?.location?.name || item?.terminal?.name || null).filter(Boolean);
}
function inferType(resource, fallback = 'resource') {
  const raw = String(resource?.resource_type || resource?.resourceType || resource?.type || resource?.kind || fallback).toLowerCase();
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
  const raw = JSON.stringify(resource, (key, value) => typeof value === 'string' && value.length > 800 ? `${value.slice(0,800)}…` : value).slice(0,6500);
  return { type,name,identifier,description,parent,system,manufacturer,version,classification:resource?.classification_label||resource?.classification||resource?.sub_type_label||resource?.subType||null,amenities,shops,locations,prices,sourceUrl:`${WIKI_SEARCH_URL}${encodeURIComponent(name)}`,raw };
}
function hitType(hit) { return String(hit?.resource_type || hit?.resourceType || hit?.type || hit?.kind || '').toLowerCase(); }
function hitIdentifier(hit) { return hit?.identifier || hit?.slug || hit?.uuid || hit?.id || hit?.resource?.identifier || hit?.resource?.slug || hit?.resource?.uuid || null; }

async function expandHit(hit) {
  const type = hitType(hit);
  const endpoint = RESOURCE_ENDPOINTS[type] || RESOURCE_ENDPOINTS[inferType(hit, type)];
  const id = hitIdentifier(hit);
  if (!endpoint || !id) return normalizeResource(hit, inferType(hit));
  try {
    const body = await fetchJson(`${API_BASE}/${endpoint}/${encodeURIComponent(id)}`);
    return normalizeResource(body?.data || body, endpoint.replace(/s$/,''));
  } catch { return normalizeResource(hit, endpoint.replace(/s$/,'')); }
}

function extractGuideQuery(input) {
  let text = String(input || '').trim();
  text = text
    .replace(/^(hey\s+)?(jarvis|computer|companion)[,\s:]*/i, '')
    .replace(/\b(please|for me|in star citizen|star citizen|por favor|bitte|prosz[eę]|пожалуйста|s'il vous pla[iî]t|per favore|por favor)\b/gi, ' ')
    // English
    .replace(/^where\s+(?:can\s+i\s+|do\s+i\s+)?(?:find|get|buy|sell|mine|locate)\s+/i, '')
    .replace(/^where\s+(?:is|are)\s+/i, '')
    .replace(/^what\s+is\s+/i, '')
    .replace(/^how\s+(?:do\s+i|can\s+i)\s+(?:find|get|buy|sell|mine|reach|go\s+to)\s+/i, '')
    // Spanish
    .replace(/^d[oó]nde\s+(?:puedo\s+)?(?:encontrar|conseguir|comprar|vender|minar|extraer)\s+/i, '')
    .replace(/^d[oó]nde\s+(?:est[aá]|se\s+encuentra|queda)\s+/i, '')
    .replace(/^qu[eé]\s+es\s+/i, '')
    // German
    .replace(/^wo\s+(?:kann\s+ich\s+)?(?:finden|kaufen|verkaufen|abbauen|bekommen)\s+/i, '')
    .replace(/^wo\s+(?:ist|liegt|befindet\s+sich)\s+/i, '')
    .replace(/^was\s+ist\s+/i, '')
    // Polish
    .replace(/^gdzie\s+(?:mog[eę]\s+)?(?:znale[zźć]|kupi[cć]|sprzeda[cć]|wydoby[cć]|zdoby[cć])\s+/i, '')
    .replace(/^gdzie\s+(?:jest|znajduje\s+si[eę])\s+/i, '')
    .replace(/^co\s+to\s+(?:jest\s+)?/i, '')
    // Russian
    .replace(/^где\s+(?:я\s+могу\s+)?(?:найти|купить|продать|добыть|добывать|получить)\s+/i, '')
    .replace(/^где\s+(?:находится|расположен[аоы]?|есть)\s+/i, '')
    .replace(/^что\s+такое\s+/i, '')
    // French
    .replace(/^o[uù]\s+(?:puis-je\s+|je\s+peux\s+)?(?:trouver|acheter|vendre|miner|obtenir)\s+/i, '')
    .replace(/^o[uù]\s+(?:est|se\s+trouve)\s+/i, '')
    // Italian
    .replace(/^dove\s+(?:posso\s+)?(?:trovare|comprare|vendere|minare|ottenere)\s+/i, '')
    .replace(/^dove\s+(?:si\s+trova|[eè])\s+/i, '')
    // Portuguese
    .replace(/^onde\s+(?:posso\s+)?(?:encontrar|comprar|vender|minerar|obter)\s+/i, '')
    .replace(/^onde\s+(?:fica|est[aá]|se\s+encontra)\s+/i, '')
    .replace(/[?.!]+$/g, '').replace(/\s+/g,' ').trim();
  return text || String(input || '').trim();
}

async function genericSearch(query) {
  for (const url of [`${API_BASE}/search/${encodeURIComponent(query)}`, `${API_BASE}/search?query=${encodeURIComponent(query)}`]) {
    try { const hits = normalizeList(await fetchJson(url)); if (hits.length) return hits; } catch {}
  }
  return [];
}
async function filteredSearch(query) {
  const results = [];
  for (const endpoint of ['locations','commodities','items','vehicles','missions']) {
    try {
      const body = await fetchJson(`${API_BASE}/${endpoint}?filter%5Bname%5D=${encodeURIComponent(query)}`);
      for (const resource of normalizeList(body).slice(0,4)) results.push(normalizeResource(resource, endpoint.replace(/s$/,'')));
      if (results.length >= 10) break;
    } catch {}
  }
  return results;
}
async function searchVerse(query) {
  const clean = extractGuideQuery(query);
  if (!clean) return { ok:false,query:clean,items:[],error:'Enter a Star Citizen search term.' };
  try {
    const hits = await genericSearch(clean);
    const expanded = [];
    for (const hit of hits.slice(0,8)) expanded.push(await expandHit(hit));
    const fallback = expanded.length ? [] : await filteredSearch(clean);
    const seen = new Set();
    const items = [...expanded,...fallback].filter(item => { const key=`${item.type}:${String(item.identifier||item.name).toLowerCase()}`; if(seen.has(key))return false; seen.add(key); return true; }).slice(0,12);
    return { ok:true,query:clean,source:'Star Citizen Wiki API',credit:'api.star-citizen.wiki / starcitizen.tools',items,fallbackUrl:`${WIKI_SEARCH_URL}${encodeURIComponent(clean)}` };
  } catch (error) { return { ok:false,query:clean,source:'Star Citizen Wiki API',items:[],fallbackUrl:`${WIKI_SEARCH_URL}${encodeURIComponent(clean)}`,error:error.message }; }
}

function looksLikeGuideQuestion(text) {
  return /\b(where|find|located|location|buy|sell|shop|store|mine|mining|ore|refine|refinery|city|planet|moon|station|landing zone|what is|d[oó]nde|encontrar|comprar|vender|minar|mineral|ciudad|planeta|luna|estaci[oó]n|wo|finden|kaufen|verkaufen|abbauen|erz|stadt|planet|mond|station|gdzie|znale[zźć]|kupi[cć]|sprzeda[cć]|wydoby[cć]|ruda|miasto|planeta|ksi[eę][żz]yc|stacja|где|найти|купить|продать|добыть|руда|город|планета|луна|станция|o[uù]|trouver|acheter|vendre|miner|ville|plan[eè]te|lune|dove|trovare|comprare|vendere|minare|citt[aà]|pianeta|luna|onde|encontrar|comprar|vender|minerar|cidade|planeta|lua)\b/i.test(String(text || ''));
}
async function getAssistantKnowledge(message) {
  if (!looksLikeGuideQuestion(message)) return null;
  const result = await searchVerse(message);
  if (!result.ok || !result.items.length) return result;
  return { ...result, items:result.items.slice(0,6).map(item => ({ type:item.type,name:item.name,description:item.description,parent:item.parent,system:item.system,manufacturer:item.manufacturer,classification:item.classification,amenities:item.amenities,shops:item.shops,locations:item.locations,prices:item.prices,version:item.version,sourceUrl:item.sourceUrl,raw:item.raw })) };
}

module.exports = { API_BASE, extractGuideQuery, searchVerse, looksLikeGuideQuestion, getAssistantKnowledge };
