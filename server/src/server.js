import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import createApp from "./app.js";

const startServer = async () => {
  await connectDB();

  const app = createApp();
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
