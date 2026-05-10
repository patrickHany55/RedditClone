import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { getCommunities } from '../../models/communityModel';

function Sidebar() {
  const { joinedCommunities } = useCommunity();
  const location = useLocation();
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [loadingPopularCommunities, setLoadingPopularCommunities] = useState(true);

  useEffect(() => {
    async function fetchPopularCommunities() {
      try {
        setLoadingPopularCommunities(true);
        const response = await getCommunities();
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        const topCommunities = list
          .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
          .slice(0, 5);
        setPopularCommunities(topCommunities);
      } catch (error) {
        console.error('Failed to fetch popular communities:', error);
        setPopularCommunities([]);
      } finally {
        setLoadingPopularCommunities(false);
      }
    }

    fetchPopularCommunities();
  }, [joinedCommunities]);

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

  return (
    <aside className="sidebar-left">
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">FEEDS</h3>
        <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Home</span>
        </Link>
        <Link to="/popular" className={`sidebar-link ${location.pathname === '/popular' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          <span>Popular</span>
        </Link>
        <Link to="/explore" className={`sidebar-link ${location.pathname === '/explore' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          <span>Explore</span>
        </Link>
        <Link to="/saved" className={`sidebar-link ${location.pathname === '/saved' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Saved</span>
        </Link>
        <Link to="/communities/create" className={`sidebar-link ${location.pathname === '/communities/create' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Create Community</span>
        </Link>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">POPULAR COMMUNITIES</h3>
        {loadingPopularCommunities ? (
          <div className="sidebar-empty-state">
            <p style={{ fontSize: '0.85rem', color: '#999', padding: '0.5rem' }}>
              Loading communities...
            </p>
          </div>
        ) : popularCommunities.length > 0 ? (
          popularCommunities.map((community) => (
            <Link 
              key={community._id} 
              to={`/communities/${community.name}`} 
              className="sidebar-link"
            >
              <span className="community-emoji">{getCommunityIcon(community.name)}</span>
              <span>r/{community.name}</span>
            </Link>
          ))
        ) : (
          <div className="sidebar-empty-state">
            <p style={{ fontSize: '0.85rem', color: '#999', padding: '0.5rem' }}>
              No communities found
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
