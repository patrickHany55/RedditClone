import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCommunities, joinCommunity, leaveCommunity } from "../models/communityModel";
import { useCommunity } from "../context/CommunityContext";
import { getErrorMessage } from "../lib/errorMessage";

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
    memes: "😂",
    askreddit: "❓",
    space: "🚀",
  };

  return icons[name?.toLowerCase()] || "📌";
};

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isJoined, fetchJoinedCommunities } = useCommunity();

  useEffect(() => {
    async function fetchCommunities() {
      setLoading(true);
      setError("");

      try {
        const response = await getCommunities();
        const sorted = (response.data || []).sort(
          (a, b) => (b.members?.length || 0) - (a.members?.length || 0)
        );
        setCommunities(sorted);
      } catch (err) {
        console.error("Failed to load communities", err);
        setError(getErrorMessage(err, "Could not load communities."));
      } finally {
        setLoading(false);
      }
    }

    fetchCommunities();
  }, []);

  const handleJoinToggle = async (community) => {
    try {
      if (isJoined(community._id)) {
        await leaveCommunity(community._id);
      } else {
        await joinCommunity(community._id);
      }

      await fetchJoinedCommunities();
      const response = await getCommunities();
      setCommunities(
        (response.data || []).sort(
          (a, b) => (b.members?.length || 0) - (a.members?.length || 0)
        )
      );
    } catch (err) {
      console.error("Failed to update community membership", err);
      alert(getErrorMessage(err, `Could not update r/${community.name}.`));
    }
  };

  return (
    <div className="communities-directory">
      <div className="communities-directory-header">
        <div>
          <h1>Communities</h1>
          <p>Browse communities and join the ones you want in your feed.</p>
        </div>
        <Link to="/communities/create" className="communities-create-link">
          Create Community
        </Link>
      </div>

      {loading ? (
        <div className="communities-status">Loading communities...</div>
      ) : error ? (
        <div className="communities-status error-message">{error}</div>
      ) : communities.length === 0 ? (
        <div className="communities-status">No communities yet.</div>
      ) : (
        <div className="communities-list-page">
          {communities.map((community, index) => {
            const joined = isJoined(community._id);
            const memberCount = community.members?.length || 0;

            return (
              <div key={community._id} className="communities-list-row">
                <div className="communities-rank">{index + 1}</div>
                <div className="communities-avatar">{getCommunityIcon(community.name)}</div>
                <div className="communities-row-main">
                  <Link to={`/communities/${community.name}`} className="communities-row-name">
                    r/{community.name}
                  </Link>
                  <div className="communities-row-meta">
                    {memberCount.toLocaleString()} {memberCount === 1 ? "member" : "members"}
                  </div>
                  {community.description && (
                    <p className="communities-row-description">{community.description}</p>
                  )}
                </div>
                <div className="communities-row-actions">
                  <Link to={`/communities/${community.name}`} className="communities-open-link">
                    Open
                  </Link>
                  <button
                    className={`btn-join ${joined ? "joined" : ""}`}
                    onClick={() => handleJoinToggle(community)}
                  >
                    {joined ? "Joined" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Communities;
