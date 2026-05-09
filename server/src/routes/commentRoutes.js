import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addComment,
  getCommentsByPost,
  deleteComment,
  voteComment
} from "../controllers/commentController.js";
import { checkCommentOwner } from "../middleware/commentMiddleware.js";

const router = express.Router();

// Add comment
router.post("/:postId", protect, addComment);

// Get comments
router.get("/:postId", getCommentsByPost);

// Delete comment
router.delete(
  "/:commentId",
  protect,
  checkCommentOwner,
  checkCommentOwner,
  deleteComment
);

// Vote on comment
router.post("/:commentId/vote", protect, voteComment);

export default router;
