const { authenticate } = require('../middlewares/authMiddleware');
const { register, login, updateProfile, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

module.exports = router;