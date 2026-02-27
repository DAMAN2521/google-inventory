const express = require('express');
const router = express.Router();
const { login, logout, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
