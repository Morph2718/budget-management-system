const pool = require('../config/db');

async function createIncome({ userId, source, description, amount, occurredAt }) {
  const result = await pool.query(
    `INSERT INTO incomes (user_id, source, description, amount, occurred_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, source, description, amount, occurredAt]
  );
  return result.rows[0];
}

async function getIncomesByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM incomes WHERE user_id = $1 ORDER BY occurred_at DESC',
    [userId]
  );
  return result.rows;
}

async function getIncomeById(id) {
  const result = await pool.query('SELECT * FROM incomes WHERE id = $1', [id]);
  return result.rows[0];
}

async function updateIncome(id, { source, description, amount, occurredAt }) {
  const result = await pool.query(
    `UPDATE incomes
     SET source = $1, description = $2, amount = $3, occurred_at = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [source, description, amount, occurredAt, id]
  );
  return result.rows[0];
}

async function getTotalIncomeByUser(userId) {
  const result = await pool.query(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM incomes WHERE user_id = $1',
    [userId]
  );
  return parseFloat(result.rows[0].total);
}

async function getAllIncomes() {
  const result = await pool.query(
    `SELECT incomes.*, users.username, users.first_name, users.last_name
     FROM incomes
     JOIN users ON incomes.user_id = users.id
     ORDER BY incomes.occurred_at DESC`
  );
  return result.rows;
}

async function getTotalIncomeAll() {
  const result = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM incomes');
  return parseFloat(result.rows[0].total);
}

module.exports = { createIncome, getIncomesByUser, getIncomeById, updateIncome, getTotalIncomeByUser, getAllIncomes, getTotalIncomeAll };