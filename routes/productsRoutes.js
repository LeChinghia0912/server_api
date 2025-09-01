const express = require("express");
const productsController = require("../controllers/productsController");
const variantsRepository = require("../repositories/variantsRepository");
const { uploadSingle, handleUploadError } = require("../middlewares/uploadMiddleware");
const { assertValidId } = require("../utils/validators");
const { safeJsonParse, normalizeVariantsInput } = require("../utils/parsers");

const router = express.Router();

router.get("/", productsController.getProducts);
router.get("/:id", productsController.getProductById);
router.post("/", uploadSingle, handleUploadError, productsController.createProduct);
router.put("/:id", uploadSingle, handleUploadError, productsController.updateProductById);
router.delete("/:id", productsController.deleteProductById);

// Variants endpoints
router.get("/:id/variants", async (req, res, next) => {
  try {
    const id = assertValidId(req.params.id, 'id');
    const rows = await variantsRepository.listByProductId(id);
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

router.put("/:id/variants", async (req, res, next) => {
  try {
    const id = assertValidId(req.params.id, 'id');
    const variantsRaw = req.body && req.body.variants;
    const parsed = safeJsonParse(variantsRaw, variantsRaw);
    const normalized = Array.isArray(parsed) ? normalizeVariantsInput(parsed) : [];
    const rows = await variantsRepository.replaceForProduct(id, normalized);
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

module.exports = router;