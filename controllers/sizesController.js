const sizesService = require("../services/sizesService");
const ApiResponse = require("../utils/ApiResponse");
const { assertValidId } = require("../utils/validators");

async function getSizes(req, res, next) {
  try {
    const rows = await sizesService.listSizes();
    res.json(ApiResponse.success(rows, "Sizes fetched successfully"));
  } catch (e) {
    next(e);
  }
}

async function createSize(req, res, next) {
  try {
    const { name } = req.body || {};
    const created = await sizesService.createSize({ name });
    res.status(201).json(ApiResponse.success(created, "Size created successfully"));
  } catch (e) {
    next(e);
  }
}

async function deleteSize(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const ok = await sizesService.deleteSize(id);
    if (!ok) return res.status(404).json(ApiResponse.error("Size not found", 404));
    res.json(ApiResponse.success({ id }, "Size deleted successfully"));
  } catch (e) {
    next(e);
  }
}

module.exports = { getSizes, createSize, deleteSize };


