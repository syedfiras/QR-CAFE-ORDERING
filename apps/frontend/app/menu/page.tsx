"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMenu, createOrder, getActiveOrder } from "../services/api";
import ItemCard from "../components/ItemCard";
import ItemModal from "../components/ItemModal";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
  menu_items: MenuItem[];
}

export default function MenuPage() {
  const params = useSearchParams();
  const router = useRouter();
  const table = params.get("table");

  const [menu, setMenu] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [placing, setPlacing] = useState(false);
  const [addingToExisting, setAddingToExisting] = useState(false);

  // Check for active order on mount
  useEffect(() => {
    if (!table) {
      router.push("/");
      return;
    }

    const checkActiveOrder = async () => {
      const activeOrder = await getActiveOrder(table);
      if (activeOrder && !params.get("add_more") && !params.get("new")) {
        // Redirect to order page if active order exists
        router.push(`/order?table=${table}`);
      } else if (params.get("add_more")) {
        setAddingToExisting(true);
      }
    };

    checkActiveOrder();
  }, [table, router, params]);

  // Fetch menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getMenu();
        setMenu(data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (table) {
      fetchMenu();
    }
  }, [table]);

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prev, { item, quantity }];
    });
  };

  const handlePlaceOrder = async () => {
    if (!table || cart.length === 0) return;

    setPlacing(true);
    try {
      const payload = {
        table_number: Number(table),
        items: cart.map((c) => ({
          menu_item_id: c.item.id,
          quantity: c.quantity,
        })),
      };

      await createOrder(payload);
      setCart([]);
      router.push(`/order?table=${table}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, c) => sum + c.item.price * c.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-400">
                Bistro Yahya
              </h1>
              <p className="text-neutral-500 text-sm">Table {table}</p>
            </div>
            {addingToExisting && (
              <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                Adding to existing order
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 pb-32">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} variant="menu" />
            ))}
          </div>
        ) : menu.length === 0 ? (
          <EmptyState
            title="No menu items available"
            description="Please check back later"
          />
        ) : (
          <div className="space-y-8">
            {menu.map((category) => (
              <div key={category.id}>
                <h2 className="font-display text-2xl font-bold text-neutral-800 mb-4">
                  {category.name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.menu_items
                    .filter((item) => item.is_available)
                    .map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-soft-lg p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-neutral-800">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
              <p className="text-primary-400 font-bold text-lg">₹{totalPrice}</p>
            </div>
            <Button
              size="lg"
              onClick={handlePlaceOrder}
              loading={placing}
              className="flex-shrink-0"
            >
              Place Order
            </Button>
          </div>
        </div>
      )}

      {/* Item modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
