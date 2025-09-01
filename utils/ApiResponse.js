class ApiResponse {
  static success(data, message = "Success") {
    return { success: true, message, data };
  }

  static error(message = "Error", statusCode = 500, details = undefined) {
    const response = { success: false, message, statusCode };
    if (details) response.details = details;
    return response;
  }
}

module.exports = ApiResponse;
