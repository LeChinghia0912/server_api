const { pool } = require("../config/db");

async function findAll() {
    const [rows] = await pool.query(
        `SELECT id, name FROM sizes ORDER BY name ASC`
    );
    return rows;
}

async function create({ name }) {
    const [result] = await pool.query(
        `INSERT INTO sizes (name) VALUES (?)`,
        [name]
    );
    const [rows] = await pool.query(`SELECT id, name FROM sizes WHERE id = ?`, [result.insertId]);
    return rows[0] || null;
}

async function remove(id) {
    const [result] = await pool.query(`DELETE FROM sizes WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

module.exports = { findAll, create, remove };


