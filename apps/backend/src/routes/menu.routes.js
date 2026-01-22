import express from "express";
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } from "../controllers/menu.controller.js";

import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configure multer for multiple file fields
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "categoryImage", maxCount: 1 }
]);

router.get("/", getMenu);
router.post("/items", uploadFields, createMenuItem);
router.put("/items/:id", upload.single("image"), updateMenuItem);
router.delete("/items/:id", deleteMenuItem);

export default router;

