const productsRepository = require("../repositories/productsRepository");
const AppError = require("../utils/AppError");
const variantsRepository = require("../repositories/variantsRepository");
const cache = require("../config/redis");
const CacheKeys = require("../utils/cacheKeys");
const CacheTtl = require("../config/cacheTtl");
const { normalizeVariantsInput } = require("../utils/parsers");

async function listProducts() {
    if (cache.isEnabled) {
      const cached = await cache.cacheGet(CacheKeys.products.all);
      if (cached) return cached;
    }
    const rows = await productsRepository.findAll();
    try {
      const ids = rows.map(r => r.id);
      const variantRows = await variantsRepository.listByProductIds(ids);
      const productIdToVariants = {};
      (variantRows || []).forEach((v) => {
        (productIdToVariants[v.product_id] ||= []).push(v);
      });
      rows.forEach((r) => { r.variants = productIdToVariants[r.id] || []; });
    } catch (_) {}
    if (cache.isEnabled) await cache.cacheSet(CacheKeys.products.all, rows, CacheTtl.products.all);
    return rows;
}

async function getProductById(id) {
    if (cache.isEnabled) {
      const cached = await cache.cacheGet(CacheKeys.products.byId(id));
      if (cached) return cached;
    }
    const row = await productsRepository.findById(id);
    if (row && cache.isEnabled) await cache.cacheSet(CacheKeys.products.byId(id), row, CacheTtl.products.byId);
    return row;
}

async function createProduct(payload) {
    const { variants } = payload;
    const created = await productsRepository.create(payload);
    if (Array.isArray(variants)) {
      await variantsRepository.replaceForProduct(created.id, normalizeVariantsInput(variants));
    }
    const [finalRow, variantRows] = await Promise.all([
      productsRepository.findById(created.id),
      variantsRepository.listByProductIds([created.id])
    ]);
    if (finalRow) finalRow.variants = (variantRows || []).filter(v => Number(v.product_id) === Number(created.id));
    if (cache.isEnabled) {
      await cache.cacheDel(CacheKeys.products.all);
      await cache.cacheSet(CacheKeys.products.byId(created.id), finalRow, CacheTtl.products.byId);
    }
    return finalRow;
}

async function updateProductById(id, payload) { 
    const { variants } = payload;
    const updated = await productsRepository.update(id, payload);
    if (!updated) return null;
    if (Array.isArray(variants)) {
      await variantsRepository.replaceForProduct(id, normalizeVariantsInput(variants));
    }
    // Include variants for UI after update
    const [finalRow, variantRows] = await Promise.all([
      productsRepository.findById(id),
      variantsRepository.listByProductIds([id])
    ]);
    const variantsForThis = (variantRows || []).filter(v => Number(v.product_id) === Number(id));
    if (finalRow) finalRow.variants = variantsForThis;
    if (cache.isEnabled) {
      await cache.cacheDel(CacheKeys.products.all);
      await cache.cacheSet(CacheKeys.products.byId(id), finalRow, CacheTtl.products.byId);
    }
    return finalRow;
}

async function deleteProduct(id) {
    const ok = await productsRepository.remove(id);
    if (ok && cache.isEnabled) {
      await cache.cacheDel(CacheKeys.products.all);
      await cache.cacheDel(CacheKeys.products.byId(id));
    }
    return ok;
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProduct,
};