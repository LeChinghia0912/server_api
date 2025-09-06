const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.get('/', requireAuth, cartController.getMyCart);
router.post('/', requireAuth, cartController.addToCart);
router.put('/method', requireAuth, cartController.setPaymentMethod);
router.put('/method/set', requireAuth, cartController.setPaymentMethod);
router.put('/:id', requireAuth, cartController.updateCartItem);
router.delete('/:id', requireAuth, cartController.removeCartItem);
router.delete('/', requireAuth, cartController.clearMyCart);

module.exports = router;


