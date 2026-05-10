//postController.js
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import handleAsync from "../utils/handleAsync.js";
import { summarizePost } from "../services/aiService.js";
import { sendControllerError } from "../utils/errorResponse.js";

// Helper to populate comment counts AND score
const populatePostFields = async (posts) => {
  return Promise.all(posts.map(async (post) => {
    const commentCount = await Comment.countDocuments({ post: post._id });
    const score = (post.upvotes ? post.upvotes.length : 0) - (post.downvotes ? post.downvotes.length : 0);
    return { ...post.toObject(), commentCount, score };
  }));
};

// Create a post
export const createPost = handleAsync(async (req, res) => {
  console.log("createPost called");
  console.log("Request body:", req.body);
  console.log("User:", req.user);

  const { title, content, community, mediaUrl, mediaType, linkUrl } = req.body;

  const newPost = new Post({
    title,
    content,
    community,
    author: req.user._id,
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || 'none',
    linkUrl: linkUrl || null,
  });

  console.log("Attempting to save post:", newPost);
  const savedPost = await newPost.save();
  console.log("Post saved successfully:", savedPost._id);
  res.status(201).json(savedPost);
});

// Get posts by community
export const getPostsByCommunity = handleAsync(async (req, res) => {
  const posts = await Post.find({ community: req.params.communityId })
    .populate("author", "username")
    .populate("community", "name")
    .sort({ createdAt: -1 });

  const postsWithCounts = await populatePostFields(posts);
  res.json(postsWithCounts);
});

// Upvote / downvote a post
export const votePost = handleAsync(async (req, res) => {
  const { type } = req.body; // 'upvote' or 'downvote'

  if (!["upvote", "downvote"].includes(type)) {
    return res.status(400).json({ message: "Vote type must be upvote or downvote" });
  }

  const post = await Post.findById(req.params.postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const userId = req.user._id.toString();
  const alreadyUpvoted = post.upvotes.some(id => id.toString() === userId);
  const alreadyDownvoted = post.downvotes.some(id => id.toString() === userId);

  post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
  post.downvotes = post.downvotes.filter(id => id.toString() !== userId);

  if (type === "upvote" && !alreadyUpvoted) {
    post.upvotes.push(req.user._id);
  }

  if (type === "downvote" && !alreadyDownvoted) {
    post.downvotes.push(req.user._id);
  }

  await post.save();

  const populatedPost = await post.populate([
    { path: "author", select: "username" },
    { path: "community", select: "name" },
  ]);
  const [postWithCounts] = await populatePostFields([populatedPost]);

  res.json(postWithCounts);
});

// Delete post
export const deletePost = handleAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Check if user is the author
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to delete this post" });
  }

  // Delete all comments on this post
  await Comment.deleteMany({ post: post._id });

  // Delete the post itself
  await post.deleteOne();

  res.json({ message: "Post deleted successfully" });
});


// Global feed (all posts)
export const getGlobalFeed = handleAsync(async (req, res) => {
  console.log("getGlobalFeed called with sort:", req.query.sort);
  try {
    const { sort, community } = req.query; // new, top, best, hot, community

    const filter = {};
    if (community) {
      filter.community = community;
    }

    // Initial fetch - sorts by new by default in DB for efficiency, 
    // but we'll re-sort in memory for other modes
    let posts = await Post.find(filter)
      .populate("author", "username")
      .populate("community", "name"); // removed sort here to handle manually

    // Populate counts AND scores
    let postsWithCounts = await populatePostFields(posts);

    // Apply sorting logic
    if (sort === 'new' || !sort) {
      postsWithCounts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'top') {
      // Sort by score (upvotes - downvotes)
      postsWithCounts.sort((a, b) => b.score - a.score);
    } else if (sort === 'hot' || sort === 'popular' || sort === 'best') {
      // "Hot" / "Best" algorithm: Score weighted by recency
      // Simple algorithm: score / (hours_old + 2)^1.5
      // This makes newer posts with good votes rise, older posts fall
      postsWithCounts = postsWithCounts.map(post => {
        const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const popularityScore = (post.score + 1) / Math.pow(ageInHours + 2, 1.5);
        return { ...post, popularityScore };
      });
      postsWithCounts.sort((a, b) => b.popularityScore - a.popularityScore);
    }

    console.log(`Found ${posts.length} posts, sorted by ${sort || 'new'}`);
    res.json(postsWithCounts);
  } catch (error) {
    console.error("Error in getGlobalFeed:", error);
    return sendControllerError(res, error, "Could not load posts");
  }
});

