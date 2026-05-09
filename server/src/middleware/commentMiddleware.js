import Comment from "../models/Comment.js";

// --------------------
// Validate comment data
// --------------------
export const validateComment = (req, res, next) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Comment content is required" });
  }
  next();
};

// --------------------
// Check if user is comment owner
// --------------------
export const checkCommentOwner = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not allowed to modify this comment" });
    }

    req.comment = comment; // pass comment to controller
    next();
  } catch (error) {
    next(error);
  }
};

// --------------------
// Log comment requests
// --------------------
export const logCommentRequests = (req, res, next) => {
  console.log(`[COMMENT LOG] ${req.method} ${req.originalUrl}`);
  next();
};
