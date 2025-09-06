const cartRepository = require('../repositories/cartRepository');
const cartsRepository = require('../repositories/cartsRepository');
const variantsRepository = require('../repositories/variantsRepository');

async function getCart(userId) {
  const cart = await cartsRepository.ensureActiveCart(userId);
  const items = await cartRepository.findByCartId(cart.id);
  const hydrated = await hydrateCart(items);
  return { ...hydrated, method: cart.method || null };
}

async function addItem(userId, { variant_id, quantity }) {
  const cart = await cartsRepository.ensureActiveCart(userId);
  await cartRepository.upsert(cart.id, variant_id, quantity);
  const items = await cartRepository.findByCartId(cart.id);
  const hydrated = await hydrateCart(items);
  return { ...hydrated, method: cart.method || null };
}

async function updateItem(userId, id, { quantity }) {
  const cart = await cartsRepository.ensureActiveCart(userId);
  await cartRepository.updateQuantity(id, cart.id, quantity);
  const items = await cartRepository.findByCartId(cart.id);
  const hydrated = await hydrateCart(items);
  return { ...hydrated, method: cart.method || null };
}

async function removeItem(userId, id) {
  const cart = await cartsRepository.ensureActiveCart(userId);
  await cartRepository.remove(id, cart.id);
  const items = await cartRepository.findByCartId(cart.id);
  const hydrated = await hydrateCart(items);
  return { ...hydrated, method: cart.method || null };
}

async function clearCart(userId) {
  const cart = await cartsRepository.ensureActiveCart(userId);
  await cartRepository.clear(cart.id);
  return { items: [], total: 0, method: cart.method || null };
}

async function setPaymentMethod(userId, method) {
  const cart = await cartsRepository.ensureActiveCart(userId);
  await cartsRepository.updateMethod(cart.id, method);
  const items = await cartRepository.findByCartId(cart.id);
  const hydrated = await hydrateCart(items);
  return { ...hydrated, method };
}

async function hydrateCart(items) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return { items: [], total: 0 };
  const variantIds = Array.from(new Set(list.map(i => i.variant_id).filter(Boolean)));
  const variants = await variantsRepository.findByIds(variantIds);
  const variantById = {};
  (variants || []).forEach(v => { variantById[v.id] = v; });
  let total = 0;
  const withDetails = list.map(i => {
    const variant = i.variant_id ? (variantById[i.variant_id] || null) : null;
    const product = variant ? { id: variant.product_id } : null;
    const unitPrice = variant ? Number(variant.price || 0) : 0;
    const lineTotal = unitPrice * Number(i.quantity || 0);
    total += lineTotal;
    return { ...i, product, variant, price: unitPrice, line_total: lineTotal };
  });
  return { items: withDetails, total };
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  setPaymentMethod,
};


