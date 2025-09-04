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

module.exports = { createOrder, getOrder, listMyOrders };


