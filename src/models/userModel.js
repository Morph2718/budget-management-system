const pool = require('../config/db');

async function findByUsername(username) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0]; // undefined kalau tidak ketemu
}

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

async function createUser({ firstName, lastName, email, username, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, username, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, email, username, role, created_at`,
    [firstName, lastName, email, username, passwordHash]
  );
  return result.rows[0];
}

async function updateProfile(userId, { firstName, lastName, email, passwordHash }) {
  // passwordHash bersifat opsional — kalau user tidak mau ganti password
  const result = await pool.query(
    `UPDATE users
     SET first_name = $1, last_name = $2, email = $3,
         password_hash = COALESCE($4, password_hash),
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, first_name, last_name, email, username, role, updated_at`,
    [firstName, lastName, email, passwordHash, userId]
  );
  return result.rows[0];
}

async function findById(userId) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

module.exports = { findByUsername, findByEmail, createUser, updateProfile, findById };