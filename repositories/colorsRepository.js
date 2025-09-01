const { pool } = require("../config/db");

async function findAll() {
    const [rows] = await pool.query(
        `SELECT id, name FROM colors ORDER BY name ASC`
    );
    return rows;
}

async function create({ name }) {
    const [result] = await pool.query(
        `INSERT INTO colors (name) VALUES (?)`,
        [name]
    );
    const [rows] = await pool.query(`SELECT id, name FROM colors WHERE id = ?`, [result.insertId]);
    return rows[0] || null;
}

async function remove(id) {
    const [result] = await pool.query(`DELETE FROM colors WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

async function findByName(name) {
    const [rows] = await pool.query(`SELECT id, name FROM colors WHERE name = ? LIMIT 1`, [name]);
    return rows[0] || null;
}

module.exports = { findAll, create, remove, findByName };


