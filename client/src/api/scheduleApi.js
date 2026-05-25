import apiClient from "./apiClient";

export async function getScheduleByDate(date) {
  const response = await apiClient.get("/schedule", {
    params: { date }
  });

  return response.data.data;
}
