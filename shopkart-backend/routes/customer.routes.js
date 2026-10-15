const express = require('express');

const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/customer.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

module.exports = router;