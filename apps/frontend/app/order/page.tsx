"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getActiveOrder } from "../services/api";

export default function OrderPage() {
  const params = useSearchParams();
  const table = params.get("table");

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (table) {
      getActiveOrder(table).then(setOrder);
    }
  }, [table]);

  if (!order) return <p>No active order</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Order Status</h1>
      <p>Status: {order.status}</p>
    </div>
  );
}
