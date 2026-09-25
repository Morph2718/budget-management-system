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

module.exports = { findByUsername, findByEmail, createUser };