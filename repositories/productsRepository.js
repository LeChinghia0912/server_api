const { pool } = require("../config/db");

async function findAll() {
    const [rows] = await pool.query(
        "SELECT id, name, description, price, stock, category_id, image_url, created_at, updated_at FROM products ORDER BY id ASC"
    );
    return rows;
}

async function findById(id) {
    const [rows] = await pool.query(
        "SELECT id, name, description, price, stock, category_id, image_url, created_at, updated_at FROM products WHERE id = ?",
        [id]
    );
    return rows[0] || null;
}

async function create(payload) {
    const {name, description, price, stock, category_id, image_url} = payload;
    const [result] = await pool.query(
        "INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        [name, description, price, stock, category_id, image_url]
    );
    return findById(result.insertId);
}

async function update(id, payload) {
    const fields = [];
    const values = [];
    if (payload.name !== undefined) { fields.push('name = ?'); values.push(payload.name); }
    if (payload.description !== undefined) { fields.push('description = ?'); values.push(payload.description); }
    if (payload.price !== undefined) { fields.push('price = ?'); values.push(payload.price); }
    if (payload.stock !== undefined) { fields.push('stock = ?'); values.push(payload.stock); }
    if (payload.category_id !== undefined) { fields.push('category_id = ?'); values.push(payload.category_id); }
    if (payload.image_url !== undefined) { fields.push('image_url = ?'); values.push(payload.image_url); }
    if (fields.length === 0) return findById(id);
    values.push(id);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) return null;
    return findById(id);
}

async function remove(id) {
    // Ensure variants are removed first to satisfy FK constraints even if CASCADE isn't present
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query("DELETE FROM product_variants WHERE product_id = ?", [id]);
        const [result] = await connection.query("DELETE FROM products WHERE id = ?", [id]);
        await connection.commit();
        return result.affectedRows > 0;
    } catch (err) {
        try { await connection.rollback(); } catch (_) {}
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
}