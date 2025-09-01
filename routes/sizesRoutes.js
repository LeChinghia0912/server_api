const express = require("express");
const sizesController = require("../controllers/sizesController");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.get("/", requireAuth, sizesController.getSizes);
router.post("/", requireAuth, requireAdmin, sizesController.createSize);
router.delete("/:id", requireAuth, requireAdmin, sizesController.deleteSize);

module.exports = router;


