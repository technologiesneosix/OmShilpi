import apiClient from './client';

export const ordersApi = {
  createOrder: (data) => apiClient.post('/orders', data),
  getOrders: () => apiClient.get('/orders'),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  cancelOrder: (id, reason) => apiClient.patch(`/orders/${id}/cancel`, { reason }),
};
