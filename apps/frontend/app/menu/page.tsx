"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMenu, createOrder } from "../services/api";
import { getCart, saveCart, clearCart } from "../services/cart";

export default function MenuPage() {
  const params = useSearchParams();
  const router = useRouter();
  const table = params.get("table");

  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    getMenu().then(setMenu);
    setCart(getCart());
  }, []);

  const addToCart = (item: any) => {
    const updated = [...cart, { ...item, quantity: 1 }];
    setCart(updated);
    saveCart(updated);
  };

  const placeOrder = async () => {
  const payload = {
    table_number: Number(table),
    items: cart.map((i) => ({
      menu_item_id: i.id,
      quantity: i.quantity,
    })),
  };

    const res = await createOrder(payload);
    clearCart();
    router.push(`/order?table=${table}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Menu</h1>

      {menu.map((cat) => (
        <div key={cat.id}>
          <h2 className="mt-4 font-semibold">{cat.name}</h2>
          {cat.menu_items.map((item: any) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <button onClick={() => addToCart(item)}>Add</button>
            </div>
          ))}
        </div>
      ))}

      {cart.length > 0 && (
        <button className="mt-4 bg-black text-white p-2" onClick={placeOrder}>
          Place Order
        </button>
      )}
    </div>
  );
}
