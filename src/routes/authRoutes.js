const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { register, login, updateProfile, logout } = require('../controllers/authController');
const { getProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

module.exports = router;