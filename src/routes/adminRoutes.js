const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { getAllUsers } = require('../controllers/adminController');

router.get('/users', authenticate, authorize('admin', 'owner'), getAllUsers);

module.exports = router;