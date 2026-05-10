import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import postRoutes from "./postRoutes.js";
import commentRoutes from "./commentRoutes.js";
import communityRoutes from "./communityRoutes.js";
import aiRoutes from "./aiRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "API is running",
    version: "1.0.0",
    endpoints: ["/api/auth", "/api/users", "/api/posts", "/api/comments", "/api/communities", "/api/ai"],
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/communities", communityRoutes);
router.use("/ai", aiRoutes);

export default router;
