const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

router.post('/', requireAuth, ordersController.createOrder);
router.get('/', requireAuth, ordersController.listMyOrders);

router.get('/me', requireAuth, ordersController.listMyOrders);

router.get('/:id', requireAuth, ordersController.getOrder);


module.exports = router;


