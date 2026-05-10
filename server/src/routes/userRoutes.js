//server/src/routes/userRoutes.js
import express from "express";
import { getMe, updateMe, searchUsers, getUserByUsername } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadUserAvatar } from "../controllers/userController.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Search users
router.get("/search", protect, searchUsers);

// GET /api/users/me     → Get profile
router.get("/me", protect, getMe);

// PUT /api/users/me     → Update profile
router.put("/me", protect, updateMe);

// PUT /api/users/me/avatar → Upload avatar
router.put(
    "/me/avatar",
    protect,
    uploadAvatar.single("avatar"),
    uploadUserAvatar
);
router.get("/:username", getUserByUsername);

export default router;
