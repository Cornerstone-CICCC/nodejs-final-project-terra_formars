import { Server } from "socket.io";
import { createRoomHandler } from "./handlers/room.handler";
import { verifyUser } from "./middleware/auth";
import { Server as HttpServer } from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Room } from "./models/room.model";
import { User } from "./models/user.model";
dotenv.config();

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Debug middleware
  io.use((socket, next) => {
    console.log("Socket middleware - New connection attempt:", socket.id);
    // Event listener
    socket.onAny((eventName, ...args) => {
      console.log(`Received event "${eventName}"`, args);
    });

    next();
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      if (process.env.NODE_ENV === "test") {
        const mockUser = new User({
          _id: new mongoose.Types.ObjectId(),
          username: "mock_user",
          password: "mock_password",
          createdAt: new Date(),
        });
        socket.user = mockUser;
        return next();
      }
      const cookie = socket.handshake.headers.cookie;
      const token = cookie
        ?.split("; ")
        ?.find((row) => row.startsWith("token="))
        ?.split("=")[1];
      if (!token) {
        console.log("No token provided");
        return next(new Error("Authentication required"));
      }

      // Verify and attach user to socket
      const user = await verifyUser(token);
      socket.user = user;
      next();
    } catch (error) {
      console.error("Authentication failed", error);
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user?.username);

    // Initialize room handlers
    createRoomHandler(io, socket);

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.user?.username);
      const rooms = await Room.find({
        members: { $elemMatch: { userId: socket.user?._id } },
      });
      // handle disconnect
      for (const room of rooms) {
        if (room._id !== socket.id) {
          await createRoomHandler(io, socket).handleLeaveRoom(
            room._id as string
          );
        }
      }
    });
  });

  return io;
};
