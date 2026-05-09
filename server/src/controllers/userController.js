//userController.js
import User from "../../../src/models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { sendControllerError } from "../utils/errorResponse.js";

const populatePostFields = async (posts) => {
  return Promise.all(posts.map(async (post) => {
    const commentCount = await Comment.countDocuments({ post: post._id });
    const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
    return { ...post.toObject(), commentCount, score };
  }));
};

/* ---------------------------------------
   GET LOGGED-IN USER PROFILE
---------------------------------------- */
export const getMe = async (req, res) => {
  try {
    // req.user is added by authMiddleware
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("joinedCommunities", "name icon");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return sendControllerError(res, error, "Could not load your profile");
  }
};

/* ---------------------------------------
   UPDATE USER PROFILE
---------------------------------------- */
export const updateMe = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    const updatedData = {};

    if (username) updatedData.username = username;
    if (bio) updatedData.bio = bio;
    if (avatar) updatedData.avatar = avatar; // later you can implement file upload

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updatedData,
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return sendControllerError(res, error, "Could not update your profile");
  }
};

// @desc    Search users by username
// @route   GET /api/users/search?username=
// @access  Protected
export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username query is required" });
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" }
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return sendControllerError(res, error, "Could not search users");
  }
};

// @desc    Get user by username
// @route   GET /api/users/:username
// @access  Public
export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${req.params.username}$`, "i") }
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch user's posts
    const posts = await Post.find({ author: user._id })
      .populate("community", "name")
      .populate("author", "username")
      .sort({ createdAt: -1 });

    const comments = await Comment.find({ author: user._id })
      .populate("post", "title community")
      .populate({
        path: "post",
        populate: { path: "community", select: "name" },
      })
      .sort({ createdAt: -1 });

    const postsWithCounts = await populatePostFields(posts);

    res.json({ user, posts: postsWithCounts, comments });
  } catch (error) {
    console.error(error);
    return sendControllerError(res, error, "Could not load this user profile");
  }
};

// @desc    Upload user avatar
// @route   PUT /api/users/me/avatar
// @access  Protected
export const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    req.user.avatar = avatarPath;
    await req.user.save();

    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: avatarPath,
    });
  } catch (error) {
    console.error(error);
    return sendControllerError(res, error, "Could not upload avatar");
  }
};
