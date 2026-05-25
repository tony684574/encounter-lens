const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { clientOrigin } = require("./config/env");
const apiRateLimiter = require("./middleware/rateLimiter");
const authMiddleware = require("./middleware/authMiddleware");
const requireJson = require("./middleware/requireJson");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const auditRoutes = require("./routes/auditRoutes");
const dbHealthRoutes = require("./routes/dbHealthRoutes");

const app = express();

app.use(helmet());

app.use(cors({
  origin: clientOrigin,
  credentials: true
}));

app.use(requireJson);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(apiRateLimiter);

app.get("/healthcheck", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "encounter-lens-api"
    }
  });
});

app.use("/api/auth", authRoutes);

app.use("/healthcheck/db", dbHealthRoutes);
app.use(authMiddleware);

app.use("/api/patients", patientRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/audit-logs", auditRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, "NOT_FOUND", "Route was not found."));
});

app.use(errorHandler);

module.exports = app;
