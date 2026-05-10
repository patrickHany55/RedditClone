import api from "../api/axios";

export const getPosts = (sort) => {
  const query = sort ? `?sort=${encodeURIComponent(sort)}` : "";
  return api.get(`/posts${query}`);
};

export const getPopularPosts = () => {
  return api.get("/posts/popular");
};

export const getPostById = (postId) => {
  return api.get(`/posts/${postId}`);
};

export const getPostsByCommunity = (communityId) => {
  return api.get(`/posts/community/${communityId}`);
};

export const getSavedPosts = () => {
  return api.get("/posts/saved");
};

export const createPost = (post) => {
  return api.post("/posts", post);
};

export const votePost = (postId, type) => {
  return api.post(`/posts/${postId}/vote`, { type });
};

export const summarizePost = (postId) => {
  return api.post(`/posts/${postId}/summarize`);
};

export const deletePost = (postId) => {
  return api.delete(`/posts/${postId}`);
};

export const savePost = (postId) => {
  return api.post(`/posts/${postId}/save`);
};

export const unsavePost = (postId) => {
  return api.post(`/posts/${postId}/unsave`);
};

export const addPostComment = (postId, comment) => {
  return api.post(`/posts/${postId}/comments`, comment);
};
