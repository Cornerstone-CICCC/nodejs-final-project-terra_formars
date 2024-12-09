import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import roomRoutes from "./routes/room.routes";
import { initializeSocket } from "./socket";
import { mockAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
dotenv.config();

// Create server
export const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Middleware for testing
if (process.env.NODE_ENV === "test") {
  console.log("running test");
  app.use(mockAuth);
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);

// Error handling
app.use(errorHandler);

// Create HTTP server
const httpServer = createServer(app);
initializeSocket(httpServer);

// Connect to MongoDB and start server
const MONGO_URI =
  process.env.DATABASE_URL! || "mongodb://localhost:27017/chatroom";
const startServer = async () => {
  await mongoose
    .connect(MONGO_URI, { dbName: "chatroom" })
    .then(() => {
      console.log("Connected to MongoDB database");

      // Start the server
      const PORT = process.env.PORT || 3000;
      httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
};
if (process.env.NODE_ENV !== "test") {
  startServer();
}
