const ApiResponse = require("../utils/ApiResponse");

function notFoundHandler(req, res, next) {
  res.status(404).json(ApiResponse.error("Route not found", 404));
}

module.exports = { notFoundHandler };
