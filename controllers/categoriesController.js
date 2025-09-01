const categoriesService = require("../services/categoriesService");
const ApiResponse = require("../utils/ApiResponse");
const AppError = require("../utils/AppError");
const { assertValidId } = require("../utils/validators");

async function getCategories(req, res, next) {
  try {
    const categories = await categoriesService.listCategories();
    res.json(
      ApiResponse.success(categories, "Categories fetched successfully")
    );
  } catch (error) {
    next(error);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const category = await categoriesService.getCategoryById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    res.json(ApiResponse.success(category, "Category fetched successfully"));
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body || {};
    if (!name) {
      throw new AppError("name is required", 400);
    }
    const category = await categoriesService.createCategory({
      name,
      description,
    });
    res
      .status(201)
      .json(ApiResponse.success(category, "Category created successfully"));
  } catch (error) {
    next(error);
  }
}

async function updateCategoryById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const { name, description } = req.body || {};
    const updated = await categoriesService.updateCategory(id, {
      name,
      description,
    });
    if (!updated) {
      throw new AppError("Category not found", 404);
    }
    res.json(ApiResponse.success(updated, "Category updated successfully"));
  } catch (error) {
    next(error);
  }
}

async function deleteCategoryById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const deleted = await categoriesService.deleteCategory(id);
    if (!deleted) {
      throw new AppError("Category not found", 404);
    }
    res.json(ApiResponse.success({ id }, "Category deleted successfully"));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};
