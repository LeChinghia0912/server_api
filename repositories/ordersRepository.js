const { pool } = require("../config/db");

async function findByUser(userId) {
  const [rows] = await pool.query(
    `SELECT id, user_id, status, payment_method, total, total_quantity, created_at, updated_at
     FROM orders
     WHERE user_id = ?
     ORDER BY id DESC`,
    [userId]
  );
  return rows;
}

async function findByIdForUser(id, userId) {
  const [rows] = await pool.query(
    `SELECT id, user_id, status, payment_method, total, total_quantity, created_at, updated_at
     FROM orders
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [id, userId]
  );
  return rows[0] || null;
}

async function findItems(orderId) {
  const [rows] = await pool.query(
    `SELECT oi.id, oi.order_id, oi.variant_id, oi.quantity, oi.price
     FROM order_items oi
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [orderId]
  );
  return rows;
}

async function createFromCart(userId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get active cart
    const [cartRows] = await connection.query(
      `SELECT id, method FROM carts WHERE user_id = ? AND status = 'active' LIMIT 1`,
      [userId]
    );
    const cart = cartRows && cartRows[0];
    if (!cart) {
      await connection.rollback();
      return null;
    }

    // Load cart items
    const [items] = await connection.query(
      `SELECT id, variant_id, quantity FROM cart_items WHERE cart_id = ? ORDER BY id ASC`,
      [cart.id]
    );
    if (!items || items.length === 0) {
      await connection.rollback();
      return null;
    }

    // Fetch variants with price/stock
    const variantIds = items.map(i => i.variant_id);
    const placeholders = variantIds.map(() => '?').join(',');
    const [variantRows] = await connection.query(
      `SELECT id, product_id, stock, price FROM product_variants WHERE id IN (${placeholders}) FOR UPDATE`,
      variantIds
    );
    const variantById = {};
    variantRows.forEach(v => { variantById[v.id] = v; });

    // Validate stock and compute totals
    let total = 0;
    let totalQuantity = 0;
    for (const item of items) {
      const variant = variantById[item.variant_id];
      if (!variant) throw new Error(`Variant not found: ${item.variant_id}`);
      if (variant.stock < item.quantity) throw new Error(`Insufficient stock for variant ${item.variant_id}`);
      const lineTotal = Number(variant.price) * Number(item.quantity);
      total += lineTotal;
      totalQuantity += Number(item.quantity);
    }

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total, total_quantity, status, payment_method, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', ?, NOW(), NOW())`,
      [userId, total, totalQuantity, cart.method || null]
    );
    const orderId = orderResult.insertId;

    // Insert order_items and decrement stock
    for (const item of items) {
      const variant = variantById[item.variant_id];
      await connection.query(
        `INSERT INTO order_items (order_id, variant_id, quantity, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [orderId, item.variant_id, item.quantity, variant.price]
      );
      await connection.query(
        `UPDATE product_variants SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.variant_id]
      );
    }

    // Remove cart to avoid unique constraint conflicts on status
    await connection.query(`DELETE FROM carts WHERE id = ?`, [cart.id]);

    await connection.commit();
    return { id: orderId, user_id: userId, status: 'pending', total, total_quantity: totalQuantity };
  } catch (err) {
    try { await connection.rollback(); } catch (_) {}
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  findByUser,
  findByIdForUser,
  findItems,
  createFromCart,
  async findWithUserById(id) {
    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, u.name AS user_name, u.email AS user_email, o.total, o.total_quantity, o.status, o.payment_method, o.created_at, o.updated_at
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },
  async updateStatusIfCurrent(id, fromStatus, toStatus) {
    const [result] = await pool.query(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ? AND status = ?`,
      [toStatus, id, fromStatus]
    );
    return result.affectedRows || 0;
  },
  async findAllWithUsers() {
    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, u.name AS user_name, u.email AS user_email, o.total, o.total_quantity, o.status, o.payment_method, o.created_at, o.updated_at
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.id DESC`
    );
    return rows;
  },
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, user_id, total, total_quantity, status, payment_method, created_at, updated_at
       FROM orders
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },
};


