import React from "react";
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
  const getRelativeTime = (timestamp: string) => {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diff = Math.floor((now - then) / 1000 / 60); // minutes

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min${diff > 1 ? "s" : ""} ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  };

  const activeItems = order.order_items.filter((item) => !item.is_cancelled);
  const total = order.total || 0;

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display text-2xl font-bold text-neutral-800">
              Table {order.cafe_tables.table_number}
            </h3>
            {order.isPaid && (
              <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                💳 Paid
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-sm">
            {getRelativeTime(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="mb-4 space-y-2">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between group"
          >
            <div className="flex-1">
              <span className="text-neutral-800">
                {item.menu_items.name} × {item.quantity}
              </span>
            </div>
            <button
              onClick={() => onCancelItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-status-cancelled hover:bg-red-50 px-2 py-1 rounded text-xs transition-all"
            >
              Cancel
            </button>
          </div>
        ))}

        {/* Cancelled items */}
        {order.order_items
          .filter((item) => item.is_cancelled)
          .map((item) => (
            <div key={item.id} className="flex items-center gap-2 opacity-50">
              <span className="text-neutral-600 line-through text-sm">
                {item.menu_items.name} × {item.quantity}
              </span>
              <span className="text-xs text-status-cancelled">Cancelled</span>
            </div>
          ))}
      </div>

      {/* Total */}
      <div className="border-t border-neutral-200 pt-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-700">Total</span>
          <span className="text-xl font-bold text-primary-400">₹{total}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {order.status === "PENDING" && (
          <Button size="sm" onClick={onPrepare} className="flex-1">
            🔥 Prepare
          </Button>
        )}

        {order.status === "PREPARING" && (
          <Button size="sm" onClick={onComplete} className="flex-1">
            ✅ Complete
          </Button>
        )}

        {!order.isPaid &&
          (order.status === "COMPLETED" || order.status === "PREPARING") && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onMarkPaid}
              className="flex-1"
            >
              💳 Mark as Paid
            </Button>
          )}

        {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
          <Button size="sm" variant="destructive" onClick={onCancel}>
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}
