const toNum = (val, def) => {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : def;
};

module.exports = {
  defaults: {
    all: toNum(process.env.CACHE_TTL_DEFAULT, 600), // 1 giờ
  },
  products: {
    all: toNum(process.env.CACHE_TTL_PRODUCTS, 600), // 10 phút
    byId: toNum(
      process.env.CACHE_TTL_PRODUCT_BY_ID,
      toNum(process.env.CACHE_TTL_PRODUCTS, 600)
    ), // 1 giờ
  },
  categories: {
    all: toNum(process.env.CACHE_TTL_CATEGORIES, 86400), // 24 giờ
    byId: toNum(
      process.env.CACHE_TTL_CATEGORY_BY_ID,
      toNum(process.env.CACHE_TTL_CATEGORIES, 86400)
    ), // 24 giờ
  },
  sizes: {
    all: toNum(process.env.CACHE_TTL_SIZES, 2592000), // 30 ngày
  },
  colors: {
    all: toNum(process.env.CACHE_TTL_COLORS, 2592000), // 30 ngày
  },
  orders: {
    adminAll: toNum(process.env.CACHE_TTL_ORDERS_ADMIN_ALL, 30),
    adminById: toNum(process.env.CACHE_TTL_ORDERS_ADMIN_BY_ID, 60),
    userAll: toNum(process.env.CACHE_TTL_ORDERS_USER_ALL, 15),
    userById: toNum(process.env.CACHE_TTL_ORDERS_USER_BY_ID, 60),
  },
};
