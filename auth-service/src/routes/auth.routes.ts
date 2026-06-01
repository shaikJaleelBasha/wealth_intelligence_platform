import express from "express";
import { login, registerUser, updateProfile } from "../controllers/auth.controller";

const router = express.Router();

router.post("/login", login);
router.post("/register", registerUser);
router.put("/profile", updateProfile);

export default router;
