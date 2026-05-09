import Comment from "../models/Comment.js";
import handleAsync from "../utils/handleAsync.js";

// Add comment
export const addComment = handleAsync(async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    author: req.user.id,
    post: req.params.postId || req.params.id,
    parent: req.body.parentId || null
  });

  // If we need to populate author immediately for the frontend
  await comment.populate('author', 'username');

  res.status(201).json(comment);
});

// Get comments for a post
export const getCommentsByPost = handleAsync(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'username')
    .sort({ createdAt: 1 });
  res.json(comments);
});
// Delete comment
export const deleteComment = handleAsync(async (req, res) => {
  // req.comment comes from checkCommentOwner middleware
  await req.comment.deleteOne();
  res.json({ message: "Comment deleted successfully" });
});

// Upvote / downvote a comment
export const voteComment = handleAsync(async (req, res) => {
  const { type } = req.body; // 'upvote' or 'downvote'
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  // Remove opposite vote if exists
  comment.upvotes = comment.upvotes.filter(id => id.toString() !== req.user.id);
  comment.downvotes = comment.downvotes.filter(id => id.toString() !== req.user.id);

  // Add new vote (toggle logic could be handled here or frontend, usually toggle if same)
  // Assuming frontend handles toggle or we just add. 
  // Let's check overlap: if sending 'upvote' and already upvoted, maybe remove it?
  // But let's follow the postController pattern: push to array.
  // Ideally we should check if already voted same type to toggle off.

  const alreadyUpvoted = comment.upvotes.includes(req.user.id);
  const alreadyDownvoted = comment.downvotes.includes(req.user.id);

  if (type === 'upvote') {
    if (alreadyUpvoted) {
      // Toggle off
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== req.user.id);
    } else {
      comment.upvotes.push(req.user.id);
    }
  } else {
    // downvote
    if (alreadyDownvoted) {
      // Toggle off
      comment.downvotes = comment.downvotes.filter(id => id.toString() !== req.user.id);
    } else {
      comment.downvotes.push(req.user.id);
    }
  }

  await comment.save();
  res.json(comment);
});

