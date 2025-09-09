const express = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/auth');
const ctrl = require('../controllers/ordersController.admin');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, ctrl.listAll);
router.get('/:id', requireAuth, requireAdmin, ctrl.getDetail);
router.put('/:id/pay', requireAuth, requireAdmin, ctrl.markPaid);
router.put('/:id/status', requireAuth, requireAdmin, ctrl.updateStatus);

module.exports = router;


