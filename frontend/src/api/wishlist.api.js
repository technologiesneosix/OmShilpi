import apiClient from './client';

export const wishlistApi = {
  getWishlist: () => apiClient.get('/wishlist'),
  getWishlistCount: () => apiClient.get('/wishlist/count'),
  addItem: (productId) => apiClient.post('/wishlist/items', { productId }),
  removeItem: (itemId) => apiClient.delete(`/wishlist/items/${itemId}`),
};
