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

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, c) => sum + c.item.price * c.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                🌸
              </div>
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-pink-300 leading-none">
                  Bistro Yahya
                </h1>
                <p className="text-pink-500 text-xs font-medium tracking-wide mt-0.5">TABLE {table}</p>
              </div>
            </div>
            {addingToExisting && (
              <div className="bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-primary-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                Adding to Order
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search and Categories Sticky Header */}
      {!loading && menu.length > 0 && (
        <div className="sticky top-[73px] z-30 bg-[#FAFAFA]/95 backdrop-blur-sm pb-4 pt-2 px-4 sm:px-6 border-b border-neutral-100/50 transition-all duration-200">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Search and Filter Row */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl leading-5 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 sm:text-sm transition-all shadow-sm"
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="flex items-center justify-center px-4 py-2.5 border border-neutral-200 rounded-xl bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>

            {/* Categories Row */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === 'all'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                    }`}
                >
                  All
                </button>
                {menu.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === category.id
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 pb-40">

        {/* Welcome Section - Only show when not searching */}
        {!loading && menu.length > 0 && !searchQuery && activeCategory === 'all' && (
          <div className="mb-8 mt-2">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-pink-300 mb-2">
              Menu
            </h2>
            <p className="text-pink-500 text-lg">Delicious food, made with love.</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} variant="menu" />
            ))}
          </div>
        ) : menu.length === 0 ? (
          <EmptyState
            title="No menu items available"
            description="Please check back later or call a waiter."
          />
        ) : (
          <div className="space-y-12">
            {menu
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
              )
              .map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="font-display text-2xl font-bold text-pink-500 flex-shrink-0">
                      {category.name}
                    </h3>
                    <div className="h-px bg-neutral-200 w-full rounded-full" />
                  </div>

                  <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {category.menu_items.map((item) => (
                      <div key={item.id} className="flex-shrink-0 w-[280px]">
                        <ItemCard
                          item={item}
                          onClick={() => setSelectedItem(item)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {/* Empty state for search results */}
            {menu
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
              ).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No items found matching your search.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="mt-2 text-pink-500 font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
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
