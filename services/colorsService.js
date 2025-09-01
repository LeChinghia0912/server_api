const colorsRepository = require("../repositories/colorsRepository");
const cache = require("../config/redis");
const CacheKeys = require("../utils/cacheKeys");
const CacheTtl = require("../config/cacheTtl");
const AppError = require("../utils/AppError");

async function listColors() {
  if (cache.isEnabled) {
    const cached = await cache.cacheGet(CacheKeys.colors.all);
    if (cached) return cached;
  }
  const rows = await colorsRepository.findAll();
  if (cache.isEnabled) await cache.cacheSet(CacheKeys.colors.all, rows, CacheTtl.colors.all);
  return rows;
}

async function createColor(payload) {
  if (!payload?.name) {
    throw new AppError("name is required", 400);
  }
  const exists = await colorsRepository.findByName(payload.name);
  if (exists) {
    throw new AppError("Color name already exists", 409);
  }
  const created = await colorsRepository.create(payload);
  if (cache.isEnabled) await cache.cacheDel(CacheKeys.colors.all);
  return created;
}

async function deleteColor(id) {
  const ok = await colorsRepository.remove(id);
  if (ok && cache.isEnabled) await cache.cacheDel(CacheKeys.colors.all);
  return ok;
}

module.exports = { listColors, createColor, deleteColor };


