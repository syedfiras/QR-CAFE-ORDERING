const CART_KEY = "cafe_cart";

export const getCart = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(sessionStorage.getItem(CART_KEY) || "[]");
};

export const saveCart = (cart: any[]) => {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearCart = () => {
  sessionStorage.removeItem(CART_KEY);
};
