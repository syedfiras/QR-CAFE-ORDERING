"use client";

import { useEffect, useState } from "react";
import {
  getAllActiveOrders,
  updateOrderStatus,
  cancelOrderItem,
  cancelOrder,
  markAsPaid,
  getMetrics,
} from "../services/api";
import MetricCard from "../components/MetricCard";
import OrderCard from "../components/OrderCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";

interface AdminOrder {
  id: string;
  status: "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";
  created_at: string;
  cafe_tables: {
    table_number: number;
  };
  order_items: {
    id: string;
    quantity: number;
    is_cancelled: boolean;
    menu_items: {
      name: string;
      price?: number;
    };
  }[];
}

interface Metrics {
  ordersToday: number;
  revenueToday: number;
  paidOrders: number;
  unpaidOrders: number;
  completedToday: number;
  cancelledToday: number;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [paidOrders, setPaidOrders] = useState<Set<string>>(new Set());

  const loadOrders = async () => {
    try {
      const data = await getAllActiveOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadOrders(), loadMetrics()]);
      setLoading(false);
    };

    loadData();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      loadOrders();
      loadMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
    loadOrders();
  };

  const handleCancelItem = async (itemId: string) => {
    if (confirm("Cancel this item?")) {
      await cancelOrderItem(itemId);
      loadOrders();
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm("Cancel entire order?")) {
      await cancelOrder(orderId);
      loadOrders();
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    await markAsPaid(orderId);
    setPaidOrders((prev) => new Set(prev).add(orderId));
    loadOrders();
    loadMetrics();
  };

  // Calculate totals for orders
  const getOrderTotal = (order: AdminOrder) => {
    return order.order_items
      .filter((item) => !item.is_cancelled)
      .reduce(
        (sum, item) => sum + (item.menu_items.price || 0) * item.quantity,
        0
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white pb-12">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-400">
            Bistro Yahya Admin
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Managing orders • Auto-refresh every 5 seconds
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* Metrics Dashboard */}
        <section className="mb-8">
          <h2 className="font-display text-2xl font-bold text-neutral-800 mb-4">
            Today's Metrics
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} variant="metric" />
              ))}
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                icon="📦"
                label="Orders Today"
                value={metrics.ordersToday}
                color="primary-300"
              />
              <MetricCard
                icon="💰"
                label="Revenue"
                value={`₹${metrics.revenueToday}`}
                color="status-completed"
              />
              <MetricCard
                icon="✅"
                label="Completed"
                value={metrics.completedToday}
                color="status-completed"
              />
              <MetricCard
                icon="💳"
                label="Paid"
                value={metrics.paidOrders}
                color="primary-300"
              />
              <MetricCard
                icon="⏳"
                label="Unpaid"
                value={metrics.unpaidOrders}
                color="status-pending"
              />
              <MetricCard
                icon="❌"
                label="Cancelled"
                value={metrics.cancelledToday}
                color="status-cancelled"
              />
            </div>
          ) : null}
        </section>

        {/* Active Orders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-neutral-800">
              Active Orders
            </h2>
            <span className="text-neutral-500 text-sm">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} variant="order" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No active orders"
              description="Orders will appear here as customers place them"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={{
                    ...order,
                    total: getOrderTotal(order),
                    isPaid: paidOrders.has(order.id),
                  }}
                  onPrepare={() => handleStatusChange(order.id, "PREPARING")}
                  onComplete={() => handleStatusChange(order.id, "COMPLETED")}
                  onCancel={() => handleCancelOrder(order.id)}
                  onCancelItem={handleCancelItem}
                  onMarkPaid={() => handleMarkPaid(order.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
