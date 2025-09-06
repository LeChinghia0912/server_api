const cartService = require('../services/cartService');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const { assertValidId } = require('../utils/validators');

async function getMyCart(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const cart = await cartService.getCart(userId);
    res.json(ApiResponse.success(cart, 'Cart fetched successfully'));
  } catch (err) { next(err); }
}

async function addToCart(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const { variant_id, quantity } = req.body || {};
    if (!variant_id || !quantity) throw new AppError('variant_id and quantity are required', 400);
    const cart = await cartService.addItem(userId, { variant_id: Number(variant_id), quantity: Number(quantity) });
    res.status(201).json(ApiResponse.success(cart, 'Item added to cart'));
  } catch (err) { next(err); }
}

async function updateCartItem(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const id = assertValidId(req.params.id, 'id');
    const { quantity } = req.body || {};
    if (quantity === undefined) throw new AppError('quantity is required', 400);
    const cart = await cartService.updateItem(userId, id, { quantity: Number(quantity) });
    res.json(ApiResponse.success(cart, 'Cart updated'));
  } catch (err) { next(err); }
}

async function removeCartItem(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const id = assertValidId(req.params.id, 'id');
    const cart = await cartService.removeItem(userId, id);
    res.json(ApiResponse.success(cart, 'Item removed'));
  } catch (err) { next(err); }
}

async function clearMyCart(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const cart = await cartService.clearCart(userId);
    res.json(ApiResponse.success(cart, 'Cart cleared'));
  } catch (err) { next(err); }
}

async function setPaymentMethod(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const { method } = req.body || {};
    const methodNum = Number(method);
    if (![1, 2].includes(methodNum)) {
      throw new AppError('Invalid method. Use 1 (COD) or 2 (Online banking).', 400);
    }
    const cart = await cartService.setPaymentMethod(userId, methodNum);
    res.json(ApiResponse.success(cart, 'Payment method updated'));
  } catch (err) { next(err); }
}

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearMyCart,
  setPaymentMethod,
};


