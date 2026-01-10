const BASE_URL = "http://localhost:5000/api";

export const getMenu = async () => {
  const res = await fetch(`${BASE_URL}/menu`);
  return res.json();
};

export const createOrder = async (payload: any) => {
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

export const updateOrderStatus = async (
  orderId: string,
  status: string
) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};
