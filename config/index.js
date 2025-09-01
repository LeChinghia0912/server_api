const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "app_db",
    connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  },
};

module.exports = config;
