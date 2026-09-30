const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const activityLogModel = require('../models/activityLogModel');

async function register(req, res) {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    // 1. Validasi dasar - semua field wajib diisi
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    // 2. Cek apakah email atau username sudah dipakai
    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username sudah dipakai' });
    }

    // 3. Hash password - JANGAN pernah simpan password asli
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Simpan ke database
    const newUser = await userModel.createUser({
      firstName,
      lastName,
      email,
      username,
      passwordHash,
    });
    
    await activityLogModel.logActivity({
      userId: newUser.id,
      action: 'register',
      entity: 'user',
      entityId: newUser.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // 5. Kirim response - TANPA password_hash ikut terkirim balik
    res.status(201).json({
      message: 'Registrasi berhasil',
      user: newUser,
    });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal register user');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
 // JWT
const jwt = require('jsonwebtoken');

// Activity Log & Logging
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const user = await userModel.findByUsername(username);
    if (!user) {
      await activityLogModel.logActivity({
        userId: null,
        action: 'login_failed',
        entity: 'user',
        entityId: null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      await activityLogModel.logActivity({
        userId: user.id,
        action: 'login_failed',
        entity: 'user',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    await activityLogModel.logActivity({
      userId: user.id,
      action: 'login_success',
      entity: 'user',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal login user');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function updateProfile(req, res) {
  try {
    const { firstName, lastName, email, newPassword } = req.body;
    const userId = req.user.userId;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Nama dan email wajib diisi' });
    }

    // Kalau user mau ganti email, cek dulu email baru tidak dipakai user lain
    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail && existingEmail.id !== userId) {
      return res.status(409).json({ error: 'Email sudah dipakai user lain' });
    }

    let passwordHash = null;
    if (newPassword) {
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await userModel.updateProfile(userId, {
      firstName,
      lastName,
      email,
      passwordHash,
    });

    res.status(200).json({ message: 'Profil berhasil diperbarui', user: updatedUser });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal memperbarui profil');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

function logout(req, res) {
  // Untuk JWT, logout sesungguhnya dilakukan di sisi client (hapus token tersimpan).
  // Endpoint ini konfirmasi saja + nanti dicatat ke activity_logs.
  res.status(200).json({ message: 'Logout berhasil' });
}

module.exports = { register, login, updateProfile, logout };
