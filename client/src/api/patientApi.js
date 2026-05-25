import apiClient from "./apiClient";

export async function getPatients({ name = "", limit = 20 } = {}) {
  const response = await apiClient.get("/patients", {
    params: {
      name: name || undefined,
      limit
    }
  });

  return response.data.data.patients;
}

export async function createPatient(payload) {
  const response = await apiClient.post("/patients", payload);

  return response.data.data.patient;
}

export async function updatePatient(patientId, payload) {
  const response = await apiClient.put(`/patients/${patientId}`, payload);

  return response.data.data.patient;
}

export async function deactivatePatient(patientId) {
  const response = await apiClient.patch(`/patients/${patientId}/soft-delete`);

  return response.data.data;
}