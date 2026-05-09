import PostCard from "../components/ui/PostCard.jsx";
import { useState, useEffect } from "react";
import { useCommunity } from "../context/CommunityContext";
import { getCommunities, joinCommunity } from "../models/communityModel";
import { getPosts } from "../models/postModel";
import { getErrorMessage } from "../lib/errorMessage";

// Helper to get community emoji icon
const getCommunityIcon = (name) => {
  const icons = {
    gaming: "🎮",
    technology: "💻",
    science: "🔬",
    movies: "🎬",
    funny: "😂",
    music: "🎵",
    books: "📚",
    travel: "✈️",
    food: "🍔",
    art: "🎨",
    fitness: "💪",
    programming: "👨‍💻",
    minecraft: "🎮",
    eldenring: "🎮",
    pcgaming: "🖥️",
    hardware: "💻",
    software: "💾",
    television: "📺",
    strangerthings: "📺",
    marvel: "🦸",
    memes: "😂",
    askreddit: "❓",
    space: "🚀",
    biology: "🧬",
    nba: "🏀",
    soccer: "⚽",
    photography: "📷",
    earthporn: "🌍",
    cryptocurrency: "💰",
    investing: "📈",
    wallstreetbets: "💹",
    cooking: "🍳"
  };
  return icons[name.toLowerCase()] || "📌";
};

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Hot');
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [popularCommunitiesLoading, setPopularCommunitiesLoading] = useState(true);
  const [popularCommunitiesError, setPopularCommunitiesError] = useState(false);
  const [error, setError] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const { fetchJoinedCommunities, isJoined, joinedCommunities } = useCommunity();

  useEffect(() => {
    async function fetchPosts() {
      try {
        // Map filters to API parameters
        // Best/Hot/Popular/New/Top
        // We'll map "Popular" filter to 'hot' sorting for consistency on Home feed
        const sortMap = {
          'Best': 'best',
          'Hot': 'hot', 
          'Popular': 'popular', // or hot
          'New': 'new',
          'Top': 'top'
        };
        const sortParam = sortMap[filter] || 'new';
        
        const res = await getPosts(sortParam);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
        setError(getErrorMessage(err, "Could not load posts."));
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [filter]);

  // Fetch popular communities (excluding already joined ones)
  useEffect(() => {
    async function fetchPopularCommunities() {
      try {
        setPopularCommunitiesLoading(true);
        setPopularCommunitiesError(false);
        const res = await getCommunities();
        // Sort by member count and take top 5
        const sorted = res.data
          .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
          .slice(0, 5);
        setPopularCommunities(sorted);
      } catch (err) {
        console.error("Failed to fetch communities", err);
        setPopularCommunities([]);
        setPopularCommunitiesError(true);
      } finally {
        setPopularCommunitiesLoading(false);
      }
    }
    fetchPopularCommunities();
  }, [joinedCommunities]);

  const handleJoin = async (community) => {
    try {
      await joinCommunity(community._id);
      // Refresh joined communities from server (this will auto-update popular communities via useEffect)
      await fetchJoinedCommunities();
      } catch (err) {
        console.error("Failed to join community", err);
      alert(getErrorMessage(err, `Could not join r/${community.name}.`));
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
  };

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        <h3>Error loading posts</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="feed-wrapper">
        <div className="create-post-bar">
          <div className="user-avatar-sm"></div>
          <input 
            className="create-input" 
            placeholder="Create Post" 
            onClick={() => window.location.href='/create'}
            readOnly
          />
          <button className="icon-btn">📷</button>
          <button className="icon-btn">🔗</button>
        </div>

        <div className="filter-bar">
          <button 
            className={`filter-btn ${filter === 'Best' ? 'active' : ''}`}
            onClick={() => setFilter('Best')}
          >
            ⚡ Best
          </button>
          <button 
            className={`filter-btn ${filter === 'Hot' ? 'active' : ''}`}
            onClick={() => setFilter('Hot')}
          >
            🔥 Hot
          </button>
          <button 
            className={`filter-btn ${filter === 'Popular' ? 'active' : ''}`}
            onClick={() => setFilter('Popular')}
          >
            📈 Popular
          </button>
          <button 
            className={`filter-btn ${filter === 'New' ? 'active' : ''}`}
            onClick={() => setFilter('New')}
          >
            ✨ New
          </button>
          <button 
            className={`filter-btn ${filter === 'Top' ? 'active' : ''}`}
            onClick={() => setFilter('Top')}
          >
            ⬆️ Top
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts yet</h3>
            <p>Be the first to create one!</p>
          </div>
        ) : (
          posts.map((p) => <PostCard key={p._id} post={p} onDelete={handleDeletePost} />)
        )}
      </div>

      <div className="sidebar-right">
        {/* Premium Widget */}
        <div className="widget-card premium-widget">
          <div className="premium-bg"></div>
          <div className="widget-content">
            <div className="premium-icon">🚀</div>
            <h3>Reddit Premium</h3>
            <p>The best Reddit experience, with ad-free browsing, monthly Coins, and more!</p>
            <button className="btn-premium" onClick={() => setShowPremiumModal(true)}>
              Try Now
            </button>
          </div>
        </div>

        {/* Popular Communities Widget */}
        <div className="widget-card">
          <div className="widget-header">
            <h3>POPULAR COMMUNITIES</h3>
          </div>
          <div className="community-list">
            {popularCommunitiesLoading ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                Loading communities...
              </div>
            ) : popularCommunitiesError ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                Could not load communities.
              </div>
            ) : popularCommunities.length > 0 ? (
              popularCommunities.map((c, index) => {

                const memberCount = c.members?.length || 0;
                const joined = isJoined(c._id);
                
                return (
                  <div key={c._id} className="community-item">
                    <div className="community-info">
                      <span className="community-rank">{index + 1}</span>
                      <span className="community-icon-widget">{getCommunityIcon(c.name)}</span>
                      <div className="community-details">
                        <div className="community-name">r/{c.name}</div>
                        <div className="community-members">{memberCount} members</div>
                      </div>
                    </div>
                    <button 
                      className={`btn-join ${joined ? 'joined' : ''}`}
                      onClick={() => !joined && handleJoin(c)}
                      disabled={joined}
                    >
                      {joined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                No communities to suggest.
              </div>
            )}
          </div>
          <button className="btn-view-all">View All</button>
        </div>

        {/* Footer */}
        <div className="footer-links">
          <a href="#">User Agreement</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Content Policy</a>
          <a href="#">Moderator Code of Conduct</a>
          <div className="footer-copyright">Reddit Inc © 2024. All rights reserved</div>
        </div>
      </div>

      {showPremiumModal && (
        <div className="modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="modal-content premium-confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="premium-modal-close"
              type="button"
              onClick={() => setShowPremiumModal(false)}
              aria-label="Close premium confirmation"
            >
              &times;
            </button>
            <div className="premium-modal-icon">P</div>
            <h2>Welcome to Premium</h2>
            <p>
              Thank you for joining our premium family. Your support helps unlock a better,
              ad-free experience and keeps the community growing.
            </p>
            <div className="premium-modal-note">Unlock Premium access for just 5 marks.</div>
            <button className="btn-premium premium-modal-action" onClick={() => setShowPremiumModal(false)}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
