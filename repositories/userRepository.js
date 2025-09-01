const { pool } = require("../config/db");

async function findAll() {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, phone, date_of_birth, gender, province, district, ward, address, created_at, updated_at FROM users ORDER BY id ASC"
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, phone, date_of_birth, gender, province, district, ward, address, created_at, updated_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email, options = { includePassword: false }) {
  const columns = options.includePassword
    ? "id, name, email, password, role, phone, date_of_birth, gender, province, district, ward, address, created_at, updated_at"
    : "id, name, email, role, phone, date_of_birth, gender, province, district, ward, address, created_at, updated_at";
  const [rows] = await pool.query(
    `SELECT ${columns} FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function create(payload) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, role, phone, date_of_birth, gender, province, district, ward, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      payload.name,
      payload.email,
      payload.password,
      payload.role || 'customer',
      payload.phone || null,
      payload.date_of_birth || null,
      payload.gender || null,
      payload.province || null,
      payload.district || null,
      payload.ward || null,
      payload.address || null,
    ]
  );
  return {
    id: result.insertId,
    name: payload.name,
    email: payload.email,
    role: payload.role || 'customer',
    phone: payload.phone || null,
    date_of_birth: payload.date_of_birth || null,
    gender: payload.gender || null,
    province: payload.province || null,
    district: payload.district || null,
    ward: payload.ward || null,
    address: payload.address || null,
  };
}

async function update(id, payload) {
  const fields = [];
  const values = [];
  if (payload.name !== undefined) {
    fields.push("name = ?");
    values.push(payload.name);
  }
  if (payload.email !== undefined) {
    fields.push("email = ?");
    values.push(payload.email);
  }
  if (payload.password !== undefined) {
    fields.push("password = ?");
    values.push(payload.password);
  }
  if (payload.phone !== undefined) {
    fields.push("phone = ?");
    values.push(payload.phone);
  }
  if (payload.date_of_birth !== undefined) {
    fields.push("date_of_birth = ?");
    values.push(payload.date_of_birth);
  }
  if (payload.gender !== undefined) {
    fields.push("gender = ?");
    values.push(payload.gender);
  }
  if (payload.province !== undefined) {
    fields.push("province = ?");
    values.push(payload.province);
  }
  if (payload.district !== undefined) {
    fields.push("district = ?");
    values.push(payload.district);
  }
  if (payload.ward !== undefined) {
    fields.push("ward = ?");
    values.push(payload.ward);
  }
  if (payload.address !== undefined) {
    fields.push("address = ?");
    values.push(payload.address);
  }
  if (payload.role !== undefined) {
    fields.push("role = ?");
    values.push(payload.role);
  }
  if (fields.length === 0) {
    const user = await findById(id);
    return user; // nothing to update
  }
  values.push(id);
  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await pool.query(sql, values);
  if (result.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByEmail, create, update, remove };
