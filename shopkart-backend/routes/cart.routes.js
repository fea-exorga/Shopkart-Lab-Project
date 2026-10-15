const express = require('express');

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require('../controllers/cart.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/:productId', addToCart);
router.get('/', getCart);
router.patch('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);

module.exports = router;
