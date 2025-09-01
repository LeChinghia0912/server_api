const categoriesRepository = require("../repositories/categoriesRepository");
const AppError = require("../utils/AppError");
const cache = require("../config/redis");
const CacheKeys = require("../utils/cacheKeys");
const CacheTtl = require("../config/cacheTtl");

async function listCategories() {
  if (cache.isEnabled) {
    const cached = await cache.cacheGet(CacheKeys.categories.all);
    if (cached) return cached;
  }
  const rows = await categoriesRepository.findAll();
  if (cache.isEnabled) await cache.cacheSet(CacheKeys.categories.all, rows, CacheTtl.categories.all);
  return rows;
}

async function getCategoryById(id) {
  if (cache.isEnabled) {
    const cached = await cache.cacheGet(CacheKeys.categories.byId(id));
    if (cached) return cached;
  }
  const row = await categoriesRepository.findById(id);
  if (row && cache.isEnabled) await cache.cacheSet(CacheKeys.categories.byId(id), row, CacheTtl.categories.byId);
  return row;
}

async function createCategory(payload) {
  if (!payload?.name) {
    throw new AppError("name is required", 400);
  }
  const existing = await categoriesRepository.findByName(payload.name);
  if (existing) {
    throw new AppError("Category name already exists", 409);
  }
  const created = await categoriesRepository.create({
    name: payload.name,
    description: payload.description,
  });
  if (cache.isEnabled) {
    await cache.cacheDel(CacheKeys.categories.all);
    await cache.cacheSet(CacheKeys.categories.byId(created.id), created, CacheTtl.categories.byId);
  }
  return created;
}

async function updateCategory(id, payload) {
  if (payload?.name) {
    const existing = await categoriesRepository.findByName(payload.name);
    if (existing && Number(existing.id) !== Number(id)) {
      throw new AppError("Category name already exists", 409);
    }
  }
  const updated = await categoriesRepository.update(id, payload);
  if (cache.isEnabled) {
    await cache.cacheDel(CacheKeys.categories.all);
    await cache.cacheSet(CacheKeys.categories.byId(id), updated, CacheTtl.categories.byId);
  }
  return updated;
}

async function deleteCategory(id) {
  const ok = await categoriesRepository.remove(id);
  if (ok && cache.isEnabled) {
    await cache.cacheDel(CacheKeys.categories.all);
    await cache.cacheDel(CacheKeys.categories.byId(id));
  }
  return ok;
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
