// // server/src/config/db.js
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     // Connect to MongoDB using the URI from .env
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (err) {
//     console.error(`Error: ${err.message}`);
//     process.exit(1); // Stop server if DB connection fails
//   }
// };

// module.exports = connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL;
    
    if (!mongoURI) {
      throw new Error("MongoDB URI not found. Set MONGO_URL or MONGO_PUBLIC_URL environment variable.");
    }
    
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
