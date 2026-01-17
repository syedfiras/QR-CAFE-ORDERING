"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getActiveOrder } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

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
  const [showQrModal, setShowQrModal] = useState(false);

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
      <div className="min-h-screen p-6 bg-primary-50">
        <div className="max-w-2xl mx-auto space-y-4">
          <SkeletonCard variant="order" />
          <SkeletonCard variant="order" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-primary-50">
        <div className="rounded-3xl shadow-elegant p-12 max-w-md w-full border-2 flex flex-col items-center bg-white border-primary-100">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-5xl mb-8 animate-bounce">
            🎉
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Thank You!
          </h1>
          <p className="text-neutral-500 mb-8 px-4">
            We hope you enjoyed your meal at <span className="font-bold text-primary-700">Bistro Yahya</span>.
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
                className="text-sm font-bold text-primary-700"
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
    <>
      <div className="min-h-screen pb-24 bg-primary-50">
        {/* Header */}
        <header className="shadow-soft-lg bg-primary-700">
          <div className="max-w-2xl mx-auto px-5 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-2xl bg-white/95 flex items-center justify-center shadow-soft overflow-hidden">
                  <Image
                    src="/images/Bistro Yahya.png"
                    alt="Logo"
                    fill
                    className="object-contain p-1"
                  />
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
          <div className="rounded-3xl shadow-soft p-6 mb-6 border-2 border-primary-100 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center rounded-2xl text-xl bg-primary-50 text-primary-700">
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
              <div className="flex items-center justify-between p-5 rounded-2xl border-2 bg-primary-50 border-primary-200">
                <p className="text-neutral-700 font-bold uppercase tracking-wider text-sm">Total Amount</p>
                <p className="text-3xl font-bold text-primary-700">₹{order.total}</p>
              </div>
            </div>
          </div>


          <p className="text-neutral-500 text-xs text-center mb-6 flex items-center justify-center gap-2">
            <span className="text-base">💡</span>
            <span>For assistance or faster billing, please call our staff.</span>
          </p>

          {order.status !== "CANCELLED" && (
            <Button
              size="lg"
              variant="secondary"
              onClick={handleAddMore}
              className="w-full py-5 rounded-2xl shadow-soft-lg font-bold text-lg border-2 border-primary-200 bg-gradient-to-r from-white via-primary-50 to-primary-100 text-primary-700 mb-6 flex items-center justify-center gap-2"
            >
              <span>➕ Add More Items</span>
            </Button>
          )}

          <div
            className="rounded-3xl shadow-soft p-6 mb-4 border-2 border-neutral-200 bg-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-2xl bg-primary-50 flex items-center justify-center text-xl">
                  💳
                </span>
                Payment options
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                Secure & Easy
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/60">

                <Button
                  onClick={() => setShowQrModal(true)}
                  className="w-full sm:w-auto px-8 py-3 bg-primary-700 hover:bg-primary-800 shadow-soft-lg"
                >
                  Pay Now
                </Button>
                {/* <p className="text-[11px] text-primary-700/90 font-medium uppercase tracking-wide text-center">
                Show this screen at your table and scan to pay
              </p> */}
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center">
                  <span className="text-lg">🏷️</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-800">
                    Prefer to pay at the counter?
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    You can pay at the billing counter in cash or card. Just share
                    your table number: <span className="font-semibold">Table {table}</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showQrModal && (
        <Modal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          title="Scan to Pay"
          maxWidth="max-w-md"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-64 rounded-3xl bg-white border border-primary-200 overflow-hidden flex items-center justify-center">
              <Image
                src="/images/payment-qr.jpg"
                alt="Scan to pay"
                fill
                className="object-contain"
              />
            </div>
            <a
              href="/images/payment-qr.jpg"
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900 text-white text-sm font-semibold shadow-soft active:scale-95 transition-transform"
            >
              <span>Download QR</span>
              <span>⬇️</span>
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}
