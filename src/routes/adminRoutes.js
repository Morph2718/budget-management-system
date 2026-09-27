const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { getAllUsers, getAllTransactions, getDashboard } = require('../controllers/adminController');

router.get('/users', authenticate, authorize('admin', 'owner'), getAllUsers);
router.get('/transactions', authenticate, authorize('admin', 'owner'), getAllTransactions);
router.get('/dashboard', authenticate, authorize('admin', 'owner'), getDashboard);

module.exports = router;