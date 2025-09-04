const ordersRepository = require("../repositories/ordersRepository");
const variantsRepository = require("../repositories/variantsRepository");
const userRepository = require("../repositories/userRepository");
const cache = require("../config/redis");
const CacheKeys = require("../utils/cacheKeys");
const CacheTtl = require("../config/cacheTtl");

async function listMyOrders(userId) {
  if (cache.isEnabled) {
    const cached = await cache.cacheGet(CacheKeys.orders.userAll(userId));
    if (cached) return cached;
  }
  const orders = await ordersRepository.findByUser(userId);
  if (cache.isEnabled) await cache.cacheSet(CacheKeys.orders.userAll(userId), orders, CacheTtl.orders.userAll);
  return orders;
}

async function getMyOrderDetail(userId, id) {
  const order = await ordersRepository.findByIdForUser(id, userId);
  if (!order) return null;
  const items = await ordersRepository.findItems(id);
  // Hydrate with variant details where possible
  const variantIds = Array.from(new Set(items.map(i => i.variant_id)));
  const variants = await variantsRepository.findByIds(variantIds);
  const variantById = {};
  (variants || []).forEach(v => { variantById[v.id] = v; });
  order.items = items.map(i => ({ ...i, variant: variantById[i.variant_id] || null }));
  try {
    const user = await userRepository.findById(order.user_id);
    if (user) {
      order.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        province: user.province,
        district: user.district,
        ward: user.ward,
        address: user.address,
      };
    }
  } catch (_) {}
  if (cache.isEnabled) await cache.cacheSet(CacheKeys.orders.userById(userId, id), order, CacheTtl.orders.userById);
  return order;
}

async function createOrderFromCart(userId) {
  const created = await ordersRepository.createFromCart(userId);
  if (!created) return null;
  if (cache.isEnabled) {
    await cache.cacheDel(CacheKeys.orders.userAll(userId));
  }
  return getMyOrderDetail(userId, created.id);
}

module.exports = {
  listMyOrders,
  getMyOrderDetail,
  createOrderFromCart,
  async listAllOrdersWithUsers() {
    if (cache.isEnabled) {
      const cached = await cache.cacheGet(CacheKeys.orders.adminAll);
      if (cached) return cached;
    }
    const rows = await ordersRepository.findAllWithUsers();
    if (cache.isEnabled) await cache.cacheSet(CacheKeys.orders.adminAll, rows, CacheTtl.orders.adminAll);
    return rows;
  },
  async getOrderAdminDetail(id) {
    if (cache.isEnabled) {
      const cached = await cache.cacheGet(CacheKeys.orders.adminById(id));
      if (cached) return cached;
    }
    const order = await ordersRepository.findById(id);
    if (!order) return null;
    const items = await ordersRepository.findItems(id);
    const variantIds = Array.from(new Set(items.map(i => i.variant_id)));
    const variants = await variantsRepository.findByIds(variantIds);
    const variantById = {};
    (variants || []).forEach(v => { variantById[v.id] = v; });
    order.items = items.map(i => ({ ...i, variant: variantById[i.variant_id] || null }));
    try {
      const user = await userRepository.findById(order.user_id);
      if (user) {
        order.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          province: user.province,
          district: user.district,
          ward: user.ward,
          address: user.address,
        };
      }
    } catch (_) {}
    if (cache.isEnabled) await cache.cacheSet(CacheKeys.orders.adminById(id), order, CacheTtl.orders.adminById);
    return order;
  },
};


