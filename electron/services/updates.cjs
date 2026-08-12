const REPO = 'NekoSuneProjects/NekoVerse-Companion';
const LATEST_RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`;

function cleanVersion(value) {
  return String(value || '')
    .trim()
    .replace(/^v/i, '')
    .split('-')[0]
    .split('+')[0];
}

function versionParts(value) {
  const clean = cleanVersion(value);
  if (!/^\d+(?:\.\d+){0,3}$/.test(clean)) return null;
  return clean.split('.').map(part => Number(part));
}

function compareVersions(a, b) {
  const left = versionParts(a);
  const right = versionParts(b);
  if (!left || !right) return 0;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const av = left[i] || 0;
    const bv = right[i] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

async function checkForUpdate(currentVersion) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(LATEST_RELEASE_API, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': `NekoVerse-Companion/${cleanVersion(currentVersion) || 'desktop'}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (response.status === 404) {
      return { ok: true, available: false, currentVersion, latestVersion: null };
    }
    if (!response.ok) throw new Error(`GitHub releases HTTP ${response.status}`);

    const release = await response.json();
    const latestVersion = cleanVersion(release?.tag_name || release?.name);
    const available = Boolean(latestVersion) && compareVersions(latestVersion, currentVersion) > 0;

    return {
      ok: true,
      available,
      currentVersion: cleanVersion(currentVersion),
      latestVersion,
      tag: release?.tag_name || null,
      name: release?.name || release?.tag_name || null,
      url: release?.html_url || `https://github.com/${REPO}/releases/latest`,
      publishedAt: release?.published_at || null,
      prerelease: Boolean(release?.prerelease)
    };
  } catch (error) {
    return {
      ok: false,
      available: false,
      currentVersion: cleanVersion(currentVersion),
      error: error?.name === 'AbortError' ? 'Update check timed out.' : error.message
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { REPO, LATEST_RELEASE_API, cleanVersion, compareVersions, checkForUpdate };
