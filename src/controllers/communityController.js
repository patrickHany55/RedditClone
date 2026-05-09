/* //server/src/controllers/communityController.js */
import Community from "../models/Community.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { sendControllerError } from "../utils/errorResponse.js";

// Helper to populate comment counts AND score (duplicated from postController for now)
const populatePostFields = async (posts) => {
  return Promise.all(posts.map(async (post) => {
    const commentCount = await Comment.countDocuments({ post: post._id });
    const score = (post.upvotes ? post.upvotes.length : 0) - (post.downvotes ? post.downvotes.length : 0);
    return { ...post.toObject(), commentCount, score };
  }));
};

// Weekly community metrics based on real activity in the last 7 days
const getWeeklyCommunityStats = async (communityId) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentPosts = await Post.find(
    {
      community: communityId,
      createdAt: { $gte: sevenDaysAgo },
    },
    "_id author upvotes downvotes"
  );

  const recentPostIds = recentPosts.map((post) => post._id);

  const recentComments = recentPostIds.length > 0
    ? await Comment.find(
        {
          post: { $in: recentPostIds },
          createdAt: { $gte: sevenDaysAgo },
        },
        "author"
      )
    : [];

  const uniqueVisitorIds = new Set();

  recentPosts.forEach((post) => {
    if (post.author) {
      uniqueVisitorIds.add(String(post.author));
    }
    (post.upvotes || []).forEach((id) => uniqueVisitorIds.add(String(id)));
    (post.downvotes || []).forEach((id) => uniqueVisitorIds.add(String(id)));
  });

  recentComments.forEach((comment) => {
    if (comment.author) {
      uniqueVisitorIds.add(String(comment.author));
    }
  });

  return {
    weeklyVisitors: uniqueVisitorIds.size,
    weeklyContributions: recentPosts.length + recentComments.length,
  };
};

/* ---------------------------------------
   CREATE COMMUNITY
---------------------------------------- */
export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Community.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Community already exists" });

    const community = await Community.create({
      name,
      description,
      creator: req.user._id,
      members: [req.user._id],
    });

    // add community to user's joinedCommunities
    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedCommunities: community._id },
    });

    res.status(201).json(community);
  } catch (error) {
    console.log(error);
    return sendControllerError(res, error, "Could not create community");
  }
};

/* ---------------------------------------
   GET ALL COMMUNITIES
---------------------------------------- */
export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find().sort({ createdAt: -1 });
    res.json(communities);
  } catch (error) {
    return sendControllerError(res, error, "Could not load communities");
  }
};

export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    const posts = await Post.find({ community: community._id })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    const postsWithCounts = await populatePostFields(posts);
    const weeklyStats = await getWeeklyCommunityStats(community._id);

    res.json({ community, posts: postsWithCounts, ...weeklyStats });
  } catch (error) {
    return sendControllerError(res, error, "Could not load community");
  }
};

export const getCommunityStats = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const weeklyStats = await getWeeklyCommunityStats(community._id);
    res.json(weeklyStats);
  } catch (error) {
    return sendControllerError(res, error, "Could not load community stats");
  }
};


/* ---------------------------------------
   JOIN COMMUNITY
---------------------------------------- */
export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community)
      return res.status(404).json({ message: "Community not found" });

    if (community.members.includes(req.user._id))
      return res.status(400).json({ message: "Already joined" });

    community.members.push(req.user._id);
    await community.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedCommunities: community._id },
    });

    res.json({ message: "Joined community" });
  } catch (error) {
    return sendControllerError(res, error, "Could not join community");
  }
};

/* ---------------------------------------
   LEAVE COMMUNITY
---------------------------------------- */
export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community)
      return res.status(404).json({ message: "Community not found" });

    community.members = community.members.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await community.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedCommunities: community._id },
    });

    res.json({ message: "Left community" });
  } catch (error) {
    return sendControllerError(res, error, "Could not leave community");
  }
};

/* ---------------------------------------
   GET USER'S JOINED COMMUNITIES
---------------------------------------- */
export const getUserJoinedCommunities = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "joinedCommunities",
      "name description members createdAt"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.joinedCommunities);
  } catch (error) {
    console.error("Error fetching joined communities:", error);
    return sendControllerError(res, error, "Could not load joined communities");
  }
};

export const searchCommunities = async (req, res) => {
  try {
    const { q } = req.query; // /api/communities/search?q=cats

    if (!q) return res.status(400).json({ message: "Query is required" });

    const communities = await Community.find({
      name: { $regex: q, $options: "i" }, // case-insensitive
    }).sort({ createdAt: -1 });

    res.json(communities);
  } catch (error) {
    return sendControllerError(res, error, "Could not search communities");
  }
};
