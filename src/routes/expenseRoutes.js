const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { create, getAll, update } = require('../controllers/expenseController');

router.post('/', authenticate, create);
router.get('/', authenticate, getAll);
router.put('/:id', authenticate, update);

module.exports = router;