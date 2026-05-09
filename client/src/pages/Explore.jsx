import { useState, useEffect } from "react";
import { useCommunity } from "../context/CommunityContext";
import { getCommunities, joinCommunity, leaveCommunity } from "../models/communityModel";
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
  const [activeTab, setActiveTab] = useState("All");
  const { isJoined, addJoinedCommunity, removeJoinedCommunity } = useCommunity();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await getCommunities();
        setCommunities(response.data);
      } catch (error) {
        console.error("Error fetching communities:", error);
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
        const community = communities.find(c => c._id === communityId);
        if (community) {
          addJoinedCommunity(community);
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

  // Sections to display
  const sections = [
    { title: "Trending Communities", data: communities.slice(0, 4) }, // Just first 4 for demo
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
          {communities.slice(0, 8).map((community) => (
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

      {/* Categorized Sections */}
      {sections.map((section) => (
        section.data.length > 0 && (
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
  // Generate fake visitor count for realism
  const visitors = ((community._id || community.name)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % 900) + 100; // 100-999k

  return (
    <div className="community-card">
      <div className="community-card-header">
        <div className="community-info">
          <div className="community-icon">
            {getIcon(community.name)}
          </div>
          <div className="community-details">
            <span className="community-name">r/{community.name}</span>
            <span className="community-members">{visitors}K weekly visitors</span>
          </div>
        </div>
        <button 
          className={`btn-join-card ${isJoined ? 'btn-joined-card' : ''}`}
          onClick={() => onJoin(community._id)}
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
