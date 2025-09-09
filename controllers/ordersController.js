const ordersService = require('../services/ordersService');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const { assertValidId } = require('../utils/validators');

async function createOrder(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const created = await ordersService.createOrderFromCart(userId);
    if (!created) throw new AppError('Cart is empty or unavailable', 400);
    res.status(201).json(ApiResponse.success(created, 'Order created successfully'));
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const id = assertValidId(req.params.id, 'id');
    const row = await ordersService.getMyOrderDetail(userId, id);
    if (!row) return res.status(404).json(ApiResponse.error('Order not found', 404));
    res.json(ApiResponse.success(row, 'Order fetched successfully'));
  } catch (err) { next(err); }
}

async function listMyOrders(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const rows = await ordersService.listMyOrders(userId);
    res.json(ApiResponse.success(rows, 'Orders fetched successfully'));
  } catch (err) { next(err); }
}

async function markPaid(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const id = assertValidId(req.params.id, 'id');
    const updated = await ordersService.markOrderPaidForUser(userId, id);
    if (!updated) return res.status(404).json(ApiResponse.error('Order not found', 404));
    res.json(ApiResponse.success(updated, 'Order marked as paid'));
  } catch (err) { next(err); }
}

async function confirmReceived(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const id = assertValidId(req.params.id, 'id');
    const updated = await ordersService.markOrderCompletedForUser(userId, id);
    if (!updated) return res.status(404).json(ApiResponse.error('Order not found', 404));
    res.json(ApiResponse.success(updated, 'Order marked as completed'));
  } catch (err) {
    if (err && err.statusCode) return res.status(err.statusCode).json(ApiResponse.error(err.message, err.statusCode));
    next(err);
  }
}

async function handleEvent(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const id = assertValidId(req.params.id, 'id');
    const type = String((req.body && (req.body.type || req.body.event)) || '').toLowerCase();
    if (type === 'received') {
      const updated = await ordersService.markOrderCompletedForUser(userId, id);
      if (!updated) return res.status(404).json(ApiResponse.error('Order not found', 404));
      return res.json(ApiResponse.success(updated, 'Order marked as completed'));
    }
    return res.status(400).json(ApiResponse.error('Unsupported event type', 400));
  } catch (err) { next(err); }
}

async function updateStatusUser(req, res, next) {
  try {
    const userId = assertValidId(req.user && req.user.userId, 'userId');
    const id = assertValidId(req.params.id, 'id');
    const status = String((req.body && req.body.status) || '').toLowerCase();
    if (status !== 'completed') return res.status(400).json(ApiResponse.error('Only completed status is allowed for user', 400));
    const updated = await ordersService.markOrderCompletedForUser(userId, id);
    if (!updated) return res.status(404).json(ApiResponse.error('Order not found', 404));
    res.json(ApiResponse.success(updated, 'Order marked as completed'));
  } catch (err) {
    if (err && err.statusCode) return res.status(err.statusCode).json(ApiResponse.error(err.message, err.statusCode));
    next(err);
  }
}

module.exports = { createOrder, getOrder, listMyOrders, markPaid, confirmReceived, handleEvent, updateStatusUser };


