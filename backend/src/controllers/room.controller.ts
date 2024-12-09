import { Request, Response, NextFunction } from "express";
import { Room } from "../models/room.model";
import { AuthRequest } from "../models/auth.model";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import {
  validateRoomSettings,
  validateCodeword,
} from "../validator/room.validator";

export const createRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { codeword, maxPlayers, numberOfPrompts, timeLimit } = req.body;

    // Validate inputs
    validateRoomSettings({ maxPlayers, numberOfPrompts, timeLimit });
    validateCodeword(codeword);

    // check if codeword is already taken
    const existingRoom = await Room.findOne({ codeword });
    if (existingRoom) throw new ValidationError("Codeword already taken");

    // create room
    const room = await Room.create({
      codeword,
      hostId: req.user?._id,
      status: "pending",
      settings: { maxPlayers, numberOfPrompts, timeLimit },
      theme: "test theme",
    });

    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { codeword } = req.body;
    // check if room exists
    const room = await Room.findOne({ codeword });
    if (!room) throw new NotFoundError("Room not found");

    // check if room is full
    if (room.members.length >= room.settings.maxPlayers) {
      throw new ValidationError("Room is full");
    }

    if (!req.user || !req.user._id) throw new UnauthorizedError("Unauthorized");
    // don't add user in controller, add in socket
    res.status(200).json({ room });
  } catch (error) {
    next(error);
  }
};

// /api/rooms/:id/ready
export const readyRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // check if room exists
    const room = await Room.findById(id);
    if (!room) throw new NotFoundError("Room not found");

    // check if user is in room
    const member = room.members.find((member) =>
      member.userId.equals(req.user?._id)
    );
    if (!member) throw new UnauthorizedError("Unauthorized");

    // set user as ready
    member.isReady = true;
    await room.save();

    res.status(200).json({ room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // check if room exists
  const room = await Room.findById(id);
  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  // check if user is host
  if (!room.hostId.equals(req.user?._id)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
