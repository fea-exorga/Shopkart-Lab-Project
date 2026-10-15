const express = require('express');

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} = require('../controllers/wishlist.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/:productId', addToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
