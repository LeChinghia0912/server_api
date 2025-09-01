const sizesRepository = require("../repositories/sizesRepository");
const cache = require("../config/redis");
const CacheKeys = require("../utils/cacheKeys");
const CacheTtl = require("../config/cacheTtl");
const AppError = require("../utils/AppError");

async function listSizes() {
  if (cache.isEnabled) {
    const cached = await cache.cacheGet(CacheKeys.sizes.all);
    if (cached) return cached;
  }
  const rows = await sizesRepository.findAll();
  if (cache.isEnabled) await cache.cacheSet(CacheKeys.sizes.all, rows, CacheTtl.sizes.all);
  return rows;
}

async function createSize(payload) {
  if (!payload?.name) {
    throw new AppError("name is required", 400);
  }
  // naive uniqueness check via existing list (no dedicated repository method)
  const existing = (await sizesRepository.findAll()).find(r => String(r.name).toLowerCase() === String(payload.name).toLowerCase());
  if (existing) {
    throw new AppError("Size name already exists", 409);
  }
  const created = await sizesRepository.create(payload);
  if (cache.isEnabled) await cache.cacheDel(CacheKeys.sizes.all);
  return created;
}

async function deleteSize(id) {
  const ok = await sizesRepository.remove(id);
  if (ok && cache.isEnabled) await cache.cacheDel(CacheKeys.sizes.all);
  return ok;
}

module.exports = { listSizes, createSize, deleteSize };


