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

  // Auto-redirect after 1 minute of being completed
  useEffect(() => {
    if (order?.status === "COMPLETED" && statusUpdatedAt) {
      const timer = setTimeout(() => {
        router.push(`/menu?table=${table}&new=true`);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [order?.status, statusUpdatedAt, table, router]);

  const handleAddMore = () => {
    router.push(`/menu?table=${table}&add_more=true`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{background: '#FFF5ED'}}>
        <div className="max-w-2xl mx-auto space-y-4">
          <SkeletonCard variant="order" />
          <SkeletonCard variant="order" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#FFF5ED'}}>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{background: '#FFF5ED'}}>
        <div className="rounded-3xl shadow-elegant p-12 max-w-md w-full border-2 flex flex-col items-center" style={{background: '#FFFBF7', borderColor: '#E7E5E4'}}>
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-5xl mb-8 animate-bounce">
            🎉
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Thank You!
          </h1>
          <p className="text-neutral-500 mb-8 px-4">
            We hope you enjoyed your meal at <span className="font-bold" style={{color: '#8B4367'}}>Bistro Yahya</span>.
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
              className="w-full py-5 rounded-2xl text-lg font-bold shadow-soft-lg"
            >
              Start New Order
            </Button>
            
            <div className="pt-8 border-t border-neutral-200 w-full text-center">
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">New Customer?</p>
              <button 
                onClick={() => router.push(`/menu?table=${table}&new=true`)}
                className="text-sm font-bold"
                style={{color: '#8B4367'}}
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
    <div className="min-h-screen pb-24" style={{background: '#FFF5ED'}}>
      {/* Header */}
      <header className="shadow-soft-lg" style={{background: '#8B4367'}}>
        <div className="max-w-2xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/95 flex items-center justify-center shadow-soft">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Bistro Yahya
                </h1>
                <p className="text-primary-200 text-sm font-semibold">Table {table}</p>
              </div>
            </div>
            {order && <StatusBadge status={order.status} />}
          </div>
          
          {/* Order time */}
          <p className="text-primary-100 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Order tracking is live
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Order items */}
        <div className="rounded-3xl shadow-soft p-6 mb-6 border-2 border-neutral-200" style={{background: '#FFFBF7'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center rounded-2xl text-xl" style={{background: '#FFF0ED', color: '#8B4367'}}>
                ☕
              </span>
              Your Order
            </h2>
            <span className="bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-full text-xs font-bold">
              {activeItems.length} items
            </span>
          </div>

          {activeItems.length > 0 ? (
            <div className="space-y-4 mb-6">
              {activeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800 text-base">
                      {item.menu_items.name}
                    </p>
                    <p className="text-neutral-500 text-sm font-semibold mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-neutral-900 text-lg">
                    ₹{item.menu_items.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8 bg-neutral-50 rounded-2xl italic border-2 border-dashed border-neutral-200">
              All items have been cancelled
            </p>
          )}

          {/* Cancelled items */}
          {cancelledItems.length > 0 && (
            <div className="border-t-2 border-neutral-200 pt-6 mt-6">
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-4">Cancelled Items</p>
              {cancelledItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 opacity-50"
                >
                  <div className="flex-1">
                    <p className="font-bold text-neutral-600 line-through">
                      {item.menu_items.name}
                    </p>
                  </div>
                  <span className="text-red-600 text-xs font-bold bg-red-50 px-3 py-1 rounded-full">
                    Cancelled
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t-2 border-neutral-200 pt-6 mt-6">
            <div className="flex items-center justify-between p-5 rounded-2xl border-2" style={{background: '#FFF0ED', borderColor: '#E8D4DD'}}>
              <p className="text-neutral-700 font-bold uppercase tracking-wider text-sm">Total Amount</p>
              <p className="text-3xl font-bold" style={{color: '#8B4367'}}>₹{order.total}</p>
            </div>
          </div>
        </div>

        {/* Info message */}
        <div className="rounded-3xl p-6 text-center mb-6 shadow-soft border-2" style={{background: '#8B4367', borderColor: '#6F3554'}}>
          <p className="text-white text-sm font-semibold flex items-center justify-center gap-3">
            <span className="text-2xl">💡</span> 
            For assistance or faster billing, please call our staff
          </p>
        </div>

        {/* Add more button */}
        {order.status !== "CANCELLED" && (
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleAddMore} 
            className="w-full py-5 rounded-2xl shadow-soft font-bold text-lg border-2"
          >
            Add More Items
          </Button>
        )}
      </main>
    </div>
  );
}