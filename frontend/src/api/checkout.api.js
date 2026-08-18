import apiClient from './client';

export const checkoutApi = {
  getPreview: (data = {}) => apiClient.post('/checkout/preview', data),
  executeCheckout: (data) => apiClient.post('/checkout', data),
};
