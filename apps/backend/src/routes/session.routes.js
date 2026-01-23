import express from "express";
import { startSession, validateSession } from "../controllers/session.controller.js";

const router = express.Router();

// POST /api/sessions/start - Start or validate a session
router.post("/start", startSession);

// GET /api/sessions/validate/:token - Validate a session token
router.get("/validate/:token", validateSession);

export default router;
