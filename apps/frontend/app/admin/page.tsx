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
import ConfirmModal from "../components/ConfirmModal";
import HistoryModal from "../components/HistoryModal";

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
  payments?: {
    status: string;
    method: string;
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (q?: number) => void;
    variant: "primary" | "secondary" | "destructive";
    maxQuantity?: number;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "primary",
    maxQuantity: 1,
  });

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

  const handleCancelItem = (itemId: string, itemName: string, currentQuantity: number) => {
    setConfirmState({
      isOpen: true,
      title: "Cancel Item",
      message: `Are you sure you want to remove "${itemName}" from the order?`,
      variant: "destructive",
      maxQuantity: currentQuantity,
      onConfirm: async (qty?: number) => {
        await cancelOrderItem(itemId, qty);
        loadOrders();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCancelOrder = (orderId: string, tableNumber: number) => {
    setConfirmState({
      isOpen: true,
      title: "Cancel Order",
      message: `This will cancel the entire order for Table ${tableNumber}. This action cannot be undone.`,
      variant: "destructive",
      maxQuantity: 1,
      onConfirm: async () => {
        await cancelOrder(orderId);
        loadOrders();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
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

  const activeOrders = orders.filter(o => o.status === "PENDING" || o.status === "PREPARING");
  const unpaidCompletedOrders = orders.filter(o => o.status === "COMPLETED" && !paidOrders.has(o.id) && (!o.payments || o.payments.length === 0));
  const historyOrders = orders.filter(o => o.status === "CANCELLED" || (o.status === "COMPLETED" && (paidOrders.has(o.id) || (o.payments && o.payments.length > 0))));

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white pb-24">
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        variant={confirmState.variant}
        maxQuantity={confirmState.maxQuantity}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-400">
              Bistro Yahya Admin
            </h1>
            <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Live Control Panel • Daily Operations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              LIVE
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {/* Metrics Dashboard */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-neutral-800 flex items-center gap-2">
              <span className="text-primary-400">📊</span> Today's Performance
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} variant="metric" />
              ))}
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Operations Section */}
            <div className="lg:col-span-8 space-y-12">
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-2xl font-bold text-neutral-800 flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-500 rounded-xl text-sm">🔥</span> 
                            Active Orders
                        </h2>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                            {activeOrders.length} In Progress
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(2)].map((_, i) => (
                                <SkeletonCard key={i} variant="order" />
                            ))}
                        </div>
                    ) : activeOrders.length === 0 ? (
                        <div className="bg-white/50 border-2 border-dashed border-neutral-200 rounded-[2rem] p-16 text-center">
                            <EmptyState
                                icon="☕"
                                title="Ready for Orders"
                                description="Incoming table orders will pop up here instantly"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={{
                                        ...order,
                                        total: getOrderTotal(order),
                                        isPaid: paidOrders.has(order.id) || (order.payments && order.payments.length > 0),
                                    }}
                                    onPrepare={() => handleStatusChange(order.id, "PREPARING")}
                                    onComplete={() => handleStatusChange(order.id, "COMPLETED")}
                                    onCancel={() => handleCancelOrder(order.id, order.cafe_tables.table_number)}
                                    onCancelItem={(itemId) => {
                                        const item = order.order_items.find(i => i.id === itemId);
                                        handleCancelItem(itemId, item?.menu_items.name || "item", item?.quantity || 1);
                                    }}
                                    onMarkPaid={() => handleMarkPaid(order.id)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6 opacity-60">
                        <h2 className="font-display text-xl font-bold text-neutral-800 flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-neutral-100 text-neutral-500 rounded-xl text-sm">📜</span> 
                            Daily History
                        </h2>
                        <button 
                            onClick={() => setIsHistoryOpen(true)}
                            className="text-primary-400 text-xs font-bold hover:underline"
                        >
                            View All Data
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 grayscale-[0.5]">
                        {historyOrders.slice(0, 4).map((order) => (
                             <OrderCard
                                key={order.id}
                                order={{
                                    ...order,
                                    total: getOrderTotal(order),
                                    isPaid: paidOrders.has(order.id) || (order.payments && order.payments.length > 0),
                                }}
                                onPrepare={() => {}}
                                onComplete={() => {}}
                                onCancel={() => {}}
                                onCancelItem={() => {}}
                                onMarkPaid={() => {}}
                            />
                        ))}
                        {historyOrders.length === 0 && (
                            <div className="col-span-full py-12 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-3xl">
                                <p className="text-sm">No historical data for today yet</p>
                            </div>
                        )}
                        {historyOrders.length > 4 && (
                            <button 
                                onClick={() => setIsHistoryOpen(true)}
                                className="col-span-full py-4 bg-white border border-neutral-100 rounded-2xl text-neutral-500 font-bold hover:bg-primary-50 transition-colors"
                            >
                                Show More History (+{historyOrders.length - 4})
                            </button>
                        )}
                    </div>
                </section>
            </div>

            {/* Side Payment Section */}
            <div className="lg:col-span-4">
                <section className="bg-primary-50/70 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-soft sticky top-[100px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="font-display text-xl font-bold text-neutral-800 flex items-center gap-2">
                                <span className="text-green-500">💰</span> Payments Due
                            </h2>
                            <p className="text-neutral-500 text-[10px] font-bold uppercase mt-1">Ready for Checkout</p>
                        </div>
                        <span className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-black shadow-lg">
                            {unpaidCompletedOrders.length}
                        </span>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <SkeletonCard variant="order" />
                        ) : unpaidCompletedOrders.length === 0 ? (
                            <div className="text-center py-16 bg-white/40 rounded-[2rem] border-2 border-dashed border-primary-200">
                                <div className="text-3xl mb-3">🎐</div>
                                <p className="text-neutral-500 text-sm font-medium">All settled up!</p>
                            </div>
                        ) : (
                            unpaidCompletedOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={{
                                        ...order,
                                        total: getOrderTotal(order),
                                        isPaid: paidOrders.has(order.id) || (order.payments && order.payments.length > 0),
                                    }}
                                    onPrepare={() => {}}
                                    onComplete={() => {}}
                                    onCancel={() => handleCancelOrder(order.id, order.cafe_tables.table_number)}
                                    onCancelItem={(itemId) => {
                                        const item = order.order_items.find(i => i.id === itemId);
                                        handleCancelItem(itemId, item?.menu_items.name || "item", item?.quantity || 1);
                                    }}
                                    onMarkPaid={() => handleMarkPaid(order.id)}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
      </main>
    </div>
  );
}
