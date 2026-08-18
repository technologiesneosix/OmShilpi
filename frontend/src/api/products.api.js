import apiClient from './client';

export const productsApi = {
  getProducts: (params = {}) => apiClient.get('/products', { params }),
  getProductBySlug: (slug) => apiClient.get(`/products/${slug}`),
};
