const authService = require("../services/authService");
const ApiResponse = require("../utils/ApiResponse");
const AppError = require("../utils/AppError");
const { setAuthCookie } = require("../utils/authCookie");

async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, date_of_birth, gender, province, district, ward, address } = req.body || {};
    if (!name || !email || !password) {
      throw new AppError("name, email and password are required", 400);
    }
    // basic validations
    if (phone && !/^\+?\d{8,15}$/.test(String(phone))) {
      throw new AppError("Invalid phone number", 400);
    }
    if (gender && !['male','female','other'].includes(String(gender))) {
      throw new AppError("Invalid gender", 400);
    }
    if (date_of_birth && isNaN(Date.parse(date_of_birth))) {
      throw new AppError("Invalid date_of_birth", 400);
    }
    const result = await authService.register({ name, email, password, role, phone, date_of_birth, gender, province, district, ward, address });
    setAuthCookie(res, result.token);
    res.status(201).json(ApiResponse.success(result, "User registered successfully"));
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      throw new AppError("email and password are required", 400);
    }
    const result = await authService.login({ email, password });
    setAuthCookie(res, result.token);
    res.json(ApiResponse.success(result, "Logged in successfully"));
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };


