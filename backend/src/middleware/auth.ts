import { Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, IUser } from "../models/user.model";
import { AuthRequest, JwtPayload } from "../models/auth.model";
import dotenv from "dotenv";
dotenv.config();

export const auth: RequestHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized please login" });
      return;
    }

    // Verify token
    const user = await verifyUser(token);

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Request is not authorized" });
  }
};

export const verifyUser = async (token: string) => {
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!userId) {
      throw new Error("Invalid token");
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error("Authentication failed");
  }
};

export const mockAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  req.user = {
    _id: new mongoose.Types.ObjectId(),
    username: "mockUsername",
    password: "mockPassword",
    createdAt: new Date(),
  } as IUser;
  next();
};
