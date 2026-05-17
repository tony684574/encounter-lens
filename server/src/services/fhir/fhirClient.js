const axios = require("axios");
const { fhirBaseUrl, fhirBearerToken } = require("../../config/env");
const ApiError = require("../../utils/ApiError");

const fhirClient = axios.create({
  baseURL: fhirBaseUrl,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${fhirBearerToken}`,
    Accept: "application/fhir+json",
    "Content-Type": "application/fhir+json"
  }
});

function mapFhirError(error) {
  const status = error.response?.status || 500;

  if (status === 401 || status === 403) {
    return new ApiError(
      502,
      "FHIR_ERROR",
      "The app could not authenticate with the FHIR server."
    );
  }

  if (status === 404) {
    return new ApiError(404, "NOT_FOUND", "FHIR resource was not found.");
  }

  return new ApiError(
    502,
    "FHIR_ERROR",
    "The FHIR server could not complete the request."
  );
}

async function fhirRequest(config) {
  try {
    const response = await fhirClient(config);
    return response.data;
  } catch (error) {
    throw mapFhirError(error);
  }
}

module.exports = {
  fhirRequest
};