// Personalized feed (joined communities only)
export const getUserFeed = handleAsync(async (req, res) => {
  const posts = await Post.find({
    community: { $in: req.user.joinedCommunities },
  })
    .populate("author", "username")
    .populate("community", "name")
    .sort({ createdAt: -1 });

  const postsWithCounts = await populatePostFields(posts);
  res.json(postsWithCounts);
});

// Generate AI summary for a post
export const generateSummary = handleAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Check if summary already exists and is recent (< 24 hours old)
  if (post.summary && post.summaryGeneratedAt) {
    const hoursSinceGeneration = (Date.now() - post.summaryGeneratedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceGeneration < 24) {
      return res.json({ summary: post.summary });
    }
  }

  // Generate new summary
  const summary = await summarizePost(post.title, post.content);

  if (!summary) {
    return res.status(500).json({ message: "Failed to generate summary" });
  }

  // Save summary to database
  post.summary = summary;
  post.summaryGeneratedAt = new Date();
  await post.save();

  res.json({ summary });
});

// Get popular posts (sorted by engagement)
export const getPopularPosts = handleAsync(async (req, res) => {
  const posts = await Post.find()
    .populate("author", "username")
    .populate("community", "name");

  const postsWithCounts = await populatePostFields(posts);

  // Calculate popularity score for each post
  const postsWithScores = postsWithCounts.map(post => {
    const upvotes = post.upvotes?.length || 0;
    const downvotes = post.downvotes?.length || 0;
    const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);

    // Reddit-style "Hot" algorithm
    const score = (upvotes - downvotes + 1 + (post.commentCount || 0)) / Math.pow(ageInHours + 2, 1.5);

    return {
      ...post,
      popularityScore: score || 0
    };
  });

  // Sort by popularity score (descending)
  postsWithScores.sort((a, b) => b.popularityScore - a.popularityScore);

  res.json({ data: postsWithScores });
});

// Get single post by ID
export const getPostById = handleAsync(async (req, res) => {
  console.log("getPostById called with ID:", req.params.id);

  const post = await Post.findById(req.params.id)
    .populate("author", "username")
    .populate("community", "name");

  if (!post) {
    console.log("Post not found for ID:", req.params.id);
    return res.status(404).json({ message: "Post not found" });
  }

  // Fetch comments for this post
  console.log("Fetching comments for post:", post._id);
  const comments = await Comment.find({ post: post._id })
    .populate("author", "username")
    .sort({ createdAt: -1 });

  console.log(`Found ${comments.length} comments`);

  const score = (post.upvotes ? post.upvotes.length : 0) - (post.downvotes ? post.downvotes.length : 0);

  res.json({ ...post.toObject(), comments, score });
});

// Add a comment to a post
export const addComment = handleAsync(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const comment = new Comment({
    content,
    post: post._id,
    author: req.user._id,
  });

  await comment.save();

  // Add comment to post's comments array if you have one, 
  // currently we just query Comments by post ID so strictly not needed to push to Post,
  // but if Post has a comments count or array, update it.
  // The current Post model schema wasn't fully inspected for 'comments' array but usually we just query.
  // We'll return the populated comment so frontend can add it to the list.

  const populatedComment = await Comment.findById(comment._id).populate("author", "username");

  res.status(201).json(populatedComment);
});

/* ---------------------------------------
   SAVE POST
---------------------------------------- */
export const savePost = handleAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const User = (await import("../models/User.js")).default;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if post exists
  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Check if already saved
  if (user.savedPosts.includes(id)) {
    return res.status(400).json({ message: "Post already saved" });
  }

  user.savedPosts.push(id);
  await user.save();

  res.json({ message: "Post saved successfully" });
});

/* ---------------------------------------
   UNSAVE POST
---------------------------------------- */
export const unsavePost = handleAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const User = (await import("../models/User.js")).default;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.savedPosts = user.savedPosts.filter(
    postId => postId.toString() !== id.toString()
  );
  await user.save();

  res.json({ message: "Post unsaved successfully" });
});

/* ---------------------------------------
   GET SAVED POSTS
---------------------------------------- */
export const getSavedPosts = handleAsync(async (req, res) => {
  const userId = req.user._id;

  const User = (await import("../models/User.js")).default;
  const user = await User.findById(userId).populate({
    path: "savedPosts",
    populate: [
      { path: "author", select: "username" },
      { path: "community", select: "name" }
    ]
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Add comment counts and scores
  const postsWithCounts = await populatePostFields(user.savedPosts);

  res.json(postsWithCounts);
});
