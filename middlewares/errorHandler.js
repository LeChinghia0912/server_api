const ApiResponse = require("../utils/ApiResponse");
const AppError = require("../utils/AppError");

function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status =
    err instanceof AppError && err.statusCode ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  if (process.env.NODE_ENV !== "test") {
    // Minimal logging; replace with a proper logger in production
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json(ApiResponse.error(message, status));
}

module.exports = { errorHandler };
