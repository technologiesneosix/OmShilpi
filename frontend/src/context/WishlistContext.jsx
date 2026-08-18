import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/wishlist.api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [], count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist({ items: [], count: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      const wishlistData = res.data || res;
      const items = wishlistData.items || [];
      setWishlist({
        id: wishlistData.id,
        items,
        count: items.length,
      });
    } catch (err) {
      console.warn('Could not fetch wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to save items to your wishlist.');
    }
    try {
      setLoading(true);
      await wishlistApi.addItem(productId);
      await fetchWishlist();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      await wishlistApi.removeItem(itemId);
      await fetchWishlist();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.items.some(item => item.productId === productId || item.product?.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to save items to your wishlist.');
    }
    const productId = typeof product === 'string' ? product : product.id;
    const existingItem = wishlist.items.find(
      item => item.productId === productId || item.product?.id === productId
    );

    if (existingItem) {
      await removeFromWishlist(existingItem.id);
      return false;
    } else {
      await addToWishlist(productId);
      return true;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
