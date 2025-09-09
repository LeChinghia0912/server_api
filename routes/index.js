const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const categoriesRoutes = require("./categoriesRoutes");
const productsRoutes = require("./productsRoutes");
const sizesRoutes = require("./sizesRoutes");
const colorsRoutes = require("./colorsRoutes");
const cartRoutes = require("./cartRoutes");
const ordersAdminRoutes = require("./ordersAdminRoutes");
const ordersRoutes = require("./ordersRoutes");
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
router.use("/cart", cartRoutes);
router.use("/admin/orders", ordersAdminRoutes);
router.use("/orders", ordersRoutes);
// singular alias for some FE clients
router.use("/order", ordersRoutes);

module.exports = router;
