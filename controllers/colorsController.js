const colorsService = require("../services/colorsService");
const ApiResponse = require("../utils/ApiResponse");
const { assertValidId } = require("../utils/validators");

async function getColors(req, res, next) {
  try {
    const rows = await colorsService.listColors();
    res.json(ApiResponse.success(rows, "Colors fetched successfully"));
  } catch (e) {
    next(e);
  }
}

async function createColor(req, res, next) {
  try {
    const { name } = req.body || {};
    const created = await colorsService.createColor({ name });
    res.status(201).json(ApiResponse.success(created, "Color created successfully"));
  } catch (e) {
    next(e);
  }
}

async function deleteColor(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const ok = await colorsService.deleteColor(id);
    if (!ok) return res.status(404).json(ApiResponse.error("Color not found", 404));
    res.json(ApiResponse.success({ id }, "Color deleted successfully"));
  } catch (e) {
    next(e);
  }
}

module.exports = { getColors, createColor, deleteColor };


