"use client";

import { useEffect, useState } from "react";
import {
    getAllActiveOrders,
    updateOrderStatus,
    cancelOrderItem,
    cancelOrder,
    markAsPaid,
    getMetrics,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from "../services/api";
import MetricCard from "../components/MetricCard";
import OrderCard from "../components/OrderCard";
import AddItemModal from "../components/AddItemModal";
import ManageItemsModal from "../components/ManageItemsModal";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import HistoryModal from "../components/HistoryModal";
import Image from "next/image";

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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

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

    const handleSaveItem = async (formData: FormData) => {
        if (editingItem) {
            await updateMenuItem(editingItem.id, formData);
        } else {
            await createMenuItem(formData);
        }
    };

    const handleEditItem = (item: any) => {
        setEditingItem(item);
        setIsManageModalOpen(false);
        setIsAddModalOpen(true);
    };

    const handleDeleteItem = async (id: string) => {
        await deleteMenuItem(id);
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
        <div className="min-h-screen pb-24 font-sans bg-primary-50">
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

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                }}
                onSubmit={handleSaveItem}
                initialData={editingItem}
                onBack={() => {
                    setIsAddModalOpen(false);
                    setIsManageModalOpen(true);
                }}
            />

            <ManageItemsModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                onAddNew={() => {
                    setEditingItem(null);
                    setIsManageModalOpen(false);
                    setIsAddModalOpen(true);
                }}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
            />

            {/* Header */}
            <header className="shadow-soft-xl sticky top-0 z-40 text-white border-b-2 bg-primary-700 border-primary-800">
                <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-2xl bg-white/95 flex items-center justify-center shadow-soft overflow-hidden">
                            <Image
                                src="/images/Bistro Yahya.png"
                                alt="Logo"
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Bistro Yahya <span className="text-primary-200">Admin</span>
                            </h1>
                            <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider mt-0.5">
                                Live Control Panel
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsManageModalOpen(true)}
                            className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10"
                        >
                            <span className="text-lg leading-none">⚙️</span>
                            Manage Items
                        </button>
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-100 border border-green-400/30 rounded-full text-xs font-bold animate-pulse">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                            LIVE
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 space-y-10">

                {/* Active Orders Section - TOP PRIORITY */}
                <section className="rounded-3xl p-6 sm:p-8 shadow-soft border-2" style={{ background: '#FFFBF7', borderColor: '#E7E5E4' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-12 flex items-center justify-center rounded-2xl text-2xl shadow-soft bg-primary-50 text-primary-700">
                                🔥
                            </span>
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-800">
                                    Active Orders
                                </h2>
                                <p className="text-neutral-500 text-sm font-medium">Real-time kitchen status</p>
                            </div>
                        </div>
                        <span className="text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-soft bg-primary-700">
                            {activeOrders.length} Active
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonCard key={i} variant="order" />
                            ))}
                        </div>
                    ) : activeOrders.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-neutral-200 rounded-3xl p-4 text-center">
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
                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Daily Performance</h3>
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
                                color="#db7c87"
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
                        <section className="bg-white rounded-3xl p-6 border-2 shadow-soft-lg overflow-hidden relative" style={{ borderColor: '#E8D4DD' }}>
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                <span className="text-9xl">💰</span>
                            </div>

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className="w-11 h-11 flex items-center justify-center bg-green-50 text-green-600 rounded-2xl text-xl border-2 border-green-100 shadow-soft">
                                        💵
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-800">
                                            Payments
                                        </h2>
                                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Checkout Queue</p>
                                    </div>
                                </div>
                                <span className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-soft">
                                    {unpaidCompletedOrders.length}
                                </span>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {loading ? (
                                    <SkeletonCard variant="order" />
                                ) : unpaidCompletedOrders.length === 0 ? (
                                    <div className="text-center py-12 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                                        <div className="text-3xl mb-2 opacity-30">✨</div>
                                        <p className="text-neutral-500 text-sm font-medium">No pending payments</p>
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
                        <section className="rounded-3xl p-6 sm:p-8 border-2 shadow-soft" style={{ background: '#FFFBF7', borderColor: '#E7E5E4' }}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-11 h-11 flex items-center justify-center bg-white border-2 border-neutral-200 text-neutral-500 rounded-2xl text-lg shadow-soft">
                                        📜
                                    </span>
                                    <h2 className="text-xl font-bold text-neutral-800">
                                        Recent History
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsHistoryOpen(true)}
                                    className="group flex items-center gap-2 text-neutral-600 text-sm font-bold transition-colors px-4 py-2.5 bg-white rounded-xl border-2 border-neutral-200 shadow-soft active:scale-95"
                                    style={{ borderColor: '#E7E5E4' }}
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
                                <div className="py-12 text-center text-neutral-500 border-2 border-dashed border-neutral-200 rounded-3xl bg-white">
                                    <p className="text-sm">No history for today</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div >
    );
}
