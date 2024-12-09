import express from "express";
import { signup, login, logout, getMe } from "../controllers/auth.controller";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, getMe);

export default router;
