"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActiveOrder } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";

interface OrderItem {
  id: string;
  quantity: number;
  is_cancelled: boolean;
  menu_items: {
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  status: "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";
  items: OrderItem[];
  total: number;
}

export default function OrderPage() {
  const params = useSearchParams();
  const router = useRouter();
  const table = params.get("table");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll for order updates
  useEffect(() => {
    if (!table) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      const data = await getActiveOrder(table);
      
      if (!data) {
        // No active order, redirect to menu
        router.push(`/menu?table=${table}`);
        return;
      }

      if (data.status === "COMPLETED") {
        // Order completed, redirect to menu after a delay
        setTimeout(() => {
          router.push(`/menu?table=${table}`);
        }, 2000);
      }

      setOrder(data);
      setLoading(false);
    };

    // Initial fetch
    fetchOrder();

    // Poll every 5 seconds
    const interval = setInterval(fetchOrder, 5000);

    return () => clearInterval(interval);
  }, [table, router]);

  const handleAddMore = () => {
    router.push(`/menu?table=${table}&add_more=true`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <SkeletonCard variant="order" />
          <SkeletonCard variant="order" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <EmptyState
          title="No active order"
          description="Place an order from the menu to track it here"
          action={
            <Button onClick={() => router.push(`/menu?table=${table}`)}>
              View Menu
            </Button>
          }
        />
      </div>
    );
  }

  const activeItems = order.items.filter((item) => !item.is_cancelled);
  const cancelledItems = order.items.filter((item) => item.is_cancelled);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-400">
                Bistro Yahya
              </h1>
              <p className="text-neutral-500 text-sm">Table {table}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          
          {/* Order time */}
          <p className="text-neutral-500 text-sm">
            Order placed • Tracking in real-time
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
        {/* Order items */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <h2 className="font-semibold text-lg text-neutral-800 mb-4">
            Your Order
          </h2>

          {activeItems.length > 0 ? (
            <div className="space-y-3 mb-4">
              {activeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">
                      {item.menu_items.name}
                    </p>
                    <p className="text-neutral-500 text-sm">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-neutral-800">
                    ₹{item.menu_items.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-4">
              All items have been cancelled
            </p>
          )}

          {/* Cancelled items */}
          {cancelledItems.length > 0 && (
            <div className="border-t border-neutral-200 pt-4 mt-4">
              <p className="text-neutral-500 text-sm mb-2">Cancelled Items</p>
              {cancelledItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 opacity-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-neutral-600 line-through">
                      {item.menu_items.name}
                    </p>
                    <span className="inline-block bg-status-cancelled text-red-900 text-xs px-2 py-1 rounded-full mt-1">
                      Cancelled
                    </span>
                  </div>
                  <p className="font-semibold text-neutral-600 line-through">
                    ₹{item.menu_items.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t border-neutral-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-neutral-800">Total</p>
              <p className="text-2xl font-bold text-primary-400">₹{order.total}</p>
            </div>
          </div>
        </div>

        {/* Info message */}
        <div className="bg-primary-50 rounded-2xl p-4 text-center mb-6">
          <p className="text-primary-700 text-sm">
            💡 For cancellation or changes, please contact staff
          </p>
        </div>

        {/* Add more button */}
        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
          <Button size="lg" variant="secondary" onClick={handleAddMore} className="w-full">
            Add More Items
          </Button>
        )}

        {/* Completion message */}
        {order.status === "COMPLETED" && (
          <div className="bg-status-completed rounded-2xl p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Order Completed!
            </h3>
            <p className="text-green-800">
              Thank you for dining at Bistro Yahya
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
