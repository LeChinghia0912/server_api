const { pool } = require("../config/db");

async function findAll() {
  const [rows] = await pool.query(
    "SELECT id, name, description, created_at, updated_at FROM categories ORDER BY id ASC"
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, description, created_at, updated_at FROM categories WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function findByName(name) {
  const [rows] = await pool.query(
    "SELECT id, name, description, created_at, updated_at FROM categories WHERE name = ?",
    [name]
  );
  return rows[0] || null;
}

async function create(payload) {
  const [result] = await pool.query(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [payload.name, payload.description || null]
  );
  return findById(result.insertId);
}

async function update(id, payload) {
  const fields = [];
  const values = [];
  if (payload.name !== undefined) {
    fields.push("name = ?");
    values.push(payload.name);
  }
  if (payload.description !== undefined) {
    fields.push("description = ?");
    values.push(payload.description);
  }
  if (fields.length === 0) {
    return findById(id);
  }
  values.push(id);
  const sql = `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await pool.query(sql, values);
  if (result.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByName, create, update, remove };
