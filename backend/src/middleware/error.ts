import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AuthRequest } from "../models/auth.model";
import { AppError } from "../utils/errors";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    return;
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      status: "validation_error",
      message: err.message,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    res.status(400).json({
      status: "validation_error",
      message: "Duplicate value entered",
    });
    return;
  }

  // Default error
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
  return;
};
