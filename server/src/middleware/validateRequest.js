const ApiError = require("../utils/ApiError");

function validateRequest(schema) {
  return function validationMiddleware(req, res, next) {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }));

      return next(
        new ApiError(
          400,
          "VALIDATION_ERROR",
          details[0]?.message || "Invalid request.",
          details
        )
      );
    }

    req.validated = result.data;
    next();
  };
}

module.exports = validateRequest;
