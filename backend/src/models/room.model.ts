import mongoose, { Document } from "mongoose";

export interface IRoom extends Document {
  codeword: string;
  status: "pending" | "active" | "finished";
  hostId: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    username: string;
    isReady: boolean;
    joinedAt: Date;
    score: number;
  }[];
  settings: {
    maxPlayers: number;
    numberOfPrompts: number;
    timeLimit: number;
  };
  currentRound: number;
  theme?: string;
  drawings: {
    userId: mongoose.Types.ObjectId;
    drawing: string;
  }[];
  currentDrawer?: {
    userId: mongoose.Types.ObjectId;
    startedAt: Date;
  };
  previousDrawers: mongoose.Types.ObjectId[];
}

const RoomSchema = new mongoose.Schema(
  {
    codeword: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "finished"],
      default: "pending",
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: { type: String, required: true },
        isReady: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
      },
    ],
    settings: {
      maxPlayers: { type: Number, required: true },
      numberOfPrompts: { type: Number, required: true },
      timeLimit: { type: Number, required: true },
    },
    currentRound: { type: Number, default: 0 },
    theme: { type: String, required: true },
    drawings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        drawing: { type: String, required: true },
      },
    ],
    currentDrawer: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      startedAt: { type: Date, default: Date.now },
    },
    previousDrawers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
