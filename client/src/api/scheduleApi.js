import apiClient from "./apiClient";

export async function getScheduleByDate(date) {
  const response = await apiClient.get("/schedule", {
    params: { date }
  });

  return response.data.data;
}

export async function createAppointment(payload) {
  const response = await apiClient.post("/schedule/appointments", payload);

  return response.data.data.appointment;
}

export async function updateAppointment(appointmentId, payload) {
  const response = await apiClient.put(
    `/schedule/appointments/${appointmentId}`,
    payload
  );

  return response.data.data.appointment;
}

export async function cancelAppointment(appointmentId, reason = "") {
  const response = await apiClient.patch(
    `/schedule/appointments/${appointmentId}/cancel`,
    { reason }
  );

  return response.data.data;
}