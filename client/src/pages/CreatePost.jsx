import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCommunity } from "../context/CommunityContext";
import { getCommunities } from "../models/communityModel";
import { createPost } from "../models/postModel";
import { getErrorMessage } from "../lib/errorMessage";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState("text");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { joinedCommunities } = useCommunity();

  // Check if community is specified in URL
  useEffect(() => {
    const communityParam = searchParams.get('community');

    if (!communityParam) {
      return;
    }

    const matchedJoinedCommunity = joinedCommunities.find(
      c => c.name.toLowerCase() === communityParam.toLowerCase()
    );

    if (matchedJoinedCommunity) {
      setSelectedCommunity(matchedJoinedCommunity);
      return;
    }

    let isMounted = true;

    const fetchCommunityByName = async () => {
      try {
        const response = await getCommunities();
        const matchedCommunity = response.data.find(
          c => c.name.toLowerCase() === communityParam.toLowerCase()
        );

        if (isMounted && matchedCommunity) {
          setSelectedCommunity(matchedCommunity);
        }
      } catch (error) {
        console.error('Failed to resolve community from URL:', error);
      }
    };

    fetchCommunityByName();

    return () => {
      isMounted = false;
    };
  }, [searchParams, joinedCommunities]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      return;
    }

    // Validate file size (5MB for images, 50MB for videos)
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Max size: ${isImage ? '5MB' : '50MB'}`);
      return;
    }

    setMediaFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected media
  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitting post with title:", title, "content:", body);
    const communityParam = searchParams.get('community');
    
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (communityParam && !selectedCommunity) {
      alert(`Could not find r/${communityParam}. Please select a community before posting.`);
      return;
    }

    setUploading(true);
    
    try {
      let mediaUrl = null;
      let mediaType = 'none';

      // If there's a media file, convert to base64
      if (mediaFile) {
        mediaUrl = mediaPreview; // Already base64 from FileReader
        mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
      }

      const response = await createPost({ 
        title, 
        content: body,
        community: selectedCommunity?._id || null,
        mediaUrl,
        mediaType,
        linkUrl: postType === 'link' ? linkUrl : null
      });
      
      console.log("Post created successfully:", response.data);
      navigate('/');
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      alert(getErrorMessage(err, "Could not create this post. Please check the title, community, and media."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <h1>Create a post</h1>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="create-post-card">
          {/* Community Selector */}
          <div className="form-group">
            <label className="community-selector-label">Choose a community</label>
            <select 
              className="community-selector"
              value={selectedCommunity?._id || ''}
              onChange={(e) => {
                const community = joinedCommunities.find(c => c._id === e.target.value);
                setSelectedCommunity(community || null);
              }}
            >
              <option value="">Select a community (optional)</option>
              {joinedCommunities.map(community => (
                <option key={community._id} value={community._id}>
                  r/{community.name}
                </option>
              ))}
            </select>
          </div>

          {/* Post Type Tabs */}
          <div className="post-type-tabs">
            <button 
              type="button"
              className={`post-type-tab ${postType === 'text' ? 'active' : ''}`}
              onClick={() => setPostType('text')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h10"/>
              </svg>
              Post
            </button>
            <button 
              type="button"
              className={`post-type-tab ${postType === 'image' ? 'active' : ''}`}
              onClick={() => setPostType('image')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Image & Video
            </button>
            <button 
              type="button"
              className={`post-type-tab ${postType === 'link' ? 'active' : ''}`}
              onClick={() => setPostType('link')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Link
            </button>
          </div>

          {/* Title Input */}
          <div className="form-group">
            <input
              type="text"
              className="post-title-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
              required
            />
            <div className="char-count">{title.length}/300</div>
          </div>

          {/* Content Area - Text */}
          {postType === 'text' && (
            <div className="form-group">
              <textarea
                className="post-body-textarea"
                placeholder="Text (optional)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
              />
            </div>
          )}

          {/* Content Area - Image/Video */}
          {postType === 'image' && (
            <div className="form-group">
              {!mediaPreview ? (
                <div className="upload-area" onClick={() => document.getElementById('media-input').click()}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>Drag and drop images or videos, or click to browse</p>
                  <button type="button" className="upload-btn">Choose File</button>
                  <input 
                    id="media-input"
                    type="file" 
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div className="media-preview-container">
                  {mediaFile.type.startsWith('image/') ? (
                    <img src={mediaPreview} alt="Preview" className="media-preview" />
                  ) : (
                    <video src={mediaPreview} controls className="media-preview" />
                  )}
                  <button type="button" onClick={removeMedia} className="remove-media-btn">
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Content Area - Link */}
          {postType === 'link' && (
            <div className="form-group">
              <input
                type="url"
                className="post-title-input"
                placeholder="Url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="create-post-actions">
          <div className="post-guidelines">
            <span>Please be mindful of reddit's content policy and practice good reddiquette.</span>
          </div>
          <div className="action-buttons">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="btn-cancel"
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-submit"
              disabled={!title.trim() || uploading}
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
