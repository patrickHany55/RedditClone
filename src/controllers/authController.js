import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendControllerError } from "../utils/errorResponse.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check fields exist
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = await User.create({ username, email, password });

    return res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    console.log(error);
    return sendControllerError(res, error, "Could not register this account");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account found with this email" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Password is incorrect" });

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log(error);
    return sendControllerError(res, error, "Could not log in right now");
  }
};
