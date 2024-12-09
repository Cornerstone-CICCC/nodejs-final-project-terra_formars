import express from "express";
import {
  createRoom,
  joinRoom,
  readyRoom,
  deleteRoom,
} from "../controllers/room.controller";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createRoom);
router.post("/join", auth, joinRoom);
router.post("/:roomId/ready", auth, readyRoom);
router.post("/:roomId/delete", auth, deleteRoom);

export default router;
