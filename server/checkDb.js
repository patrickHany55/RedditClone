import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Post from "./src/models/Post.js";

const run = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const count = await Post.countDocuments();
        console.log("Post count:", count);

        if (count > 0) {
            const posts = await Post.find().limit(5);
            console.log("First 5 posts:", JSON.stringify(posts, null, 2));
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
