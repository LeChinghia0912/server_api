const ordersService = require('../services/ordersService');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const { assertValidId } = require('../utils/validators');
const cache = require('../config/redis');
const CacheKeys = require('../utils/cacheKeys');

async function listAll(req, res, next) {
  try {
    const rows = await ordersService.listAllOrdersWithUsers();
    res.json(ApiResponse.success(rows, 'Orders fetched successfully'));
  } catch (err) { next(err); }
}

async function getDetail(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json(ApiResponse.error('Invalid id', 400));
    const row = await ordersService.getOrderAdminDetail(id);
    if (!row) return res.status(404).json(ApiResponse.error('Order not found', 404));
    res.json(ApiResponse.success(row, 'Order fetched successfully'));
  } catch (err) { next(err); }
}

async function createFromCart(req, res, next) {
  try {
    const userId = assertValidId(req.body && req.body.user_id, 'user_id');
    const created = await ordersService.createOrderFromCart(userId);
    if (!created) throw new AppError('Cart is empty or unavailable', 400);
    if (cache.isEnabled) {
      try { await cache.cacheDel(CacheKeys.orders.adminAll); } catch (_) {}
    }
    res.status(201).json(ApiResponse.success(created, 'Order created successfully'));
  } catch (err) { next(err); }
}

async function markPaid(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json(ApiResponse.error('Invalid id', 400));
    const updated = await ordersService.markOrderPaidAdmin(id);
    if (!updated) return res.status(404).json(ApiResponse.error('Order not found', 404));
    res.json(ApiResponse.success(updated, 'Order marked as paid'));
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json(ApiResponse.error('Invalid id', 400));
    const status = (req.body && req.body.status) || '';
    const updated = await ordersService.updateOrderStatusAdmin(id, status);
    if (!updated) return res.status(404).json(ApiResponse.error('Order not found', 404));
    res.json(ApiResponse.success(updated, 'Order status updated'));
  } catch (err) {
    if (err && err.statusCode) return res.status(err.statusCode).json(ApiResponse.error(err.message, err.statusCode));
    next(err);
  }
}

module.exports = { listAll, getDetail, createFromCart, markPaid, updateStatus };


