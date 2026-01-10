const BASE_URL = "http://localhost:5000/api";

// TypeScript Interfaces
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  is_available: boolean;
}

export interface OrderItem {
  id: string;
  quantity: number;
  is_cancelled: boolean;
  menu_items: {
    name: string;
    price: number;
  };
}

export interface Order {
  id: string;
  status: "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";
  items: OrderItem[];
  total: number;
  created_at?: string;
}

export interface Metrics {
  ordersToday: number;
  revenueToday: number;
  paidOrders: number;
  unpaidOrders: number;
  completedToday: number;
  cancelledToday: number;
}

// Menu APIs
export const getMenu = async () => {
  const res = await fetch(`${BASE_URL}/menu`);
  return res.json();
};

// Order APIs
export const createOrder = async (payload: {
  table_number: number;
  items: { menu_item_id: string; quantity: number }[];
}) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const getActiveOrder = async (tableId: string) => {
  const res = await fetch(`${BASE_URL}/orders/active/${tableId}`);
  return res.json();
};

export const getAllActiveOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders/active`);
  return res.json();
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// Admin Order Management APIs
export const cancelOrderItem = async (itemId: string) => {
  const res = await fetch(`${BASE_URL}/orders/items/${itemId}/cancel`, {
    method: "PATCH",
  });
  return res.json();
};

export const cancelOrder = async (orderId: string) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
  return res.json();
};

export const markAsPaid = async (orderId: string) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/pay`, {
    method: "POST",
  });
  return res.json();
};

// Metrics API
export const getMetrics = async (): Promise<Metrics> => {
  const res = await fetch(`${BASE_URL}/orders/metrics`);
  return res.json();
};
