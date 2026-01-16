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
    // Ensure the timestamp is parsed correctly. 
    // If it doesn't end with Z or a timezone offset, assume it's UTC from the database.
    const isoTimestamp = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T');
    const normalizedTimestamp = (isoTimestamp.endsWith('Z') || isoTimestamp.includes('+'))
      ? isoTimestamp
      : `${isoTimestamp}Z`;

    const now = new Date().getTime();
    const then = new Date(normalizedTimestamp).getTime();
    const diff = Math.floor((now - then) / 1000 / 60); // minutes

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hr ago`;
  };

  const activeItems = order.order_items.filter((item) => !item.is_cancelled);
  const total = order.total || 0;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm p-6 hover:shadow-xl transition-all duration-300 border border-neutral-100 group relative overflow-hidden">
      {/* Table Badge Absolute */}
      <div className="absolute top-0 left-0 bg-primary-50 pl-4 pb-6 pt-4 pr-6 rounded-br-[2.5rem]">
        <span className="font-display text-2xl font-bold text-primary-500">Table {order.cafe_tables.table_number}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 mb-8 items-end">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            {getRelativeTime(order.created_at)}
          </h3>
          <span className="text-neutral-300">•</span>

        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>

      {/* Items */}
      <div className="mb-8 space-y-4">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col py-2 border-b border-dashed border-neutral-100 last:border-0"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h4 className="text-neutral-800 font-bold text-base leading-tight">
                  {item.menu_items.name}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-md text-xs font-bold">
                    {item.quantity}x
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    @ ₹{item.menu_items.price}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-neutral-800">
                  ₹{(item.menu_items.price || 0) * item.quantity}
                </span>
                {order.status !== "COMPLETED" && (
                  <button
                    onClick={() => onCancelItem(item.id)}
                    className="text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Cancelled items */}
        {order.order_items.filter((item) => item.is_cancelled).length > 0 && (
          <div className="pt-4 mt-4 border-t border-dashed border-neutral-100">
            {order.order_items
              .filter((item) => item.is_cancelled)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between opacity-40 py-1">
                  <span className="text-neutral-500 line-through text-xs font-medium">
                    {item.quantity}x {item.menu_items.name}
                  </span>
                  <span className="text-[10px] font-bold text-red-500 uppercase">Cancelled</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-end justify-between mb-6 pb-6 border-b border-neutral-100">
        <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Total Bill</span>
        <span className="text-3xl font-bold text-neutral-800 tracking-tight">₹{total}</span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        {order.status === "PENDING" && (
          <>
            <Button size="sm" onClick={onPrepare} className="bg-primary-500  text-white shadow-lg shadow-primary-200 h-12 rounded-xl text-md">
              Prepare
            </Button>
            <Button size="sm" variant="destructive" onClick={onCancel} className="  border-red text-red h-12 rounded-xl">
              Cancel
            </Button>
          </>
        )}

        {order.status === "PREPARING" && (
          <Button size="sm" onClick={onComplete} className="col-span-2 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200 h-12 rounded-xl text-md">
            Complete
          </Button>
        )}

        {!order.isPaid && order.status === "COMPLETED" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onMarkPaid}
            className="col-span-2  text-pink-500  h-12 rounded-xl text-md shadow-lg shadow-neutral-200"
          >
            💳 Mark as Paid
          </Button>
        )}

        {order.status !== "CANCELLED" && order.status !== "COMPLETED" && order.status !== "PENDING" && (
          <div className="col-span-2 flex justify-center mt-2">
            <button
              onClick={onCancel}
              className="text-neutral-300 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancel Order
            </button>
          </div>
        )}
        {order.status === "COMPLETED" && (
          <div className="col-span-2 text-center text-neutral-300 text-xs font-bold uppercase tracking-widest">
            Completed
          </div>
        )}
      </div>
    </div>
  );
}
