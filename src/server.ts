import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API endpoints accessible at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server due to database connection error:", error);
    process.exit(1);
  }
};

startServer();
