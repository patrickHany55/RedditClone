import api from "../api/axios";

export const getCurrentUser = () => {
  return api.get("/users/me");
};

export const getUserProfile = (username) => {
  return api.get(`/users/${username}`);
};

export const searchUsers = (username) => {
  return api.get(`/users/search?username=${encodeURIComponent(username)}`);
};

export const updateCurrentUser = (profile) => {
  return api.put("/users/me", profile);
};

export const uploadCurrentUserAvatar = (formData) => {
  return api.put("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
