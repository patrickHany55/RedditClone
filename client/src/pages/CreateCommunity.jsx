import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommunity } from "../context/CommunityContext";
import { createCommunity } from "../models/communityModel";
import { getErrorMessage } from "../lib/errorMessage";

function CreateCommunity() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { fetchJoinedCommunities } = useCommunity();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await createCommunity({
        name,
        description
      });
      
      // Refresh joined list
      await fetchJoinedCommunities();
      
      // Navigate to new community
      navigate(`/communities/${res.data.name}`);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Could not create this community."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-community-container">
      <div className="create-community-header">
        <h1>Create a Community</h1>
      </div>
      
      <div className="create-community-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <p className="sub-label">Community names including capitalization cannot be changed. </p>
            <div className="input-prefix-wrapper">
              <span className="prefix">r/</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s+/g, ''))} // No spaces in r/name
                maxLength={21}
                className="community-input"
                required
              />
            </div>
            <div className="char-count">{21 - name.length} characters remaining</div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <p className="sub-label">This is how new members come to understand your community.</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="community-textarea"
              maxLength={500}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={!name.trim() || loading}
            >
              {loading ? "Creating..." : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCommunity;
