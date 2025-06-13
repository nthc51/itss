// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to register a new user
router.post('/register', authController.register);

// Route to log in
router.post('/login', authController.login);

// Route to get current logged in user (requires token)
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;