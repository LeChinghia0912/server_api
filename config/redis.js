const DEFAULT_TTL_SECONDS = Number(process.env.CACHE_TTL_DEFAULT || 60);
const CACHE_DEBUG = String(process.env.CACHE_DEBUG || '').toLowerCase() === '1' || String(process.env.CACHE_DEBUG || '').toLowerCase() === 'true';

let redisClient = null;
let isRedisEnabled = false;

async function initRedis() {
  let createClient;
  try {
    ({ createClient } = require('redis'));
  } catch (err) {
    isRedisEnabled = false;
    console.warn('[cache] Redis client not installed. Run `npm i redis@^4 --save` to enable caching.');
    return;
  }

  try {
    const url = process.env.REDIS_URL || buildUrlFromEnv();
    redisClient = createClient(url ? { url } : {});

    redisClient.on('error', (err) => {
      isRedisEnabled = false;
      if (CACHE_DEBUG) console.warn('[cache] Redis error:', err && err.message ? err.message : err);
    });

    await redisClient.connect();
    isRedisEnabled = true;
    if (CACHE_DEBUG) {
      try {
        const u = url ? new URL(url) : null;
        console.log('[cache] Redis connected', u ? `(${u.hostname}:${u.port})` : '');
      } catch (_) {
        console.log('[cache] Redis connected');
      }
    }
  } catch (err) {
    isRedisEnabled = false;
    console.warn('[cache] Redis disabled:', err && err.message ? err.message : err);
  }
}

function buildUrlFromEnv() {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  const password = process.env.REDIS_PASSWORD;
  if (!host || !port) return null;
  if (password) return `redis://:${encodeURIComponent(password)}@${host}:${port}`;
  return `redis://${host}:${port}`;
}

async function cacheGet(key) {
  if (!isRedisEnabled || !redisClient) return null;
  try {
    const str = await redisClient.get(key);
    if (str === null || str === undefined) return null;
    if (CACHE_DEBUG) console.log('[cache] GET', key);
    try {
      return JSON.parse(str);
    } catch (_) {
      return str;
    }
  } catch (_) {
    if (CACHE_DEBUG) console.warn('[cache] GET failed', key);
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  if (!isRedisEnabled || !redisClient) return false;
  try {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds && Number(ttlSeconds) > 0) {
      await redisClient.set(key, payload, { EX: Number(ttlSeconds) });
    } else {
      await redisClient.set(key, payload);
    }
    if (CACHE_DEBUG) console.log('[cache] SET', key, `(ttl=${ttlSeconds})`);
    return true;
  } catch (_) {
    if (CACHE_DEBUG) console.warn('[cache] SET failed', key);
    return false;
  }
}

async function cacheDel(key) {
  if (!isRedisEnabled || !redisClient) return false;
  try {
    await redisClient.del(key);
    if (CACHE_DEBUG) console.log('[cache] DEL', key);
    return true;
  } catch (_) {
    if (CACHE_DEBUG) console.warn('[cache] DEL failed', key);
    return false;
  }
}

module.exports = {
  initRedis,
  cacheGet,
  cacheSet,
  cacheDel,
  get isEnabled() {
    return isRedisEnabled;
  },
};


