import api from "../api/axios";

export const voteComment = (commentId, type) => {
  return api.post(`/comments/${commentId}/vote`, { type });
};

export const deleteComment = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};
