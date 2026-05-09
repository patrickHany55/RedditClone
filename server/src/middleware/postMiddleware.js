import Post from "../models/Post.js";

// --------------------
// Validate post data
// --------------------
export const validatePost = (req, res, next) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }
  next();
};

// --------------------
// Check if user is post owner
// --------------------
export const checkPostOwner = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not allowed to modify this post" });
    }

    req.post = post; // pass post to controller
    next();
  } catch (error) {
    next(error);
  }
};

// --------------------
// Log post requests
// --------------------
export const logPostRequests = (req, res, next) => {
  console.log(`[POST LOG] ${req.method} ${req.originalUrl}`);
  next();
};
