const productsService = require("../services/productsService");
const ApiResponse = require("../utils/ApiResponse");
const AppError = require("../utils/AppError");
const { assertValidId } = require("../utils/validators");
const { safeJsonParse } = require("../utils/parsers");

async function getProducts(req, res, next) {
  try {
    const products = await productsService.listProducts();
    res.json(ApiResponse.success(products, "Products fetched successfully"));
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const product = await productsService.getProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    } else {
      res.json(ApiResponse.success(product, "Product fetched successfully"));
    }
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, description, price, stock, category_id } = req.body || {};
    // Variants can be provided as JSON string or array
    const variants = safeJsonParse(req.body?.variants, req.body?.variants);
    
    // Xử lý image_url từ file upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const product = await productsService.createProduct({
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
      variants,
    });
    res
      .status(201)
      .json(ApiResponse.success(product, "Product created successfully"));
  } catch (error) {
    next(error);
  }
}

async function updateProductById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const { name, description, price, stock, category_id } = req.body || {};
    // Variants can be provided as JSON string or array
    const variants = safeJsonParse(req.body?.variants, req.body?.variants);
    
    // Xử lý image_url từ file upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const updated = await productsService.updateProductById(id, {
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
      variants,
    });
    if (!updated) {
      throw new AppError("Product not found", 404);
    } else {
      res.json(ApiResponse.success(updated, "Product updated successfully"));
    }
  } catch (error) {
    next(error);
  }
}

async function deleteProductById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const deleted = await productsService.deleteProduct(id);
    if (!deleted) {
      throw new AppError("Product not found", 404);
    }
    res.json(ApiResponse.success({ id }, "Product deleted successfully"));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};
