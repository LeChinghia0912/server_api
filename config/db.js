const mysql = require("mysql2/promise");
const config = require("./index");

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  queueLimit: 0,
});

async function initDb() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        category_id INT,
        image_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    // Sizes master data
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    // Colors master data
    await connection.query(`
      CREATE TABLE IF NOT EXISTS colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    // Product variants (size/color/price/stock per product)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        size_id INT NOT NULL,
        color_id INT NOT NULL,
        stock INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_variant_size FOREIGN KEY (size_id) REFERENCES sizes(id),
        CONSTRAINT fk_variant_color FOREIGN KEY (color_id) REFERENCES colors(id),
        UNIQUE KEY uniq_product_size_color (product_id, size_id, color_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        status ENUM('active','ordered') NOT NULL DEFAULT 'active',
        method TINYINT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_status (user_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    // Backfill for existing DBs that may not have the column yet
    const [methodCol] = await connection.query(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'carts' AND COLUMN_NAME = 'method'`,
      [config.db.database]
    );
    if (!methodCol[0] || Number(methodCol[0].cnt) === 0) {
      await connection.query(`ALTER TABLE carts ADD COLUMN method TINYINT NULL AFTER status`);
    }
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id INT NOT NULL,
        variant_id INT NOT NULL,
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        total_quantity INT NOT NULL DEFAULT 0,
        status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending',
        payment_method TINYINT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY fk_orders_user (user_id),
        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    const [pmCol] = await connection.query(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_method'`,
      [config.db.database]
    );
    if (!pmCol[0] || Number(pmCol[0].cnt) === 0) {
      await connection.query(`ALTER TABLE orders ADD COLUMN payment_method TINYINT NULL AFTER status`);
    }
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        variant_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY fk_order_items_order (order_id),
        KEY fk_order_items_variant (variant_id),
        CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    if (process.env.NODE_ENV !== "test") {
      // eslint-disable-next-line no-console
      console.log("MySQL connected and ensured tables exist");
    }
  } finally {
    connection.release();
  }
}

module.exports = { pool, initDb };
