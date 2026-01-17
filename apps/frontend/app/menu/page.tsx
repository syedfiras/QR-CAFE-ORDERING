"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

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
        setMenu([]); // Set to empty array on error
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

  const handleIncrement = (itemId: string) => {
    setCart((prev) =>
      prev.map((c) =>
        c.item.id === itemId ? { ...c, quantity: c.quantity + 1 } : c
      )
    );
  };

  const handleDecrement = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const handleRemove = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, c) => sum + c.item.price * c.quantity,
    0
  );

  const filteredMenu = menu
    .map((category) => ({
      ...category,
      menu_items: category.menu_items.filter(
        (item) =>
          item.is_available &&
          (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter(
      (category) =>
        category.menu_items.length > 0 &&
        (activeCategory === "all" || category.id === activeCategory)
    );

  const [showCafeName, setShowCafeName] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Elegant Header */}
      <header className="sticky top-0 z-40 shadow-soft-xl bg-primary-700">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Table Info */}
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
                <h1 className="text-xl font-bold text-white tracking-tight">Bistro Yahya</h1>
                <p className="text-primary-200 text-xs font-semibold tracking-wide uppercase">Table {table}</p>
              </div>
            </div>

            {/* Active Order Badge */}
            {addingToExisting && (
              <button
                className="flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-full text-sm font-bold shadow-soft active:scale-95 transition-transform"
                onClick={() => router.push(`/order?table=${table}`)}
              >
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                Active Order
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Search & Filter Section */}
      {!loading && menu.length > 0 && (
        <div className="sticky top-[73px] z-30 bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-5 py-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-neutral-200 rounded-2xl bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                placeholder="Search delicious food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Pills */}
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-5 px-5 [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${activeCategory === 'all'
                  ? 'text-white shadow-soft-lg bg-primary-700'
                  : 'bg-white text-neutral-600 border-2 border-neutral-200 active:bg-neutral-50'
                  }`}
              >
                All Items
              </button>
              {menu.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${activeCategory === category.id
                    ? 'text-white shadow-soft-lg bg-primary-700'
                    : 'bg-white text-neutral-600 border-2 border-neutral-200 active:bg-neutral-50'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-5 py-8 pb-40">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} variant="menu" />
            ))}
          </div>
        ) : menu.length === 0 ? (
          <EmptyState
            title="No menu items available"
            description="Please check back later or call our staff."
          />
        ) : (
          <div className="space-y-10">
            {filteredMenu.map((category) => (
              <div key={category.id} className="animate-fade-in">
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
                    <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary-200 to-transparent" />
                </div>

                {/* Horizontal Scroll Grid */}
                <div className="flex overflow-x-auto gap-5 pb-4 -mx-5 px-5 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                  {category.menu_items.map((item) => (
                    <div key={item.id} className="shrink-0 w-72 snap-center">
                      <ItemCard
                        item={item}
                        onClick={() => setSelectedItem(item)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Empty Search State */}
            {filteredMenu.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-neutral-600 font-medium mb-2">No items found</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up">
          <div
            className="max-w-7xl mx-auto rounded-3xl shadow-elegant p-5 border-2 bg-primary-700 border-primary-800"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 text-white">
                <p className="font-bold text-lg">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} added
                </p>
                {/* <p className="text-sm text-primary-100/90">
            Tap to review or edit your order
          </p> */}
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen((open) => !open)}
                className="w-9 h-9 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center text-white shadow-soft active:scale-95 transition-transform"
              >
                <svg
                  className={`w-4 h-4 transform transition-transform ${isCartOpen ? "rotate-180" : ""
                    }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12L10 7L15 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {isCartOpen && (
              <div className="mt-4 max-h-60 overflow-y-auto pr-1 space-y-3">
                {cart.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-black/10 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {cartItem.item.name}
                      </p>
                      <p className="text-xs text-primary-100 mt-0.5">
                        ₹{cartItem.item.price} × {cartItem.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecrement(cartItem.item.id)}
                        className="w-8 h-8 rounded-xl bg-white text-primary-600 flex items-center justify-center text-lg font-bold shadow-soft active:scale-95 transition-transform"
                      >
                        -
                      </button>
                      <span className="min-w-[2ch] text-center text-sm font-bold text-white">
                        {cartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(cartItem.item.id)}
                        className="w-8 h-8 rounded-xl bg-white text-primary-600 flex items-center justify-center text-lg font-bold shadow-soft active:scale-95 transition-transform"
                      >
                        +
                      </button>
                      {/* <button
                  type="button"
                  onClick={() => handleRemove(cartItem.item.id)}
                  className="ml-1 text-xs font-semibold text-primary-100/80 underline underline-offset-4"
                >
                  Remove
                </button> */}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-100/90">
                  Total
                </p>
                <p className="text-2xl font-bold">₹{totalPrice}</p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placing}
                className="px-6 py-3 rounded-2xl font-bold text-lg shadow-soft-xl active:scale-95 transition-transform disabled:opacity-50 bg-amber-300 text-neutral-900 border-0"
              >
                {placing ? "Placing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
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
