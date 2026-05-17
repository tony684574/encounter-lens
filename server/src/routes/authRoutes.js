const express = require("express");
const authController = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const wrapAsync = require("../utils/wrapAsync");
const { loginSchema } = require("../validators/authSchemas");

const router = express.Router();

router.post(
  "/login",
  validateRequest(loginSchema),
  wrapAsync(authController.login)
);

module.exports = router;
