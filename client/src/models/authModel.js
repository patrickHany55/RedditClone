import api from "../api/axios";

export const loginUser = (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const registerUser = (username, email, password) => {
  return api.post("/auth/register", { username, email, password });
};
