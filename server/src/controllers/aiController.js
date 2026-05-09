import { askQuestion } from "../services/aiService.js";
import handleAsync from "../utils/handleAsync.js";

export const askAI = handleAsync(async (req, res) => {
    const { question } = req.body;

    if (!question || !question.trim()) {
        return res.status(400).json({ message: "Question is required" });
    }

    const result = await askQuestion(question);

    if (!result) {
        return res.status(500).json({ message: "Failed to get an answer" });
    }

    res.json(result);
});
