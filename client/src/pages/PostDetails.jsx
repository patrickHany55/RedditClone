import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/ui/PostCard';
import { deleteComment, voteComment } from '../models/commentModel';
import { addPostComment, getPostById } from '../models/postModel';
import { getErrorMessage } from '../lib/errorMessage';

// Helper to organize comments into a tree
function buildCommentTree(comments) {
  const commentMap = {};
  const splitComments = []; // Comments with no parent (roots)

  // First pass: create map with string IDs
  comments.forEach(comment => {
    const idStr = String(comment._id);
    commentMap[idStr] = { ...comment, children: [] };
  });

  // Second pass: link children to parents
  comments.forEach(comment => {
    // robustly get parent ID
    let parentId = comment.parent;
    if (parentId && typeof parentId === 'object') {
      parentId = parentId._id;
    }
    
    if (parentId) {
      const pIdStr = String(parentId);
      const childIdStr = String(comment._id);
      
      if (commentMap[pIdStr]) {
        commentMap[pIdStr].children.push(commentMap[childIdStr]);
      } else {
        // Parent might be missing/deleted - treat as root
        if (commentMap[childIdStr]) {
             splitComments.push(commentMap[childIdStr]);
        }
      }
    } else {
      const childIdStr = String(comment._id);
      if (commentMap[childIdStr]) {
        splitComments.push(commentMap[childIdStr]);
      }
    }
  });

  return splitComments;
}

