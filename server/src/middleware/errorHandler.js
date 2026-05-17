const ApiError = require("../utils/ApiError");

function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Request body contains malformed JSON.",
        details: []
      }
    });
  }

  const isKnownError = err instanceof ApiError;

  const statusCode = isKnownError ? err.statusCode : 500;
  const code = isKnownError ? err.code : "SYSTEM_ERROR";
  const message = isKnownError
    ? err.message
    : "Something went wrong. Please try again or contact support.";

  if (process.env.NODE_ENV !== "test") {
    console.error({
      code,
      message: err.message,
      path: req.originalUrl,
      method: req.method
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: isKnownError ? err.details : []
    }
  });
}

module.exports = errorHandler;