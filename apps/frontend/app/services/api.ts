const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // If we're on a website, try to use the same host but port 5000 if local, 
    // or just use a relative path if the backend is proxied/hosted alongside.
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
  }
  return "/api"; // Default to relative path for production/hosted environments
};

const BASE_URL = getBaseUrl();

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
    id: string;
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
  session_status?: "ACTIVE" | "COMPLETED" | "EXPIRED";
}

export interface Metrics {
  ordersToday: number;
  revenueToday: number;
  paidOrders: number;
  unpaidOrders: number;
  completedToday: number;
  cancelledToday: number;
}

// Session types
export type SessionStatus = "ACTIVE" | "COMPLETED" | "EXPIRED";

export interface SessionResponse {
  session_token: string;
  session_id: string;
  status: SessionStatus;
  table_number: number;
  created_at: string;
  is_valid: boolean;
}

export interface SessionValidation {
  is_valid: boolean;
  status: SessionStatus | null;
  session_id?: string;
  session_token?: string;
  table_number?: number;
  error?: string;
}

// Session APIs
export const startSession = async (tableNumber: number, existingToken?: string): Promise<SessionResponse> => {
  const res = await fetch(`${BASE_URL}/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      table_number: tableNumber,
      session_token: existingToken 
    }),
  });
  return res.json();
};

export const validateSession = async (token: string): Promise<SessionValidation> => {
  const res = await fetch(`${BASE_URL}/sessions/validate/${token}`);
  return res.json();
};

// Menu APIs
export const getMenu = async () => {
  const res = await fetch(`${BASE_URL}/menu`);
  if (!res.ok) {
    throw new Error(`Failed to fetch menu: ${res.statusText}`);
  }
  return res.json();
};

// Order APIs - Updated to support session tokens
export const createOrder = async (payload: {
  table_number: number;
  items: { menu_item_id: string; quantity: number }[];
  session_token?: string;
}) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const getActiveOrder = async (tableId: string, sessionToken?: string): Promise<Order | null> => {
  const url = sessionToken 
    ? `${BASE_URL}/orders/active/${tableId}?session_token=${sessionToken}`
    : `${BASE_URL}/orders/active/${tableId}`;
  const res = await fetch(url);
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
export const cancelOrderItem = async (itemId: string, quantity?: number) => {
  const res = await fetch(`${BASE_URL}/orders/items/${itemId}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
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

export const getOrderHistory = async (date: string) => {
  const res = await fetch(`${BASE_URL}/orders/history?date=${date}`);
  return res.json();
};

export const createMenuItem = async (payload: FormData) => {
  const res = await fetch(`${BASE_URL}/menu/items`, {
    method: "POST",
    body: payload,
  });
  if (!res.ok) {
    throw new Error(`Failed to create item: ${res.statusText}`);
  }
  return res.json();
};

export const updateMenuItem = async (id: string, payload: FormData) => {
  const res = await fetch(`${BASE_URL}/menu/items/${id}`, {
    method: "PUT",
    body: payload,
  });
  if (!res.ok) {
    throw new Error(`Failed to update item: ${res.statusText}`);
  }
  return res.json();
};

export const deleteMenuItem = async (id: string) => {
  const res = await fetch(`${BASE_URL}/menu/items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete item: ${res.statusText}`);
  }
  return res.json();
};

