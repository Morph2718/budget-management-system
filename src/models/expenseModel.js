const pool = require('../config/db');

async function createExpense({ userId, item, description, amount, occurredAt }) {
  const result = await pool.query(
    `INSERT INTO expenses (user_id, item, description, amount, occurred_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, item, description, amount, occurredAt]
  );
  return result.rows[0];
}

async function getExpensesByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY occurred_at DESC',
    [userId]
  );
  return result.rows;
}

async function getExpenseById(id) {
  const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
  return result.rows[0];
}

async function updateExpense(id, { item, description, amount, occurredAt }) {
  const result = await pool.query(
    `UPDATE expenses
     SET item = $1, description = $2, amount = $3, occurred_at = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [item, description, amount, occurredAt, id]
  );
  return result.rows[0];
}

module.exports = { createExpense, getExpensesByUser, getExpenseById, updateExpense };