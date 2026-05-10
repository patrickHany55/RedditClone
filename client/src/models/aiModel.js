import api from "../api/axios";

export const askAI = (question) => {
  return api.post("/ai/ask", { question });
};
