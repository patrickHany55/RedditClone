//server/src/routes/postRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkPostOwner } from "../middleware/postMiddleware.js";
import {
  createPost,
  getPostsByCommunity,
  votePost,
  getGlobalFeed,
  getUserFeed,
  deletePost,
  generateSummary,
  getPopularPosts,
  getPostById,
  savePost,
  unsavePost,
  getSavedPosts
} from "../controllers/postController.js";
import { addComment } from "../controllers/commentController.js";
const router = express.Router();

// Create post
router.post("/", protect, createPost);

//router.post("/", protect, createPost);
router.get("/", getGlobalFeed);
router.get("/popular", getPopularPosts); // Popular feed
router.get("/feed/me", protect, getUserFeed);

// Get saved posts (must come before /:id to avoid route conflict)
router.get("/saved", protect, getSavedPosts);

router.get("/community/:communityId", getPostsByCommunity);

// AI Summarization
router.post("/:id/summarize", generateSummary);

// Upvote / downvote
router.post("/:postId/vote", protect, votePost);

// Save / unsave post
router.post("/:id/save", protect, savePost);
router.post("/:id/unsave", protect, unsavePost);

// Delete post
router.delete("/:id", protect, deletePost);

// Get single post
router.get("/:id", getPostById);

// Add comment
router.post("/:id/comments", protect, addComment);

export default router;

