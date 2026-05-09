import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PostCard from "../components/ui/PostCard.jsx";
import { useCommunity } from "../context/CommunityContext";
import {
  getCommunities,
  getCommunityStats,
  joinCommunity,
  leaveCommunity,
} from "../models/communityModel";
import { getPostsByCommunity } from "../models/postModel";
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
    cooking: "🍳",
    explainlikeimfive: "🧒"
  };
  return icons[name.toLowerCase()] || "📌";
};



// Dummy highlights data
const communityHighlights = {
  explainlikeimfive: [
    {
      title: "ELI5: Monthly Current Events Megathread",
      votes: 8,
      comments: 43
    }
  ],
  technology: [
    {
      title: "Weekly Tech News Discussion",
      votes: 156,
      comments: 89
    }
  ],
  gaming: [
    {
      title: "What are you playing this week?",
      votes: 234,
      comments: 567
    }
  ]
};



function Community() {
  const { name } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);
  const [communityStats, setCommunityStats] = useState({
    weeklyVisitors: 0,
    weeklyContributions: 0,
  });
  const [highlightsExpanded, setHighlightsExpanded] = useState(true);
  
  const { isJoined, addJoinedCommunity, removeJoinedCommunity, fetchJoinedCommunities } = useCommunity();

  useEffect(() => {
    async function fetchCommunityData() {
      try {
        setLoading(true);
        const res = await getCommunities();
        const foundCommunity = res.data.find(c => c.name.toLowerCase() === name.toLowerCase());
        
        if (foundCommunity) {
          setCommunity(foundCommunity);
          const [postsResult, statsResult] = await Promise.allSettled([
            getPostsByCommunity(foundCommunity._id),
            getCommunityStats(foundCommunity._id),
          ]);

          if (postsResult.status === 'fulfilled') {
            setPosts(postsResult.value.data || []);
          } else {
            console.error("Error fetching community posts:", postsResult.reason);
            setPosts([]);
          }

          if (statsResult.status === 'fulfilled') {
            setCommunityStats({
              weeklyVisitors: statsResult.value.data?.weeklyVisitors || 0,
              weeklyContributions: statsResult.value.data?.weeklyContributions || 0,
            });
          } else {
            console.error("Error fetching community stats:", statsResult.reason);
            setCommunityStats({ weeklyVisitors: 0, weeklyContributions: 0 });
          }
        } else {
          setCommunity(null);
          setPosts([]);
          setCommunityStats({ weeklyVisitors: 0, weeklyContributions: 0 });
        }
      } catch (err) {
        console.error("Failed to fetch community", err);
        setCommunity(null);
        setPosts([]);
        setCommunityStats({ weeklyVisitors: 0, weeklyContributions: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchCommunityData();
  }, [name]);

  const handleJoinToggle = async () => {
    if (!community) return;
    
    try {
      if (isJoined(community._id)) {
        await leaveCommunity(community._id);
        removeJoinedCommunity(community._id);
      } else {
        await joinCommunity(community._id);
        addJoinedCommunity(community);
      }
      await fetchJoinedCommunities();
    } catch (err) {
      console.error("Failed to join/leave community", err);
      alert(getErrorMessage(err, `Could not update your membership in r/${community.name}.`));
    }
  };

  if (loading) {
    return (
      <div className="community-page">
        <div className="community-main">
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="community-page">
        <div className="community-main">
          <p style={{ padding: '2rem', textAlign: 'center' }}>Community not found</p>
        </div>
      </div>
    );
  }

  const weeklyVisitors = communityStats.weeklyVisitors || 0;
  const weeklyContributions = communityStats.weeklyContributions || 0;
  const joined = isJoined(community._id);
  const highlights = communityHighlights[name.toLowerCase()] || [];

  return (
    <div className="community-page">
      <div className="community-main">
        {/* Banner */}
        <div className="community-banner"></div>

        {/* Header */}
        <div className="community-header">
          <div className="community-header-content">
            <div className="community-avatar">
              {getCommunityIcon(name)}
            </div>
            <div className="community-info">
              <h1 className="community-title">r/{name}</h1>
              <div className="community-actions">
                <button className="btn-create-post" onClick={() => window.location.href=`/create?community=${name}`}>
                  + Create Post
                </button>
                <button 
                  className={`btn-join-community ${joined ? 'joined' : ''}`}
                  onClick={handleJoinToggle}
                >
                  {joined ? 'Joined' : 'Join'}
                </button>

              </div>
            </div>
          </div>
        </div>



        {/* Community Highlights */}
        {highlights.length > 0 && (
          <div className="community-highlights">
            <div className="highlights-header" onClick={() => setHighlightsExpanded(!highlightsExpanded)}>
              <div className="highlights-title">
                🎯 Community highlights
              </div>
              <span>{highlightsExpanded ? '▲' : '▼'}</span>
            </div>
            {highlightsExpanded && highlights.map((highlight, index) => (
              <div key={index} className="highlight-item">
                <div className="highlight-title">{highlight.title}</div>
                <div className="highlight-meta">
                  {highlight.votes} votes • {highlight.comments} comments
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Posts */}
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <div className="community-empty-state">
            <h3>No posts yet</h3>
            <p>Be the first to create a post in r/{name}!</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="community-sidebar">
        <div className="community-about">
          <h3 className="about-title">{community.name} | About</h3>
          
          <p className="about-description">{community.description}</p>
          
          <div className="about-meta">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
            </svg>
            <span>Created {new Date(community.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          
          <div className="about-meta">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <span>Public</span>
          </div>

          <div className="community-stats">
            <div className="stat-item">
              <span className="stat-value">{weeklyVisitors.toLocaleString()}</span>
              <span className="stat-label">Weekly visitors</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{weeklyContributions.toLocaleString()}</span>
              <span className="stat-label">Weekly contributions</span>
            </div>
          </div>

          <div className="community-bookmarks">
            <div className="bookmarks-header">COMMUNITY BOOKMARKS</div>
            <button className="btn-detailed-rules">Detailed Rules</button>
          </div>

          <div className="request-section">
            <div className="request-header">
              <span className="request-title">REQUEST AN EXPLANATION</span>
              <span>▼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;
