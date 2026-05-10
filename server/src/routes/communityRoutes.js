/* //server/src/routes/communityRoutes.js */

import express from "express";
import {
  createCommunity,
  deleteCommunity,
  getCommunities,
  getCommunityById,
  getCommunityStats,
  joinCommunity,
  leaveCommunity,
  recordCommunityVisit,
  searchCommunities,
  getUserJoinedCommunities,
} from "../controllers/communityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/communities
router.get("/", getCommunities);

// GET /api/communities/user/joined
router.get("/user/joined", protect, getUserJoinedCommunities);

router.get("/search", searchCommunities);

router.get("/:id/stats", getCommunityStats);

router.post("/:id/visit", recordCommunityVisit);

router.get("/:id", getCommunityById);

// POST /api/communities
router.post("/", protect, createCommunity);

// POST /api/communities/:id/join
router.post("/:id/join", protect, joinCommunity);

// POST /api/communities/:id/leave
router.post("/:id/leave", protect, leaveCommunity);

// DELETE /api/communities/:id
router.delete("/:id", protect, deleteCommunity);

export default router;
