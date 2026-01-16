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
  updated_at?: string;
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
    onConfirm: () => { },
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
    <div className="min-h-screen bg-neutral-100/50 pb-24 font-sans">
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

      {/* Header - Solid Color */}
      <header className="bg-neutral-900 shadow-xl sticky top-0 z-40 text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Bistro Yahya <span className="text-primary-400">Admin</span>
            </h1>
            <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Live Control Panel
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 border border-neutral-700 text-green-400 rounded-full text-xs font-bold animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              LIVE
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 space-y-10">
        
        {/* Active Orders Section - TOP PRIORITY */}
        <section className="bg-neutral-50 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-neutral-200/60">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <span className="w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-500 text-2xl rounded-2xl border border-orange-100 shadow-sm">🔥</span>
                <div>
                   <h2 className="font-display text-2xl font-bold text-neutral-800">
                     Active Orders
                   </h2>
                   <p className="text-neutral-400 text-xs font-medium">Real-time kitchen status</p>
                </div>
             </div>
             <span className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-neutral-200">
               {activeOrders.length} Pending
             </span>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(3)].map((_, i) => (
                 <SkeletonCard key={i} variant="order" />
               ))}
             </div>
          ) : activeOrders.length === 0 ? (
             <div className="bg-neutral-50/50 border-2 border-dashed border-neutral-200 rounded-[2rem] p-16 text-center">
               <EmptyState
                 icon="👨‍🍳"
                 title="Kitchen is Quiet"
                 description="Incoming orders will appear here automatically."
               />
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Metrics Dashboard */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Daily Performance</h3>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} variant="metric" />
              ))}
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon="📦"
                label="Total Orders"
                value={metrics.ordersToday}
                color="text-neutral-800"
              />
              <MetricCard
                icon="💰"
                label="Revenue"
                value={`₹${metrics.revenueToday}`}
                color="text-primary-600"
              />
              <MetricCard
                icon="✅"
                label="Completed"
                value={metrics.completedToday}
                color="text-green-600"
              />
              <MetricCard
                icon="❌"
                label="Cancelled"
                value={metrics.cancelledToday}
                color="text-red-500"
              />
            </div>
          ) : null}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
           {/* Payments Due Section - Side Panel */}
           <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
              <section className="bg-white rounded-[2rem] p-6 border border-primary-100 shadow-lg shadow-primary-50/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <span className="text-9xl">💰</span>
                </div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-600 rounded-xl text-xl border border-green-100">�</span>
                    <div>
                        <h2 className="font-display text-xl font-bold text-neutral-800">
                        Payments
                        </h2>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Checkout Queue</p>
                    </div>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-green-200">
                    {unpaidCompletedOrders.length}
                  </span>
                </div>

                <div className="space-y-4 relative z-10">
                  {loading ? (
                    <SkeletonCard variant="order" />
                  ) : unpaidCompletedOrders.length === 0 ? (
                    <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      <div className="text-2xl mb-2 grayscale opacity-50">✨</div>
                      <p className="text-neutral-400 text-sm font-medium">No pending payments</p>
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
                        onPrepare={() => { }}
                        onComplete={() => { }}
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

           {/* Daily History Section */}
           <div className="lg:col-span-7 xl:col-span-8">
              <section className="bg-neutral-50 rounded-[2rem] p-6 sm:p-8 border border-neutral-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <span className="w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-xl text-lg">📜</span>
                     <h2 className="font-display text-xl font-bold text-neutral-800">
                        Recent History
                     </h2>
                  </div>
                  <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="group flex items-center gap-1 text-neutral-500 hover:text-primary-600 text-sm font-bold transition-colors px-4 py-2 bg-white rounded-lg border border-neutral-200 hover:border-primary-200"
                  >
                    View All
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historyOrders.slice(0, 4).map((order) => (
                    <div key={order.id} className="opacity-75 hover:opacity-100 transition-opacity">
                        <OrderCard
                        order={{
                            ...order,
                            total: getOrderTotal(order),
                            isPaid: paidOrders.has(order.id) || (order.payments && order.payments.length > 0),
                        }}
                        onPrepare={() => { }}
                        onComplete={() => { }}
                        onCancel={() => { }}
                        onCancelItem={() => { }}
                        onMarkPaid={() => { }}
                        />
                    </div>
                  ))}
                </div>
                
                {historyOrders.length === 0 && (
                    <div className="py-12 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-3xl bg-neutral-100/50">
                      <p className="text-sm">No history for today</p>
                    </div>
                )}
              </section>
           </div>
        </div>
      </main>
    </div>
  );
}
