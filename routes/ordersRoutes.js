const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

router.post('/', requireAuth, ordersController.createOrder);
router.get('/', requireAuth, ordersController.listMyOrders);

router.get('/me', requireAuth, ordersController.listMyOrders);

router.get('/:id', requireAuth, ordersController.getOrder);
router.put('/:id/pay', requireAuth, ordersController.markPaid);
router.put('/:id/confirm-received', requireAuth, ordersController.confirmReceived);
router.post('/:id/received', requireAuth, ordersController.confirmReceived);
router.post('/:id/events', requireAuth, ordersController.handleEvent);
router.put('/:id/status', requireAuth, ordersController.updateStatusUser);
router.put('/:id', requireAuth, ordersController.updateStatusUser);


module.exports = router;


