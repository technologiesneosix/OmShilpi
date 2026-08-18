import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart.api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      const cartData = res.data || res;
      
      const items = cartData.items || [];
      const totalAmount = items.reduce((sum, item) => {
        const price = Number(item.product?.price || item.price || 0);
        return sum + price * item.quantity;
      }, 0);
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

      setCart({
        id: cartData.id,
        items,
        totalAmount,
        totalItems,
      });
    } catch (err) {
      console.warn('Could not fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to add items to your cart.');
    }
    const targetId = typeof productId === 'object' ? (productId?.id || productId?.productId) : productId;
    if (!targetId || typeof targetId !== 'string') {
      throw new Error('Invalid product ID');
    }
    try {
      setLoading(true);
      await cartApi.addItem(targetId, Number(quantity));
      await fetchCart();
      setIsCartOpen(true);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      await cartApi.updateQuantity(itemId, quantity);
      await fetchCart();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      await cartApi.removeItem(itemId);
      await fetchCart();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      await cartApi.clearCart();
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        setIsCartOpen,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
