import api from "../api/axios";

export const getCommunities = () => {
  return api.get("/communities");
};

export const createCommunity = (community) => {
  return api.post("/communities", community);
};

export const getJoinedCommunities = () => {
  return api.get("/communities/user/joined");
};

export const getCommunityStats = (communityId) => {
  return api.get(`/communities/${communityId}/stats`);
};

export const recordCommunityVisit = (communityId) => {
  return api.post(`/communities/${communityId}/visit`);
};

export const joinCommunity = (communityId) => {
  return api.post(`/communities/${communityId}/join`);
};

export const leaveCommunity = (communityId) => {
  return api.post(`/communities/${communityId}/leave`);
};

export const deleteCommunity = (communityId) => {
  return api.delete(`/communities/${communityId}`);
};

export const searchCommunities = (query) => {
  return api.get(`/communities/search?q=${encodeURIComponent(query)}`);
};
