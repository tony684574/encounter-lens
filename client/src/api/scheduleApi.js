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