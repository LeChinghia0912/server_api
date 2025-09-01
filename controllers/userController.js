const userService = require("../services/userService");
const ApiResponse = require("../utils/ApiResponse");
const AppError = require("../utils/AppError");
const { assertValidId } = require("../utils/validators");

async function getUsers(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.json(ApiResponse.success(users, "Users fetched successfully"));
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const user = await userService.getUserById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json(ApiResponse.success(user, "User fetched successfully"));
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) {
      throw new AppError("name and email are required", 400);
    }
    const user = await userService.createUser({ name, email });
    res
      .status(201)
      .json(ApiResponse.success(user, "User created successfully"));
  } catch (error) {
    next(error);
  }
}

async function updateUserById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const { name, email } = req.body || {};
    const updated = await userService.updateUser(id, { name, email });
    if (!updated) {
      throw new AppError("User not found", 404);
    }
    res.json(ApiResponse.success(updated, "User updated successfully"));
  } catch (error) {
    next(error);
  }
}

async function deleteUserById(req, res, next) {
  try {
    const id = assertValidId(req.params.id, 'id');
    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      throw new AppError("User not found", 404);
    }
    res.json(ApiResponse.success({ id }, "User deleted successfully"));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
};