// Recursive Comment Component
// Recursive Comment Component
function CommentItem({ comment, depth = 0, onReply, onVote, onDelete, user }) {
  const navigate = useNavigate();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Default avatar if none provided
  const avatarUrl = comment.author?.avatar || "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png";
  
  const isAuthor = user && (user._id === comment.author?._id || user.id === comment.author?._id);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    onReply(replyContent, comment._id);
    setIsReplying(false);
    setReplyContent("");
  };

  return (
    <div className="comment-tree-node">
      <div className="comment-visual-rail">
         <div className="comment-avatar-container">
            <img src={avatarUrl} alt="avatar" className="comment-avatar-img" />
         </div>
         {/* The thread line goes down from here */}
         <div className="thread-line-container" onClick={() => setIsCollapsed(!isCollapsed)}>
             <div className="thread-line" />
         </div>
      </div>

      <div className="comment-content-container">
        <div className="comment-header">
          {comment.author?.username ? (
            <button
              type="button"
              className="comment-author comment-author-link"
              onClick={() => navigate(`/u/${comment.author.username}`)}
            >
              {comment.author.username}
            </button>
          ) : (
            <span className="comment-author">user</span>
          )}
          <span className="comment-date">
            • {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>

        {!isCollapsed ? (
          <>
            <div className="comment-body">
              {comment.content}
            </div>
            
            <div className="comment-footer">
              <button 
                className="comment-btn" 
                onClick={() => onVote(comment._id, 'upvote')}
                style={{ color: comment.upvotes?.includes(user?._id) ? '#ff4500' : '' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </button>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
              </span>
              <button 
                className="comment-btn" 
                onClick={() => onVote(comment._id, 'downvote')}
                style={{ color: comment.downvotes?.includes(user?._id) ? '#7193ff' : '' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </button>
              <button className="comment-btn" onClick={() => setIsReplying(!isReplying)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Reply
              </button>
              <button className="comment-btn" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Share
              </button>
              
              {isAuthor && (
                <button 
                  className="comment-btn" 
                  onClick={() => onDelete(comment._id)} 
                  style={{ color: '#ff4500' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
            
            {isReplying && (
               <form onSubmit={handleReplySubmit} className="reply-form" style={{ marginTop: '10px' }}>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="comment-input"
                    style={{ minHeight: '60px' }}
                    autoFocus
                    required
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" className="comment-btn" onClick={() => setIsReplying(false)}>Cancel</button>
                      <button type="submit" className="submit-comment-btn" style={{ padding: '4px 12px', fontSize: '12px' }}>Reply</button>
                  </div>
               </form>
            )}

            {/* Recursive Children */}
            {comment.children && comment.children.length > 0 && (
              <div className="comment-children">
                {comment.children.map(child => (
                  <CommentItem 
                    key={child._id} 
                    comment={child} 
                    depth={depth + 1} 
                    onReply={onReply} 
                    onVote={onVote}
                    onDelete={onDelete}
                    user={user}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
             <div style={{ fontStyle: 'italic', color: '#818384', marginTop: '4px', cursor: 'pointer' }} onClick={() => setIsCollapsed(false)}>
               [Collapsed]
             </div>
        )}
      </div>
    </div>
  );
}

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await getPostById(id);
        setPost(res.data);
        if (res.data.comments) {
          const commentsList = Array.isArray(res.data.comments) ? res.data.comments : [];
          setComments(commentsList);
        }
      } catch (err) {
        console.error("Failed to fetch post", err);
        setError(getErrorMessage(err, "Could not load this post."));
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  useEffect(() => {
    // Check if we need to focus comments
    const params = new URLSearchParams(window.location.search);
    if (params.get('focus') === 'comments' && !loading && post) {
      setTimeout(() => {
        const commentSection = document.querySelector('.comment-form') || document.querySelector('.comments-section');
        if (commentSection) {
          commentSection.scrollIntoView({ behavior: 'smooth' });
          const textarea = commentSection.querySelector('textarea');
          if (textarea) textarea.focus();
        }
      }, 500);
    }
  }, [loading, post]);

  // Handle generalized comment submission (root or nested)
  // We keep 'newComment' state for the root input, but pass this handler for nested replies too
  // Handle generalized comment submission (root or nested)
  async function submitComment(content, parentId = null) {
     if (!content.trim()) return;
     
     if (!parentId) setSubmitting(true);

     try {
       // Ensure parentId is a plain string if it exists
       const payload = { 
         content, 
         parentId: parentId ? String(parentId) : null 
       };

       await addPostComment(id, payload);
       
       // Re-fetch posts/comments to ensure consistency and correct sorting/threading
       // This avoids any mismatch between optimistic state and actual DB state
       const res = await getPostById(id);
       if (res.data.comments) {
         const commentsList = Array.isArray(res.data.comments) ? res.data.comments : [];
         setComments(commentsList);
       }
       setPost(res.data); // Update post for comment count etc

       if (!parentId) setNewComment("");
     } catch (err) {
       console.error("Failed to post comment", err);
       alert(getErrorMessage(err, "Could not post this comment."));
     } finally {
       if (!parentId) setSubmitting(false);
     }
  }

  // Wrapper for root form
  const handleRootSubmit = (e) => {
    e.preventDefault();
    submitComment(newComment, null);
  };

  const handleCommentVote = async (commentId, type) => {
    if (!user) {
      alert("Please log in to vote");
      return;
    }
    try {
        // Optimistic update
        setComments(prevComments => prevComments.map(c => {
            if (c._id === commentId) {
                let newUpvotes = [...(c.upvotes || [])];
                let newDownvotes = [...(c.downvotes || [])];
                const userId = user._id || user.id;

                if (type === 'upvote') {
                   if (newUpvotes.includes(userId)) {
                       newUpvotes = newUpvotes.filter(id => id !== userId);
                   } else {
                       newUpvotes.push(userId);
                       newDownvotes = newDownvotes.filter(id => id !== userId);
                   }
                } else {
                   if (newDownvotes.includes(userId)) {
                       newDownvotes = newDownvotes.filter(id => id !== userId);
                   } else {
                       newDownvotes.push(userId);
                       newUpvotes = newUpvotes.filter(id => id !== userId);
                   }
                }
                return { ...c, upvotes: newUpvotes, downvotes: newDownvotes };
            }
            return c;
        }));

        await voteComment(commentId, type);
    } catch (err) {
        console.error("Failed to vote on comment", err);
        alert(getErrorMessage(err, "Could not vote on this comment."));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await deleteComment(commentId);
      // Remove from state directly
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
      alert(getErrorMessage(err, "Could not delete this comment."));
    }
  };

  const rootComments = buildCommentTree(comments);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="error-message">Post not found</div>;

  return (
    <div className="post-details-container">
      <div className="post-details-left">
        <div className="back-button" onClick={() => navigate(-1)}>
          ← Back to Feed
        </div>
        
        <PostCard post={post} />

        <div className="comments-section">
          <h3>Comments</h3>
          
          {user ? (
            <form onSubmit={handleRootSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                className="comment-input"
                rows="4"
                required
              />
              <div className="comment-actions">
                <button type="submit" className="submit-comment-btn" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-to-comment">
              <p>Log in or sign up to leave a comment</p>
            </div>
          )}

          <div className="comments-list">
            {rootComments.length > 0 ? (
              rootComments.map(comment => (
                <CommentItem 
                  key={comment._id} 
                  comment={comment} 
                  onReply={submitComment}
                  onVote={handleCommentVote}
                  onDelete={handleDeleteComment}
                  user={user}
                />
              ))
            ) : (
              <div className="no-comments">
                No comments yet. Be the first to share what you think!
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="post-details-right">
        {/* Community Info Card */}
        <div className="community-info-card">
          <h3>r/{post.community?.name || post.community}</h3>
           <p className="community-desc">Welcome to the r/{post.community?.name || post.community} community!</p>
        </div>
      </div>
    </div>
  );
}

export default PostDetails;
