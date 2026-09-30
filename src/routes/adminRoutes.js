const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { getAllUsers, getAllTransactions, getDashboard } = require('../controllers/adminController');
const { deleteUser } = require('../controllers/adminController');
const { getLogs } = require('../controllers/adminController');

router.get('/users', authenticate, authorize('admin', 'owner'), getAllUsers);
router.get('/transactions', authenticate, authorize('admin', 'owner'), getAllTransactions);
router.get('/dashboard', authenticate, authorize('admin', 'owner'), getDashboard);
router.get('/logs', authenticate, authorize('admin', 'owner'), getLogs);
router.delete('/users/:id', authenticate, authorize('owner'), deleteUser);

module.exports = router;