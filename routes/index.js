const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const categoriesRoutes = require("./categoriesRoutes");
const productsRoutes = require("./productsRoutes");
const sizesRoutes = require("./sizesRoutes");
const colorsRoutes = require("./colorsRoutes");
const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Feature routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);
router.use("/sizes", sizesRoutes);
router.use("/colors", colorsRoutes);

module.exports = router;
