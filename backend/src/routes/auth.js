const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, logout } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);

module.exports = router; 