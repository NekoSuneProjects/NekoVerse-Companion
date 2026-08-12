const { setTimeout: delay } = require('node:timers/promises');

const PTU_FAQ = 'https://support.robertsspaceindustries.com/hc/en-us/articles/115013195927-Public-Test-Universe-PTU-FAQ';
const DEV_HUB = 'https://robertsspaceindustries.com/en/comm-link?channel=development';
const WIKI_API = 'https://api.star-citizen.wiki/api';

async function fetchText(url, timeout = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'NekoVerse-Companion/0.1 (+NekoSuneVR)' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally { clearTimeout(timer); }
}

function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

async function getStatus() {
  const fallback = {
    live: '4.9', liveBuild: '4.9.0-LIVE.12232306', ptu: 'Offline', ptuBuild: null,
    source: 'embedded fallback', updatedAt: new Date().toISOString(), stale: true
  };
  try {
    const html = await fetchText(PTU_FAQ);
    const text = stripHtml(html);
    const live = text.match(/LIVE\s*STATUS\s*:\s*(.*?)(?=\s+(?:PTU|EPTU)\s*STATUS\s*:|$)/i)?.[1]?.trim();
    const ptu = text.match(/PTU\s*STATUS\s*:\s*(.*?)(?=\s+(?:LIVE|EPTU)\s*STATUS\s*:|$)/i)?.[1]?.trim();
    let liveBuild = fallback.liveBuild;
    let ptuBuild = null;
    try {
      const developmentHtml = await fetchText(DEV_HUB, 9000);
      liveBuild = developmentHtml.match(/\b\d+\.\d+(?:\.\d+)?-LIVE\.\d+\b/i)?.[0] || liveBuild;
      ptuBuild = developmentHtml.match(/\b\d+\.\d+(?:\.\d+)?-(?:PTU|EPTU)\.\d+\b/i)?.[0] || null;
    } catch {}
    return {
      ...fallback,
      live: live || fallback.live,
      ptu: ptu || fallback.ptu,
      liveBuild, ptuBuild,
      source: 'RSI PTU FAQ + development feed', stale: false, rawSummary: text.slice(0, 900)
    };
  } catch (error) {
    return { ...fallback, error: error.message };
  }
}

function normalizeItems(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ['data', 'results', 'items']) if (Array.isArray(payload?.[key])) return payload[key];
  return [];
}

async function getNews() {
  const urls = [
    `${WIKI_API}/comm-links?sort=-publish_date&limit=12`,
    `${WIKI_API}/comm-links?page[size]=12&sort=-publish_date`,
    `${WIKI_API}/comm-links?limit=12`
  ];
  let lastError;
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'NekoVerse-Companion/0.1' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const payload = await r.json();
      const items = normalizeItems(payload).slice(0, 12).map((item, idx) => {
        const id = item.id || item.comm_link_id || item.slug || idx;
        const title = item.title || item.name || item.attributes?.title || `Comm-Link ${id}`;
        const published = item.publish_date || item.published_at || item.created_at || item.attributes?.publish_date || null;
        const excerpt = item.description || item.excerpt || item.attributes?.description || '';
        const link = item.url || item.link || item.attributes?.url || `https://robertsspaceindustries.com/comm-link/SCW/${id}`;
        return { id, title, published, excerpt: String(excerpt).replace(/<[^>]+>/g, '').slice(0, 260), url: link };
      });
      if (items.length) return { items, source: 'Star Citizen Wiki API (RSI archive mirror)', stale: false };
    } catch (e) { lastError = e; await delay(100); }
  }
  return {
    items: [{ id: 'official-dev', title: 'Open official Star Citizen development comm-links', published: null, excerpt: 'The news adapter could not reach the community API. Open the official development feed instead.', url: DEV_HUB }],
    source: 'fallback', stale: true, error: lastError?.message || 'No news returned'
  };
}

module.exports = { getStatus, getNews, PTU_FAQ, DEV_HUB };
