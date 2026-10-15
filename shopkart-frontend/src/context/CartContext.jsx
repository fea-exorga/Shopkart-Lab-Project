import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const location = useLocation();

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/cart");
      setCartItems(response.data.cart || []);
      return response.data.cart || [];
    } catch (requestError) {
      console.error(requestError);
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.message ||
          "Unable to load your cart."
        );
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.pathname !== "/login" && location.pathname !== "/register") {
      refreshCart();
    }
  }, [location.pathname, refreshCart]);

  const runCartAction = async (productId, action) => {
    if (actionLoading[productId]) return false;

    setActionLoading((current) => ({ ...current, [productId]: true }));
    setError("");

    try {
      const response = await action();
      setCartItems(response.data.cart || []);
      return true;
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError.response?.data?.message ||
        "Unable to update your cart. Please try again."
      );
      return false;
    } finally {
      setActionLoading((current) => {
        const next = { ...current };
        delete next[productId];
        return next;
      });
    }
  };

  const addToCart = (productId) =>
    runCartAction(productId, () => api.post(`/cart/${productId}`));

  const updateQuantity = (productId, quantity) =>
    runCartAction(productId, () =>
      api.patch(`/cart/${productId}`, { quantity })
    );

  const removeFromCart = (productId) =>
    runCartAction(productId, () => api.delete(`/cart/${productId}`));

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.product?.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      loading,
      error,
      actionLoading,
      cartCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart,
      clearError: () => setError("")
    }),
    [cartItems, loading, error, actionLoading, cartCount, subtotal, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
