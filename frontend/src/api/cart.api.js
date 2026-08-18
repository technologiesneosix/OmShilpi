import apiClient from './client';

export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  getCartCount: () => apiClient.get('/cart/count'),
  addItem: (productId, quantity = 1) => apiClient.post('/cart/items', { productId, quantity }),
  updateQuantity: (itemId, quantity) => apiClient.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => apiClient.delete(`/cart/items/${itemId}`),
  clearCart: () => apiClient.delete('/cart'),
};
