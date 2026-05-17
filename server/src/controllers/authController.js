const jwt = require("jsonwebtoken");
const {
  jwtSecret,
  appUsername,
  appPassword
} = require("../config/env");
const ApiError = require("../utils/ApiError");

async function login(req, res, next) {
  const { username, password } = req.validated.body;

  if (username !== appUsername || password !== appPassword) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid username or password.");
  }

  const user = {
    id: 1,
    username,
    role: "practitioner"
  };

  const token = jwt.sign(user, jwtSecret, { expiresIn: "8h" });

  res.json({
    success: true,
    data: {
      user,
      token
    }
  });
}

module.exports = {
  login
};
