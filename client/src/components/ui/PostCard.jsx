import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  deletePost,
  savePost,
  summarizePost,
  unsavePost,
  votePost,
} from "../../models/postModel";
import { getErrorMessage } from "../../lib/errorMessage";

function PostCard({ post, onDelete, onUnsave, isSavedPage = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authorUsername = post.author?.username;
  const [vote, setVote] = useState(0); // -1, 0, 1
  const [score, setScore] = useState(post.score ?? 123);
  const [summary, setSummary] = useState(post.summary || null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Initialize vote state based on user
    setScore(post.score ?? 0);

    // Initialize saved state - if on saved posts page, the post is saved
    setIsSaved(isSavedPage);

    if (user && post) {
      const userId = String(user.id || user._id);
      const hasUpvoted = post.upvotes?.some(id => String(id) === userId);
      const hasDownvoted = post.downvotes?.some(id => String(id) === userId);

      if (hasUpvoted) {
        setVote(1);
      } else if (hasDownvoted) {
        setVote(-1);
      } else {
        setVote(0);
      }
    } else {
      setVote(0);
    }
  }, [post, user, isSavedPage]);

  async function handleUpvote() {
    if (!user) {
      alert("Please login to vote");
      return;
    }

    try {
      const newVote = vote === 1 ? 0 : 1;
      setVote(newVote);
      
      // Optimistic update
      if (vote === 1) {
         setScore(s => s - 1);
      } else if (vote === -1) {
         setScore(s => s + 2);
      } else {
         setScore(s => s + 1);
      }

      const response = await votePost(post._id, 'upvote');
      setScore(response.data.score ?? 0);
    } catch (error) {
      console.error("Error voting:", error);
      setVote(vote);
      setScore(post.score ?? 0);
      alert(getErrorMessage(error, "Could not upvote this post."));
    }
  }

  async function handleDownvote() {
    if (!user) {
      alert("Please login to vote");
      return;
    }

    try {
      const newVote = vote === -1 ? 0 : -1;
      setVote(newVote);
      
      // Optimistic update
      if (vote === -1) {
        setScore(s => s + 1);
      } else if (vote === 1) {
        setScore(s => s - 2);
      } else {
        setScore(s => s - 1);
      }

      const response = await votePost(post._id, 'downvote');
      setScore(response.data.score ?? 0);
    } catch (error) {
      console.error("Error voting:", error);
      setVote(vote);
      setScore(post.score ?? 0);
      alert(getErrorMessage(error, "Could not downvote this post."));
    }
  }

  async function handleSummarize() {
    if (summary || loadingSummary) return; // Already have summary or loading
    
    setLoadingSummary(true);
    try {
      console.log('Requesting summary for post:', post._id);
      const response = await summarizePost(post._id);
      console.log('Summary response:', response.data);
      
      if (response.data && response.data.summary) {
        setSummary(response.data.summary);
      } else {
        console.error('No summary in response:', response.data);
        alert('Summary generated but response was empty. Try again.');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      console.error('Error details:', error.response?.data);
      alert(getErrorMessage(error, "Could not generate a summary for this post."));
    } finally {
      setLoadingSummary(false);
    }
  }

  async function handleDelete(e) {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePost(post._id);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(getErrorMessage(error, "Could not delete this post."));
    }
  }

  async function handleSave(e) {
    if (e) e.stopPropagation();
    
    if (!user) {
      alert("Please login to save posts");
      return;
    }

    try {
      const newSavedState = !isSaved;
      // Optimistic update
      setIsSaved(newSavedState);

      if (newSavedState) {
        await savePost(post._id);
      } else {
        await unsavePost(post._id);
        // If we're on the saved posts page, notify parent to remove this post
        if (isSavedPage && onUnsave) {
          onUnsave(post._id);
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
      // Revert on error
      setIsSaved(!isSaved);
      alert(getErrorMessage(error, "Could not update saved posts."));
    }
  }

  function handleShare(e) {
    if (e) e.stopPropagation();
    
    // Create the full URL for the post
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        setCopySuccess(true);
        // Reset after 2 seconds
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
      });
  }

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('.action-btn') || e.target.closest('a') || e.target.closest('.vote-btn')) {
      return;
    }
    navigate(`/posts/${post._id}`);
  };

  return (
    <article className="post-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="vote-column" onClick={(e) => e.stopPropagation()}>
        <button className={`vote-btn ${vote === 1 ? 'upvoted' : ''}`} aria-label="upvote" onClick={handleUpvote}>▲</button>
        <div className="vote-score">{score}</div>
        <button className={`vote-btn down ${vote === -1 ? 'downvoted' : ''}`} aria-label="downvote" onClick={handleDownvote}>▼</button>
      </div>
      
      <div className="post-content">
        <div className="post-meta">
          {post.community && (
            <>
              <Link to={`/communities/${post.community?.name || post.community}`} className="subreddit-link" onClick={(e) => e.stopPropagation()}>
                r/{post.community?.name || post.community}
              </Link>
              <span>•</span>
            </>
          )}
          {authorUsername ? (
            <button
              type="button"
              className="user-link"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/u/${authorUsername}`);
              }}
            >
              Posted by u/{authorUsername}
            </button>
          ) : (
            <span style={{ color: '#787c7e' }}>Posted by u/deleted</span>
          )}
          <span>•</span>
          <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'just now'}</span>
        </div>

        <h3 className="post-title">{post.title}</h3>
        
        {post.content && <div className="post-body">{post.content}</div>}

        {(summary || loadingSummary) && (
          <div className="ai-summary">
            <div className="ai-summary-header">
              <span className="ai-badge">AI Summary</span>
            </div>
            <div className="ai-summary-text">
              {loadingSummary ? "Generating summary..." : summary}
            </div>
          </div>
        )}

        {/* Display media if exists */}
        {post.mediaType === 'image' && post.mediaUrl && (
          <div className="post-media">
            <img src={post.mediaUrl} alt={post.title} className="post-image" />
          </div>
        )}
        
        {post.mediaType === 'video' && post.mediaUrl && (
          <div className="post-media">
            <video controls className="post-video">
              <source src={post.mediaUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Display link if exists */}
        {post.linkUrl && (
          <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="post-link-card" onClick={(e) => e.stopPropagation()}>
            <div className="link-icon">🔗</div>
            <div className="link-info">
              <div className="link-url">
                {(() => {
                  try {
                    return new URL(post.linkUrl).hostname;
                  } catch {
                    return 'External Link';
                  }
                })()}
              </div>
              <div className="link-full">{post.linkUrl}</div>
            </div>
            <div className="link-arrow">→</div>
          </a>
        )}

        <div className="post-actions">
          {post.content && (
            <div className="action-btn ai-btn" onClick={(e) => handleSummarize(e)}>
              {summary ? 'AI Summary Ready' : (loadingSummary ? 'Summarizing...' : 'Summarize')}
            </div>
          )}
          <div className="action-btn" onClick={(e) => {
             e.stopPropagation();
             navigate(`/posts/${post._id}?focus=comments`);
           }}>
             {/* Prioritize details array length, fallback to feed count, fallback to 0 */}
             💬 {post.comments?.length >= 0 ? post.comments.length : (post.commentCount || 0)} Comments
          </div>
          <div className="action-btn" onClick={handleShare}>
             {copySuccess ? '✓ Link copied!' : '↪ Share'}
          </div>
          <div className="action-btn" onClick={handleSave}>
             {isSaved ? '🔖 Saved' : '🔗 Save'}
          </div>
          {user && post.author && (post.author._id === user.id || post.author._id === user._id || post.author === user.id || post.author === user._id) && (
            <div className="action-btn delete-btn" onClick={(e) => handleDelete(e)}>
              🗑️ Delete
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default PostCard;
