import express from "express";
import { askAI } from "../controllers/aiController.js";

const router = express.Router();

// Ask a question to AI
router.post("/ask", askAI);

export default router;
