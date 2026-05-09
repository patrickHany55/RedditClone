import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/ui/PostCard";
import { getSavedPosts } from "../models/postModel";
import { getErrorMessage } from "../lib/errorMessage";

function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchSavedPosts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getSavedPosts();
      setSavedPosts(response.data);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        setErrorMessage(getErrorMessage(error, "Could not load your saved posts."));
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchSavedPosts();
  }, [fetchSavedPosts, isAuthenticated, navigate]);

  const handleUnsave = (postId) => {
    // Update local state immediately for better UX
    setSavedPosts(prev => prev.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="saved-posts-container">
        <div className="loading-spinner">Loading your saved posts...</div>
      </div>
    );
  }

  return (
    <div className="saved-posts-container">
      <div className="saved-posts-header">
        <h1>Saved Posts</h1>
        <p className="saved-posts-count">
          {savedPosts.length} {savedPosts.length === 1 ? "post" : "posts"} saved
        </p>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {!errorMessage && savedPosts.length > 0 ? (
        <div className="saved-posts-feed">
          {savedPosts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onUnsave={handleUnsave}
              isSavedPage={true}
            />
          ))}
        </div>
      ) : (
        <div className="saved-posts-empty">
          <div className="empty-icon">🔖</div>
          <h2>No saved posts yet</h2>
          <p>Posts you save will appear here for easy access later.</p>
          <button 
            className="explore-btn" 
            onClick={() => navigate("/")}
          >
            Explore Posts
          </button>
        </div>
      )}
    </div>
  );
}

export default SavedPosts;
