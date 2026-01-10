import express from "express";
import {
  createOrder,
  getActiveOrderByTable,
  updateOrderStatus,
  getAllActiveOrders,
  markPaymentPaid
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/active/:table_number", getActiveOrderByTable);
router.get("/active", getAllActiveOrders);
router.patch("/:order_id/status", updateOrderStatus);
router.post("/:order_id/pay", markPaymentPaid);

export default router;
