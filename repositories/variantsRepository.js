const { pool } = require("../config/db");

async function listByProductId(productId) {
    const [rows] = await pool.query(
        `SELECT v.id, v.product_id, v.size_id, s.name AS size_name, v.color_id, c.name AS color_name, v.stock, v.price
         FROM product_variants v
         JOIN sizes s ON s.id = v.size_id
         JOIN colors c ON c.id = v.color_id
         WHERE v.product_id = ?
         ORDER BY s.name ASC, c.name ASC`,
        [productId]
    );
    return rows;
}

async function replaceForProduct(productId, variants) {
    // Replace all variants for a product in a transaction
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(`DELETE FROM product_variants WHERE product_id = ?`, [productId]);
        if (Array.isArray(variants) && variants.length > 0) {
            const values = variants.map(v => [productId, v.size_id, v.color_id, v.stock, v.price]);
            await connection.query(
                `INSERT INTO product_variants (product_id, size_id, color_id, stock, price) VALUES ?`,
                [values]
            );
        }
        await connection.commit();
    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
    return listByProductId(productId);
}

module.exports = {
    listByProductId,
    async listByProductIds(productIds) {
        if (!Array.isArray(productIds) || productIds.length === 0) return [];
        const placeholders = productIds.map(() => '?').join(',');
        const [rows] = await pool.query(
            `SELECT v.id, v.product_id, v.size_id, s.name AS size_name, v.color_id, c.name AS color_name, v.stock, v.price
             FROM product_variants v
             JOIN sizes s ON s.id = v.size_id
             JOIN colors c ON c.id = v.color_id
             WHERE v.product_id IN (${placeholders})
             ORDER BY v.product_id ASC, s.name ASC, c.name ASC`,
            productIds
        );
        return rows;
    },
    async findByIds(variantIds) {
        if (!Array.isArray(variantIds) || variantIds.length === 0) return [];
        const placeholders = variantIds.map(() => '?').join(',');
        const [rows] = await pool.query(
            `SELECT v.id, v.product_id, v.size_id, s.name AS size_name, v.color_id, c.name AS color_name, v.stock, v.price
             FROM product_variants v
             JOIN sizes s ON s.id = v.size_id
             JOIN colors c ON c.id = v.color_id
             WHERE v.id IN (${placeholders})
             ORDER BY v.product_id ASC, s.name ASC, c.name ASC`,
            variantIds
        );
        return rows;
    },
    replaceForProduct,
};


