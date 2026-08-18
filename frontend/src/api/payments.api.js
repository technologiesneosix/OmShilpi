import apiClient from './client';

export const paymentsApi = {
  createRazorpayOrder: (orderId) => apiClient.post('/payments/create-order', { orderId }),
  verifyPayment: (paymentData) => apiClient.post('/payments/verify', paymentData),
};
