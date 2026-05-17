const { fhirRequest } = require("./fhirClient");
const {
  mapFhirPatientToDto,
  mapDtoToFhirPatient
} = require("../../utils/fhirPatientMapper");
const ApiError = require("../../utils/ApiError");

async function listPatients({ name, includeInactive = false, limit = 20 }) {
  const params = new URLSearchParams();

  params.set("_count", String(limit));

  if (name) {
    params.set("name", name);
  }

  const bundle = await fhirRequest({
    method: "GET",
    url: `/Patient?${params.toString()}`
  });

  const patients = (bundle.entry || [])
    .map((entry) => entry.resource)
    .filter((patient) => includeInactive || patient.active !== false)
    .map(mapFhirPatientToDto);

  return patients;
}

async function getPatientById(patientId) {
  const patient = await fhirRequest({
    method: "GET",
    url: `/Patient/${patientId}`
  });

  if (!patient || patient.resourceType !== "Patient") {
    throw new ApiError(404, "NOT_FOUND", "Patient was not found.");
  }

  return mapFhirPatientToDto(patient);
}

async function getRawPatientById(patientId) {
  const patient = await fhirRequest({
    method: "GET",
    url: `/Patient/${patientId}`
  });

  if (!patient || patient.resourceType !== "Patient") {
    throw new ApiError(404, "NOT_FOUND", "Patient was not found.");
  }

  return patient;
}

async function createPatient(payload) {
  const fhirPatient = mapDtoToFhirPatient(payload);

  const created = await fhirRequest({
    method: "POST",
    url: "/Patient",
    data: fhirPatient
  });

  return mapFhirPatientToDto(created);
}

async function updatePatient(patientId, payload) {
  const existingPatient = await getRawPatientById(patientId);
  const updatedPayload = mapDtoToFhirPatient(payload, existingPatient);

  const updated = await fhirRequest({
    method: "PUT",
    url: `/Patient/${patientId}`,
    data: updatedPayload
  });

  return mapFhirPatientToDto(updated);
}

async function softDeletePatient(patientId) {
  const existingPatient = await getRawPatientById(patientId);

  const updated = await fhirRequest({
    method: "PUT",
    url: `/Patient/${patientId}`,
    data: {
      ...existingPatient,
      active: false
    }
  });

  return mapFhirPatientToDto(updated);
}

module.exports = {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
  softDeletePatient
};
