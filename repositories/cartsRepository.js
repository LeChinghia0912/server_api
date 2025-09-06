const { pool } = require("../config/db");

async function findActiveByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT id, user_id, status, method, created_at, updated_at
     FROM carts
     WHERE user_id = ? AND status = 'active'
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function createOrGetActiveForUser(userId) {
  await pool.query(
    `INSERT INTO carts (user_id, status, created_at, updated_at)
     VALUES (?, 'active', NOW(), NOW())
     ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`,
    [userId]
  );
  const [rows] = await pool.query(
    `SELECT id, user_id, status, method, created_at, updated_at
     FROM carts
     WHERE user_id = ? AND status = 'active'
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function ensureActiveCart(userId) {
  const existing = await findActiveByUserId(userId);
  if (existing) return existing;
  return createOrGetActiveForUser(userId);
}

async function updateMethod(cartId, method) {
  await pool.query(
    `UPDATE carts SET method = ?, updated_at = NOW() WHERE id = ? LIMIT 1`,
    [method, cartId]
  );
}

module.exports = {
  findActiveByUserId,
  createOrGetActiveForUser,
  ensureActiveCart,
  updateMethod,
};


