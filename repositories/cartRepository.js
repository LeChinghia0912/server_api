const { pool } = require("../config/db");

async function findByCartId(cartId) {
  const [rows] = await pool.query(
    `SELECT id, cart_id, variant_id, quantity, created_at, updated_at
     FROM cart_items
     WHERE cart_id = ?
     ORDER BY id ASC`,
    [cartId]
  );
  return rows;
}

async function findByIdForCart(id, cartId) {
  const [rows] = await pool.query(
    `SELECT id, cart_id, variant_id, quantity, created_at, updated_at
     FROM cart_items
     WHERE id = ? AND cart_id = ?
     LIMIT 1`,
    [id, cartId]
  );
  return rows[0] || null;
}

async function upsert(cartId, variantId, quantityDelta) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ? LIMIT 1`,
      [cartId, variantId]
    );
    if (rows && rows[0]) {
      const item = rows[0];
      const newQty = Math.max(0, Number(item.quantity || 0) + Number(quantityDelta || 0));
      if (newQty === 0) {
        await connection.query(`DELETE FROM cart_items WHERE id = ?`, [item.id]);
        await connection.commit();
        return null;
      }
      await connection.query(`UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?`, [newQty, item.id]);
      const [updatedRows] = await connection.query(`SELECT id, cart_id, variant_id, quantity, created_at, updated_at FROM cart_items WHERE id = ?`, [item.id]);
      await connection.commit();
      return updatedRows[0] || null;
    } else {
      const qty = Math.max(0, Number(quantityDelta || 0));
      if (qty === 0) {
        await connection.rollback();
        return null;
      }
      const [result] = await connection.query(
        `INSERT INTO cart_items (cart_id, variant_id, quantity, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [cartId, variantId, qty]
      );
      const [createdRows] = await connection.query(`SELECT id, cart_id, variant_id, quantity, created_at, updated_at FROM cart_items WHERE id = ?`, [result.insertId]);
      await connection.commit();
      return createdRows[0] || null;
    }
  } catch (err) {
    try { await connection.rollback(); } catch (_) {}
    throw err;
  } finally {
    connection.release();
  }
}

async function updateQuantity(id, cartId, quantity) {
  const q = Math.max(0, Number(quantity || 0));
  if (q === 0) {
    const [result] = await pool.query(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [id, cartId]);
    return result.affectedRows > 0 ? null : null;
  }
  const [result] = await pool.query(`UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND cart_id = ?`, [q, id, cartId]);
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query(`SELECT id, cart_id, variant_id, quantity, created_at, updated_at FROM cart_items WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function remove(id, cartId) {
  const [result] = await pool.query(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [id, cartId]);
  return result.affectedRows > 0;
}

async function clear(cartId) {
  await pool.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
  return true;
}

module.exports = {
  findByCartId,
  findByIdForCart,
  upsert,
  updateQuantity,
  remove,
  clear,
};


