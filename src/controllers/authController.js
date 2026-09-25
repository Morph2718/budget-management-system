const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

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

    // 5. Kirim response - TANPA password_hash ikut terkirim balik
    res.status(201).json({
      message: 'Registrasi berhasil',
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
 // JWT
const jwt = require('jsonwebtoken');

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    // 1. Cari user berdasarkan username
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // 2. Bandingkan password yang dikirim dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // 3. Buat JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Kirim token ke user
    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { register, login };