import express from "express";
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } from "../controllers/menu.controller.js";

import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getMenu);
router.post("/items", upload.single("image"), createMenuItem);
router.put("/items/:id", upload.single("image"), updateMenuItem);
router.delete("/items/:id", deleteMenuItem);

export default router;
