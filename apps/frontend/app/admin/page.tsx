"use client";

import { useEffect, useState } from "react";
import {
  getAllActiveOrders,
  updateOrderStatus,
} from "../services/api";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = async () => {
    const data = await getAllActiveOrders();
    setOrders(data || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
    loadOrders();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Active Orders</h1>

      {orders.length === 0 && <p>No active orders</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          className="border p-4 mb-4 rounded"
        >
          <p className="font-semibold">
            Table: {order.cafe_tables.table_number}
          </p>

          <ul className="ml-4 list-disc">
            {order.order_items.map((item: any, i: number) => (
              <li key={i}>
                {item.menu_items.name} × {item.quantity}
              </li>
            ))}
          </ul>

          <p className="mt-2">Status: {order.status}</p>

          <div className="mt-2 flex gap-2">
            {order.status === "PENDING" && (
              <button
                className="px-3 py-1 bg-yellow-500 text-white"
                onClick={() =>
                  handleStatusChange(order.id, "PREPARING")
                }
              >
                Prepare
              </button>
            )}

            {order.status === "PREPARING" && (
              <button
                className="px-3 py-1 bg-green-600 text-white"
                onClick={() =>
                  handleStatusChange(order.id, "COMPLETED")
                }
              >
                Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
