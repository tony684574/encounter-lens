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
