const pool = require('../config/db');

async function logActivity({ userId, action, entity, entityId, ipAddress, userAgent }) {
  await pool.query(
    `INSERT INTO activity_logs (user_id, action, entity, entity_id, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, action, entity, entityId, ipAddress, userAgent]
  );
}

async function getAllLogs() {
  const result = await pool.query(
    `SELECT activity_logs.*, users.username
     FROM activity_logs
     LEFT JOIN users ON activity_logs.user_id = users.id
     ORDER BY activity_logs.created_at DESC
     LIMIT 100`
  );
  return result.rows;
}

module.exports = { logActivity, getAllLogs };