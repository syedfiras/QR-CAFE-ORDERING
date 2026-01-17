import React, { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";

interface OrderItem {
    id: string;
    quantity: number;
    is_cancelled: boolean;
    menu_items: {
        name: string;
        price?: number;
    };
}

interface AdminOrder {
    id: string;
    status: "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";
    created_at: string;
    updated_at?: string;
    cafe_tables: {
        table_number: number;
    };
    order_items: OrderItem[];
    total?: number;
    isPaid?: boolean;
}

interface OrderCardProps {
    order: AdminOrder;
    onPrepare: () => void;
    onComplete: () => void;
    onCancel: () => void;
    onCancelItem: (itemId: string) => void;
    onMarkPaid: () => void;
}

export default function OrderCard({
    order,
    onPrepare,
    onComplete,
    onCancel,
    onCancelItem,
    onMarkPaid,
}: OrderCardProps) {
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick((t) => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        if (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
            return new Date(dateStr);
        }
        return new Date(`${dateStr}Z`);
    };

    const formatToIST = (dateStr: string) => {
        if (!dateStr) return "";
        const date = parseDate(dateStr);

        return new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        }).format(date);
    };

    const getRelativeTime = (dateStr: string) => {
        const date = parseDate(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 1000 / 60);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        const hours = Math.floor(diffMins / 60);
        return `${hours} hr ago`;
    };

    const getDuration = (startStr: string, endStr?: string) => {
        if (!endStr) return null;
        const start = parseDate(startStr);
        const end = parseDate(endStr);
        const diffMins = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
        return `${diffMins} mins`;
    };

    const activeItems = order.order_items.filter((item) => !item.is_cancelled);
    const total = order.total || 0;

    const createdTime = formatToIST(order.created_at);
    const isCompleted = order.status === 'COMPLETED';
    const completedTime = isCompleted && order.updated_at ? formatToIST(order.updated_at) : null;
    const duration = isCompleted && order.updated_at ? getDuration(order.created_at, order.updated_at) : null;
    const relativeTime = getRelativeTime(isCompleted && order.updated_at ? order.updated_at : order.created_at);

    return (
        <div className="bg-white rounded-3xl shadow-soft border-2 border-neutral-200 overflow-hidden hover:shadow-soft-lg transition-all">
            {/* Header Section - Redesigned */}
            <div className="p-5 pb-4 border-b-2 border-neutral-100">
                <div className="flex items-start justify-between mb-3">
                    {/* Table Badge - Cleaner Design */}
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl text-white font-bold text-lg shadow-soft bg-primary-700">
                            Table {order.cafe_tables.table_number}
                        </div>
                        <StatusBadge status={order.status} />
                    </div>
                </div>

                {/* Timing Section - Better Layout */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                    {isCompleted ? (
                        <>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold text-neutral-600">
                                    {createdTime} → {completedTime}
                                </span>
                            </div>
                            {duration && (
                                <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: '#F0FDF4', color: '#10B981' }}>
                                    {duration}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold text-neutral-700">{createdTime}</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{relativeTime}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Items Section */}
            <div className="p-5">
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 px-2">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-right">Price</div>
                    <div className="col-span-2"></div>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-5">
                    {activeItems.map((item) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-12 gap-2 items-center py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                            {/* Item Name */}
                            <div className="col-span-5">
                                <span className="text-sm font-semibold text-neutral-800 leading-tight">
                                    {item.menu_items.name}
                                </span>
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2 text-center">
                                <span className="inline-block text-sm font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-lg min-w-[2.5rem]">
                                    {item.quantity}
                                </span>
                            </div>

                            {/* Price */}
                            <div className="col-span-3 text-right">
                                <span className="text-sm font-bold text-neutral-800">
                                    ₹{(item.menu_items.price || 0) * item.quantity}
                                </span>
                            </div>

                            {/* Remove Button */}
                            <div className="col-span-2 flex justify-end">
                                {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                                    <button
                                        onClick={() => onCancelItem(item.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                                        title="Remove Item"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cancelled Items */}
                {order.order_items.filter((item) => item.is_cancelled).length > 0 && (
                    <div className="mb-5 pt-4 border-t-2 border-dashed border-neutral-200">
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Cancelled Items</p>
                        <div className="space-y-2">
                            {order.order_items.filter((item) => item.is_cancelled).map(item => (
                                <div key={item.id} className="flex justify-between items-center py-2 px-2 opacity-60">
                                    <span className="text-sm text-neutral-600 line-through">{item.menu_items.name}</span>
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wide">
                                        Cancelled
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Total Section */}
                <div className="pt-4 border-t-2 border-neutral-200 mb-5">
                    <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#FFF0ED' }}>
                        <span className="text-sm font-bold text-neutral-600 uppercase tracking-wider">Total</span>
                        <span className="text-3xl font-bold text-primary-700">₹{total}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {order.status === "PENDING" && (
                        <div className="grid grid-cols-2 gap-3">
                            <Button size="md" variant="destructive" onClick={onCancel} className="w-full">
                                Cancel
                            </Button>
                            <button
                                onClick={onPrepare}
                                className="w-full px-4 py-3 rounded-2xl text-white font-bold text-sm shadow-soft active:scale-95 transition-all bg-primary-700"
                            >
                                Prepare
                            </button>
                        </div>
                    )}

                    {order.status === "PREPARING" && (
                        <button
                            onClick={onComplete}
                            className="w-full px-4 py-3 rounded-2xl text-white font-bold text-sm shadow-soft-lg active:scale-95 transition-all bg-primary-700"
                        >
                            Complete Order
                        </button>
                    )}

                    {order.status === "COMPLETED" && !order.isPaid && (
                        <button
                            onClick={onMarkPaid}
                            className="w-full px-4 py-3 rounded-2xl text-white font-bold text-base shadow-soft-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                            style={{ background: '#10B981' }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mark as Paid
                        </button>
                    )}

                    {order.status === "COMPLETED" && order.isPaid && (
                        <div className="text-center py-3 px-4 rounded-2xl border-2 border-green-200" style={{ background: '#F0FDF4' }}>
                            <div className="flex items-center justify-center gap-2 text-green-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-bold text-sm uppercase tracking-wider">Payment Received</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
