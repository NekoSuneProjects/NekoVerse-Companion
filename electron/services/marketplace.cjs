const COMMON_NOTICE = 'Third-party/grey-market seller. Not endorsed or protected by CIG/RSI. Verify the exact item, insurance, seller and refund/escrow terms yourself.';

const PROVIDERS = [
  {
    id: 'star-hangar', name: 'Star Hangar', type: 'magento', base: 'https://star-hangar.com',
    searchUrl: q => `https://star-hangar.com/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    notice: COMMON_NOTICE
  },
  {
    id: 'space-foundry', name: 'Space Foundry', type: 'shopify', base: 'https://space-foundry.com',
    searchUrl: q => `https://space-foundry.com/search?q=${encodeURIComponent(q)}`,
    notice: COMMON_NOTICE
  },
  {
    id: 'the-impound', name: 'The Impound', type: 'shopify', base: 'https://theimpound.com',
    searchUrl: q => `https://theimpound.com/search?q=${encodeURIComponent(q)}`,
    notice: COMMON_NOTICE
  }
];

function decodeHtml(s='') {
  return s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
function absolute(base, href='') { try { return new URL(href, base).href; } catch { return base; } }

function parseMagento(html, provider) {
  const chunks = html.split(/class=["'][^"']*product-item[^"']*["']/i).slice(1, 61);
  const out = [];
  for (const chunk of chunks) {
    const title = decodeHtml(chunk.match(/product-item-link[^>]*>([\s\S]*?)<\/a>/i)?.[1] || chunk.match(/product-item-name[^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || '');
    const href = chunk.match(/href=["']([^"']+)["']/i)?.[1];
    const price = decodeHtml(chunk.match(/price[^>]*>([^<]+)</i)?.[1] || chunk.match(/(?:\$|£|€)\s?[\d,.]+/i)?.[0] || '');
    if (title && href) out.push({ title, price: price || 'Check seller', url: absolute(provider.base, href), provider: provider.name, lti: /\bLTI\b|lifetime insurance/i.test(title) });
  }
  return out.filter((x, i, a) => a.findIndex(y => y.url === x.url) === i);
}

async function fetchShopify(provider, q) {
  const url = `${provider.base}/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=20`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 NekoVerse-Companion/0.1', 'Accept':'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const body = await r.json();
    const products = body?.resources?.results?.products || body?.resources?.results?.product || [];
    return (Array.isArray(products) ? products : []).map(p => {
      const title = p.title || p.name || 'Marketplace listing';
      const rawPrice = p.price || p.price_min || p.price_max || p.price_range || '';
      return {
        title,
        price: typeof rawPrice === 'object' ? (rawPrice.min || rawPrice.max || 'Check seller') : String(rawPrice || 'Check seller'),
        url: absolute(provider.base, p.url || p.handle || ''),
        provider: provider.name,
        lti: /\bLTI\b|lifetime insurance/i.test(`${title} ${p.body || ''}`)
      };
    }).filter(x => x.url !== provider.base);
  } finally { clearTimeout(timer); }
}

async function fetchMagento(provider, q) {
  const searchUrl = provider.searchUrl(q);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(searchUrl, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 NekoVerse-Companion/0.1' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return parseMagento(await r.text(), provider);
  } finally { clearTimeout(timer); }
}

async function searchMarket({ query, ltiOnly = true }) {
  const q = String(query || '').trim();
  if (!q) return { items: [], providers: PROVIDERS, warning: COMMON_NOTICE };
  const term = q + (ltiOnly ? ' LTI' : '');
  const settled = await Promise.allSettled(PROVIDERS.map(async provider => {
    const parsed = provider.type === 'shopify' ? await fetchShopify(provider, term) : await fetchMagento(provider, term);
    return { provider, parsed };
  }));

  const items = [];
  const errors = [];
  settled.forEach((result, index) => {
    const provider = PROVIDERS[index];
    if (result.status === 'fulfilled') {
      const parsed = result.value.parsed || [];
      for (const item of parsed) if (!ltiOnly || item.lti) items.push(item);
      if (!parsed.length) errors.push(`${provider.name}: no public product cards returned; external search is available.`);
    } else errors.push(`${provider.name}: ${result.reason?.message || 'request failed'}`);
  });

  for (const provider of PROVIDERS) {
    if (!items.some(x => x.provider === provider.name)) {
      items.push({ title: `Search ${provider.name} for “${term}”`, price: 'Open live results', url: provider.searchUrl(term), provider: provider.name, lti: ltiOnly, externalSearch: true });
    }
  }

  const unique = items.filter((x, i, a) => a.findIndex(y => y.url === x.url) === i);
  return { items: unique.slice(0, 60), providers: PROVIDERS, warning: COMMON_NOTICE, errors };
}

module.exports = { searchMarket, PROVIDERS };
