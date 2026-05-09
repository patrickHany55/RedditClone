import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/ui/PostCard";
import {
  getUserProfile,
  updateCurrentUser,
  uploadCurrentUserAvatar,
} from "../models/userModel";
import { getErrorMessage } from "../lib/errorMessage";

function Profile() {
  const { username } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await getUserProfile(username);
        setProfile(res.data.user);
        setPosts(res.data.posts || []);
        setComments(res.data.comments || []);
        
        // Initialize edit state
        setEditBio(res.data.user.bio || "");
        setEditAvatar(res.data.user.avatar || "");
        setAvatarFile(null);
      } catch (err) {
        console.error(err);
        setError(getErrorMessage(err, "Could not load this user profile."));
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let currentAvatar = editAvatar;

      // 1. Handle File Upload if exists
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const uploadRes = await uploadCurrentUserAvatar(formData);
        
        // Use the new uploaded avatar URL
        currentAvatar = uploadRes.data.avatar;
      }

      // 2. Update Bio (and Avatar URL if no file was uploaded but URL changed)
      // Note: If we uploaded a file, currentAvatar is the new path. 
      // We pass it to /users/me to ensure consistency, or simply to update the bio.
      const res = await updateCurrentUser({
        bio: editBio,
        avatar: currentAvatar
      });

      // Update local state
      setProfile({ ...profile, bio: res.data.bio, avatar: res.data.avatar });
      // Sync global auth state (navbar avatar, etc)
      await refreshUser(); 
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(getErrorMessage(err, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profile) return null;

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <div className="profile-page">
      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-header-content">
          <div className="profile-avatar-container">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-placeholder">{profile.username[0].toUpperCase()}</div>
            )}
          </div>
          <div className="profile-actions">
            {isOwnProfile && (
              <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        <div className="profile-info">
          <h1 className="profile-username">u/{profile.username}</h1>
          <p className="profile-bio">{profile.bio || "No bio yet"}</p>
          
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">Karma</span>
              <span className="stat-value">{profile.karma || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Joined</span>
              <span className="stat-value">{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs (Simplified) */}
      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={`tab ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            Comments
          </button>
        </div>
        
        <div className="profile-feed">
          {activeTab === "posts" && (
            posts.length > 0 ? (
              posts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="empty-feed">
                u/{profile.username} hasn't posted anything yet.
              </div>
            )
          )}

          {activeTab === "comments" && (
            comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment._id} className="profile-comment-card">
                  <div className="profile-comment-meta">
                    Commented on{" "}
                    {comment.post ? (
                      <Link to={`/posts/${comment.post._id}`}>
                        {comment.post.title}
                      </Link>
                    ) : (
                      <span>a deleted post</span>
                    )}
                    {comment.post?.community?.name && (
                      <span> in r/{comment.post.community.name}</span>
                    )}
                    <span> • {new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="profile-comment-body">{comment.content}</div>
                </div>
              ))
            ) : (
              <div className="empty-feed">
                u/{profile.username} hasn't commented yet.
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content profile-edit-modal">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Display Name (Bio?)</label>
                <p className="sub-label">Actually updating Bio</p>
                <textarea 
                  value={editBio} 
                  onChange={e => setEditBio(e.target.value)}
                  maxLength={300}
                  className="edit-textarea"
                />
              </div>
              
              <div className="form-group">
                <label>Avatar Image</label>
                <div className="avatar-upload-options">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <div className="separator">OR</div>
                  <input 
                    type="text" 
                    value={editAvatar} 
                    onChange={e => setEditAvatar(e.target.value)}
                    className="edit-input"
                    placeholder="Image URL (https://...)"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
