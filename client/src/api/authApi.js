import apiClient from "./apiClient";

export async function loginUser({ username, password }) {
  const response = await apiClient.post("/auth/login", {
    username,
    password
  });

  return response.data.data;
}
