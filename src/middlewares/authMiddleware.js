const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  // Token dikirim client lewat header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1]; // ambil bagian setelah "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role } dari payload waktu login
    next(); // lanjut ke middleware/controller berikutnya
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Akses ditolak: role tidak diizinkan' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };