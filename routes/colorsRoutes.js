const express = require("express");
const colorsController = require("../controllers/colorsController");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.get("/", requireAuth, colorsController.getColors);
router.post("/", requireAuth, requireAdmin, colorsController.createColor);
router.delete("/:id", requireAuth, requireAdmin, colorsController.deleteColor);

module.exports = router;


