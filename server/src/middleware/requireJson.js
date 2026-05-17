const ApiError = require("../utils/ApiError");

function requireJson(req, res, next) {
  const methodsWithBody = ["POST", "PUT", "PATCH"];

  if (!methodsWithBody.includes(req.method)) {
    return next();
  }

  if (!req.is("application/json")) {
    return next(
      new ApiError(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Request body must be valid JSON with Content-Type: application/json."
      )
    );
  }

  next();
}

module.exports = requireJson;