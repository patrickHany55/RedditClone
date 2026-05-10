import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCommunity } from "../context/CommunityContext";
import { getCommunities, getCommunityStats, joinCommunity, leaveCommunity } from "../models/communityModel";
import { getErrorMessage } from "../lib/errorMessage";

const CATEGORIES = [
  "All",
  "Most Visited",
  "Internet Culture",
  "Games",
  "Q&As & Stories",
  "Movies & TV",
  "Technology",
  "Pop Culture",
  "Places & Travel",
  "Sports",
  "Business & Finance"
];

// Mapping simplistic categories for simulation based on seed data
const CATEGORY_MAP = {
  "Games": ["gaming", "Minecraft", "EldenRing", "pcgaming"],
  "Technology": ["technology", "programming", "hardware", "software"],
  "Movies & TV": ["movies", "television", "StrangerThings", "Marvel"],
  "Internet Culture": ["funny", "memes", "AskReddit"],
  "Science": ["science", "space", "biology"],
  "Sports": ["fitness", "sports", "nba", "soccer"],
  "Places & Travel": ["travel", "photography", "EarthPorn"],
  "Business & Finance": ["cryptocurrency", "investing", "wallstreetbets"],
  "Arts": ["art", "music", "books", "cooking"]
};

function Explore() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const { isJoined, addJoinedCommunity, removeJoinedCommunity } = useCommunity();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await getCommunities();
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        const communitiesWithStats = await Promise.all(
          list.map(async (community) => {
            try {
              const statsResponse = await getCommunityStats(community._id);
              return {
                ...community,
                weeklyVisitors: statsResponse.data?.weeklyVisitors || 0,
                weeklyContributions: statsResponse.data?.weeklyContributions || 0,
              };
            } catch (error) {
              console.error(`Error fetching stats for r/${community.name}:`, error);
              return {
                ...community,
                weeklyVisitors: 0,
                weeklyContributions: 0,
              };
            }
          })
        );

        setCommunities(communitiesWithStats);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoin = async (communityId) => {
    try {
      const joined = isJoined(communityId);
      if (joined) {
        await leaveCommunity(communityId);
        removeJoinedCommunity(communityId);
      } else {
        await joinCommunity(communityId);
        // Find the community object to add to context
        const response = await getCommunities();
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        const matchedCommunity = list.find(c => c._id === communityId);
        if (matchedCommunity) {
          addJoinedCommunity(matchedCommunity);
        }
      }
    } catch (error) {
      console.error("Error toggling join:", error);
      alert(getErrorMessage(error, "Could not update this community membership."));
    }
  };

  // Helper to get random emoji for community icon
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
      programming: "👨‍💻"
    };
    return icons[name.toLowerCase()] || "r/";
  };

  // Filter sections
  const getCommunitiesByCategory = (category) => {
    const relevantNames = CATEGORY_MAP[category] || [];
    return communities.filter(c => 
      relevantNames.some(name => c.name.toLowerCase().includes(name.toLowerCase()))
    );
  };

  const mostVisitedCommunities = [...communities].sort(
    (a, b) => (b.weeklyVisitors || 0) - (a.weeklyVisitors || 0)
  );

  const trendingCommunities = [...communities].sort(
    (a, b) =>
      (b.weeklyContributions || 0) - (a.weeklyContributions || 0) ||
      (b.members?.length || 0) - (a.members?.length || 0)
  );

  const recommendedCommunities = [...communities].sort(
    (a, b) => (b.members?.length || 0) - (a.members?.length || 0)
  );

  // Sections to display
  const sections = [
    { title: "Trending Communities", data: trendingCommunities.slice(0, 4) },
    { title: "Technology", data: getCommunitiesByCategory("Technology") },
    { title: "Games", data: getCommunitiesByCategory("Games") },
    { title: "Internet Culture", data: getCommunitiesByCategory("Internet Culture") },
    { title: "Arts & Hobbies", data: getCommunitiesByCategory("Arts") },
  ];

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h1>Explore Communities</h1>
      </div>

      {/* Category Tabs */}
      <div className="explore-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`explore-tab ${activeTab === cat ? "active" : ""}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommended Section (Always visible at top) */}
      <div className="explore-section">
        <h2 className="explore-section-title">Recommended for you</h2>
        <div className="communities-grid">
          {loading ? (
            <div className="explore-empty-state">Loading communities...</div>
          ) : (
            recommendedCommunities.slice(0, 8).map((community) => (
              <CommunityCard 
                key={community._id} 
                community={community} 
                onJoin={handleJoin}
                isJoined={isJoined(community._id)}
                getIcon={getCommunityIcon}
              />
            ))
          )}
        </div>
      </div>

      {activeTab === "Most Visited" && (
        <div className="explore-section">
          <h2 className="explore-section-title">Most Visited</h2>
          <div className="communities-grid">
            {mostVisitedCommunities.map((community) => (
              <CommunityCard
                key={community._id}
                community={community}
                onJoin={handleJoin}
                isJoined={isJoined(community._id)}
                getIcon={getCommunityIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categorized Sections */}
      {activeTab !== "Most Visited" && sections.map((section) => (
        (activeTab === "All" || activeTab === section.title) && section.data.length > 0 && (
          <div key={section.title} className="explore-section">
            <h2 className="explore-section-title">{section.title}</h2>
            <div className="communities-grid">
              {section.data.map((community) => (
                <CommunityCard 
                  key={community._id} 
                  community={community} 
                  onJoin={handleJoin}
                  isJoined={isJoined(community._id)}
                  getIcon={getCommunityIcon}
                />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}

function CommunityCard({ community, onJoin, isJoined, getIcon }) {
  const navigate = useNavigate();
  const weeklyVisitors = community.weeklyVisitors || 0;
  const memberCount = community.members?.length || 0;
  const activityLabel = weeklyVisitors > 0
    ? `${weeklyVisitors.toLocaleString()} weekly ${weeklyVisitors === 1 ? "visitor" : "visitors"}`
    : `${memberCount.toLocaleString()} ${memberCount === 1 ? "member" : "members"}`;

  return (
    <div
      className="community-card"
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/communities/${community.name}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/communities/${community.name}`);
        }
      }}
    >
      <div className="community-card-header">
        <div className="community-info">
          <div className="community-icon">
            {getIcon(community.name)}
          </div>
          <div className="community-details">
            <span className="community-name">r/{community.name}</span>
            <span className="community-members">{activityLabel}</span>
          </div>
        </div>
        <button 
          className={`btn-join-card ${isJoined ? 'btn-joined-card' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onJoin(community._id);
          }}
        >
          {isJoined ? "Joined" : "Join"}
        </button>
      </div>
      <p className="community-description">
        {community.description}
      </p>
    </div>
  );
}

export default Explore;
