/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import { getJoinedCommunities } from "../models/communityModel";

const CommunityContext = createContext();

export const useCommunity = () => {
  return useContext(CommunityContext);
};

export const CommunityProvider = ({ children }) => {
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch joined communities when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchJoinedCommunities();
    } else {
      setJoinedCommunities([]);
    }
  }, [isAuthenticated]);

  const fetchJoinedCommunities = async () => {
    try {
      setLoading(true);
      const response = await getJoinedCommunities();
      const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setJoinedCommunities(list);
    } catch (error) {
      console.error("Error fetching joined communities:", error);
      setJoinedCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const addJoinedCommunity = (community) => {
    setJoinedCommunities((prev) => {
      // Check if already exists to avoid duplicates
      if (prev.some((c) => String(c._id) === String(community._id))) {
        return prev;
      }
      return [...prev, community];
    });
  };

  const removeJoinedCommunity = (communityId) => {
    setJoinedCommunities((prev) =>
      prev.filter((c) => String(c._id) !== String(communityId))
    );
  };

  const isJoined = (communityId) => {
    return joinedCommunities.some((c) => String(c._id) === String(communityId));
  };

  const value = {
    joinedCommunities,
    loading,
    fetchJoinedCommunities,
    addJoinedCommunity,
    removeJoinedCommunity,
    isJoined,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};
