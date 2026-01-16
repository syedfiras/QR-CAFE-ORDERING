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

  const [statusUpdatedAt, setStatusUpdatedAt] = useState<number | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  // Poll for order updates
  useEffect(() => {
    if (!table) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await getActiveOrder(table);
        
        if (!data) {
          // No active or recently completed order, go to menu
          router.push(`/menu?table=${table}`);
          return;
        }

        if (data.status === "COMPLETED" && lastStatus !== "COMPLETED") {
          setStatusUpdatedAt(Date.now());
          setLastStatus("COMPLETED");
        }

        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [table, router, lastStatus]);

  // Auto-redirect after 2 minutes of being completed
  useEffect(() => {
    if (order?.status === "COMPLETED" && statusUpdatedAt) {
      const timer = setTimeout(() => {
        router.push(`/menu?table=${table}&new=true`);
      }, 60000); // 1 minute
      return () => clearTimeout(timer);
    }
  }, [order?.status, statusUpdatedAt, table, router]);

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
            <Button onClick={() => router.push(`/menu?table=${table}&new=true`)}>
              View Menu
            </Button>
          }
        />
      </div>
    );
  }

  if (order.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[3rem] shadow-soft-xl p-12 max-w-md w-full border border-neutral-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-5xl mb-8 animate-bounce">
            🎉
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-800 mb-2">
            Thank You!
          </h1>
          <p className="text-neutral-500 mb-8 px-4">
            We hope you enjoyed your meal at <span className="text-primary-400 font-bold">Bistro Yahya</span>.
          </p>

          {/* Feedback Star Placeholder */}
          <div className="flex gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-3xl text-orange-300">★</span>
            ))}
          </div>

          <div className="w-full space-y-4">
            <Button 
                size="lg" 
                onClick={() => router.push(`/menu?table=${table}&new=true`)}
                className="w-full py-5 rounded-[2rem] text-lg font-bold shadow-soft-lg"
            >
              Start New Order
            </Button>
            
            <div className="pt-8 border-t border-neutral-100 w-full text-center">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-2">New Customer?</p>
                <button 
                    onClick={() => router.push(`/menu?table=${table}&new=true`)}
                    className="text-primary-400 text-sm font-bold hover:underline"
                >
                    Not You? Order Now →
                </button>
            </div>
          </div>
        </div>
        
        <p className="mt-12 text-neutral-400 text-xs font-medium italic">
          Redirecting to menu in 1 minute...
        </p>
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
          <p className="text-neutral-500 text-sm italic font-medium">
            Order tracking is live • Updated just now
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
        {/* Order items */}
        <div className="bg-white rounded-3xl shadow-soft p-8 mb-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-neutral-800 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-500 rounded-xl text-xs">☕</span>
                Your Selection
            </h2>
            <span className="bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                {activeItems.length} items
            </span>
          </div>

          {activeItems.length > 0 ? (
            <div className="space-y-4 mb-6">
              {activeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">
                      {item.menu_items.name}
                    </p>
                    <p className="text-neutral-400 text-xs font-bold uppercase">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-neutral-800">
                    ₹{item.menu_items.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8 bg-neutral-50 rounded-2xl italic border-2 border-dashed border-neutral-100">
              All items have been cancelled
            </p>
          )}

          {/* Cancelled items */}
          {cancelledItems.length > 0 && (
            <div className="border-t border-neutral-100 pt-6 mt-6">
              <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-3">Cancelled Items</p>
              {cancelledItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 opacity-50 grayscale"
                >
                  <div className="flex-1">
                    <p className="font-bold text-neutral-600 line-through">
                      {item.menu_items.name}
                    </p>
                  </div>
                  <span className="text-status-cancelled text-[10px] font-black uppercase bg-red-50 px-2 py-0.5 rounded-full">
                    Cancelled
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t border-neutral-100 pt-6 mt-6">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-white">
              <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs">Final Bill Value</p>
              <p className="text-3xl font-black text-primary-400">₹{order.total}</p>
            </div>
          </div>
        </div>

        {/* Info message */}
        <div className="bg-pink-300 rounded-3xl p-6 text-center mb-10 shadow-lg">
          <p className="text-white text-sm font-medium flex items-center justify-center gap-2">
            <span className="text-xl">💡</span> For assistance or faster billing, please call staff
          </p>
        </div>

        {/* Add more button */}
        {order.status !== "CANCELLED" && (
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleAddMore} 
            className="w-full py-5 rounded-2xl shadow-soft font-black text-lg border-primary-200"
          >
            Add More Items
          </Button>
        )}
      </main>
    </div>
  );
}
