import express from "express";
import { login, logout, checkAuth } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/check", checkAuth);

export default router;
