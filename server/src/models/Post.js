//Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String }, // Optional - media posts may not have text
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  mediaUrl: { type: String }, // Base64 string for images/videos
  mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },
  linkUrl: { type: String }, // URL for link posts
  summary: { type: String }, // AI-generated summary
  summaryGeneratedAt: { type: Date }, // When summary was created
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
