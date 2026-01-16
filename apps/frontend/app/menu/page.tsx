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

  const [showCafeName, setShowCafeName] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Header - Redesigned */}
      <header className="bg-neutral-900 sticky top-0 z-40 border-b border-neutral-800 shadow-xl text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger menu icon */}
            <div className="w-10 h-10 flex items-center justify-center">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 transition"
                onClick={() => setShowCafeName((prev) => !prev)}
                aria-label="Open menu"
              >
                {/* Hamburger SVG */}
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>
              {/* Dropdown/modal for cafe name */}
              {showCafeName && (
                <div className="absolute left-4 top-16 bg-white text-neutral-900 rounded-xl shadow-lg px-6 py-3 z-50 border border-neutral-200 min-w-45 animate-fade-in">
                  <span className="font-bold text-lg">Bistro Yahya</span>
                </div>
              )}
            </div>
            {/* Title and table number */}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white leading-none tracking-tight">Menu</h1>
              <p className="text-neutral-400 text-xs font-medium tracking-wide mt-0.5 uppercase">Table {table}</p>
            </div>
          </div>
          {/* Back to order button if addingToExisting */}
          {addingToExisting && (
            <button
              className="bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-primary-200 flex items-center gap-2 hover:bg-primary-100 transition"
              onClick={() => router.push(`/order?table=${table}`)}
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Back to Order
            </button>
          )}
        </div>
      </header>

      {/* Search and Categories Sticky Header */}
      {!loading && menu.length > 0 && (
        <div className="sticky top-18.25 z-30 bg-neutral-50/95 backdrop-blur-md pb-4 pt-3 px-4 sm:px-6 border-b border-neutral-200/50 transition-all duration-200">
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
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-xl leading-5 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all shadow-sm text-neutral-900"
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories Row - Clean Tabs */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                >
                  All
                </button>
                {menu.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === category.id
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
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
                    <h3 className="text-xl font-bold text-neutral-900 shrink-0 tracking-tight">
                      {category.name}
                    </h3>
                    <div className="h-px bg-neutral-200 w-full rounded-full" />
                  </div>

                  <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {category.menu_items.map((item) => (
                      <div key={item.id} className="shrink-0 w-70">
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
              className="shrink-0"
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
