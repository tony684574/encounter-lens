const dotenv = require("dotenv");

dotenv.config();

const requiredEnv = [
  "DATABASE_URL",
  "FHIR_BASE_URL",
  "FHIR_BEARER_TOKEN",
  "JWT_SECRET",
  "APP_USERNAME",
  "APP_PASSWORD"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
  fhirBaseUrl: process.env.FHIR_BASE_URL,
  fhirBearerToken: process.env.FHIR_BEARER_TOKEN,
  jwtSecret: process.env.JWT_SECRET,
  appUsername: process.env.APP_USERNAME,
  appPassword: process.env.APP_PASSWORD
};
