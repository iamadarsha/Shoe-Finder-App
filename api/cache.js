import crypto from 'node:crypto';

const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

const cacheStore = new Map();

function normalize(value) {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalize(value[key]);
        return acc;
      }, {});
  }

  return value;
}

function pruneExpiredEntries(now = Date.now()) {
  for (const [key, entry] of cacheStore.entries()) {
    if (entry.expiresAt <= now) {
      cacheStore.delete(key);
    }
  }
}

function enforceMaxEntries() {
  while (cacheStore.size > MAX_CACHE_ENTRIES) {
    const firstKey = cacheStore.keys().next().value;
    if (!firstKey) {
      break;
    }
    cacheStore.delete(firstKey);
  }
}

export function buildPreferenceCacheKey(preferences) {
  const normalized = normalize(preferences ?? {});
  const serialized = JSON.stringify(normalized);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

export function getCachedResponse(cacheKey) {
  const now = Date.now();
  pruneExpiredEntries(now);

  const entry = cacheStore.get(cacheKey);
  if (!entry) {
    return null;
  }

  cacheStore.delete(cacheKey);
  cacheStore.set(cacheKey, entry);
  return entry.value;
}

export function setCachedResponse(cacheKey, value) {
  const now = Date.now();
  pruneExpiredEntries(now);

  cacheStore.set(cacheKey, {
    value,
    expiresAt: now + CACHE_TTL_MS,
  });
  enforceMaxEntries();
}

export function clearCache() {
  cacheStore.clear();
}

