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
    <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-shadow border border-neutral-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 border-b border-neutral-50 pb-3">
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
          <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
            {getRelativeTime(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="mb-6 space-y-3">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between group py-1"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mr-4">
                <span className="text-neutral-800 font-medium">
                  {item.menu_items.name} × {item.quantity}
                </span>
                <span className="text-neutral-500 text-sm">
                  ₹{(item.menu_items.price || 0) * item.quantity}
                </span>
              </div>
            </div>
            {order.status !== "COMPLETED" && (
              <button
                onClick={() => onCancelItem(item.id)}
                className="text-status-cancelled hover:bg-red-50 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all border border-red-100"
              >
                Cancel
              </button>
            )}
          </div>
        ))}

        {/* Cancelled items */}
        {order.order_items
          .filter((item) => item.is_cancelled)
          .map((item) => (
            <div key={item.id} className="flex items-center justify-between opacity-40 py-1 italic">
              <span className="text-neutral-600 line-through text-sm">
                {item.menu_items.name} × {item.quantity}
              </span>
              <span className="text-[10px] font-bold text-status-cancelled uppercase">Cancelled</span>
            </div>
          ))}
      </div>

      {/* Total */}
      <div className="border-t border-neutral-200 pt-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-700">Order Total</span>
          <span className="text-2xl font-bold text-primary-400">₹{total}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {order.status === "PENDING" && (
          <Button size="sm" onClick={onPrepare} className="flex-1 bg-primary-300 hover:bg-primary-400">
            🔥 Prepare
          </Button>
        )}

        {order.status === "PREPARING" && (
          <Button size="sm" onClick={onComplete} className="flex-1 bg-status-completed hover:bg-green-400 text-green-900 border-green-200">
            ✅ Complete
          </Button>
        )}

        {!order.isPaid && order.status === "COMPLETED" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onMarkPaid}
              className="flex-1 shadow-sm"
            >
              💳 Mark as Paid
            </Button>
          )}

        {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
          <Button size="sm" variant="destructive" 
            onClick={onCancel}
          >
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}
