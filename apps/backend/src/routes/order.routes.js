import express from "express";
import {
  createOrder,
  getActiveOrderByTable,
  updateOrderStatus,
  getAllActiveOrders,
  markPaymentPaid,
  cancelOrderItem,
  cancelOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/active/:table_number", getActiveOrderByTable);
router.get("/active", getAllActiveOrders);
router.patch("/:order_id/status", updateOrderStatus);
router.patch("/items/:item_id/cancel", cancelOrderItem);
router.post("/:order_id/pay", markPaymentPaid);
router.patch("/:order_id/cancel", cancelOrder);

export default router;
