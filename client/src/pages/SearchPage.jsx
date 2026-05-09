import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchCommunities } from "../models/communityModel";
import { searchUsers } from "../models/userModel";
import { getErrorMessage } from "../lib/errorMessage";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  
  const [communities, setCommunities] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [commRes, usersRes] = await Promise.all([
          searchCommunities(query),
          searchUsers(query)
        ]);
        
        setCommunities(commRes.data);
        setPeople(usersRes.data);
      } catch (err) {
        console.error("Search failed", err);
        setError(getErrorMessage(err, "Could not complete this search."));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  if (!query) {
    return (
      <div className="search-page">
        <div className="search-empty">
          <h2>Type something to search</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search results for "{query}"</h1>
      </div>

      <div className="search-results-container">
        {error && <div className="error-message">{error}</div>}
        
        {/* Communities Section */}
        <section className="results-section">
          <h3 className="section-title">Communities</h3>
          {loading ? (
            <div className="loading-spider">Loading...</div>
          ) : communities.length > 0 ? (
            <div className="results-list">
              {communities.map((community) => (
                <div key={community._id} className="result-card community-result">
                  <div className="result-icon community-icon">r/</div>
                  <div className="result-info">
                    <Link to={`/communities/${community.name}`} className="result-name">r/{community.name}</Link>
                    <p className="result-meta">{community.members?.length || 0} members</p>
                    <p className="result-description">{community.description}</p>
                  </div>
                  <Link to={`/communities/${community.name}`} className="btn-visit">Visit</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No communities found</p>
          )}
        </section>

        {/* People Section */}
        <section className="results-section">
          <h3 className="section-title">People</h3>
          {loading ? (
            <div className="loading-spider">Loading...</div>
          ) : people.length > 0 ? (
            <div className="results-list">
              {people.map((person) => (
                <div key={person._id} className="result-card person-result">
                  <div className="result-icon user-icon">u/</div>
                  <div className="result-info">
                    <span className="result-name">u/{person.username}</span>
                    <p className="result-meta">Karma: {person.karma || 0}</p>
                  </div>
                  <Link to={`/u/${person.username}`} className="btn-visit">View Profile</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No people found</p>
          )}
        </section>

      </div>
    </div>
  );
}

export default SearchPage;
