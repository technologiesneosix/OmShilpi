import apiClient from './client';

export const adminApi = {
  // Dashboard Summary
  getDashboardSummary: () => apiClient.get('/admin/dashboard'),

  // Products Management
  getProducts: (params = {}) => apiClient.get('/admin/products', { params }),
  getProductById: (id) => apiClient.get(`/admin/products/${id}`),
  createProduct: (data) => apiClient.post('/admin/products', data),
  updateProduct: (id, data) => apiClient.patch(`/admin/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),

  // Categories Management
  getCategories: (params = {}) => apiClient.get('/admin/categories', { params }),
  getCategoryById: (id) => apiClient.get(`/admin/categories/${id}`),
  createCategory: (data) => apiClient.post('/admin/categories', data),
  updateCategory: (id, data) => apiClient.patch(`/admin/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),

  // Collections Management
  getCollections: (params = {}) => apiClient.get('/admin/collections', { params }),
  getCollectionById: (id) => apiClient.get(`/admin/collections/${id}`),
  createCollection: (data) => apiClient.post('/admin/collections', data),
  updateCollection: (id, data) => apiClient.patch(`/admin/collections/${id}`, data),
  deleteCollection: (id) => apiClient.delete(`/admin/collections/${id}`),

  // Inventory Management
  getInventory: (params = {}) => apiClient.get('/admin/inventory', { params }),
  getLowStockInventory: () => apiClient.get('/admin/inventory/low-stock'),
  getOutOfStockInventory: () => apiClient.get('/admin/inventory/out-of-stock'),
  getInventoryByProductId: (productId) => apiClient.get(`/admin/inventory/${productId}`),
  adjustStock: (productId, change, reason = 'Manual Admin Stock Adjustment') =>
    apiClient.patch(`/admin/inventory/${productId}/adjust`, { change, reason }),
  setStock: (productId, quantity) =>
    apiClient.patch(`/admin/inventory/${productId}/stock`, { quantity }),
  getInventoryHistory: (productId) =>
    apiClient.get(`/admin/inventory/${productId}/history`),

  // Orders Management
  getOrders: (params = {}) => apiClient.get('/admin/orders', { params }),
  getOrderById: (id) => apiClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status, notes = '') =>
    apiClient.patch(`/admin/orders/${id}/status`, { status, notes }),

  // Contact Enquiries & Messages
  getEnquiries: (params = {}) => apiClient.get('/admin/enquiries', { params }),
  getEnquiryById: (id) => apiClient.get(`/admin/enquiries/${id}`),
  updateEnquiryStatus: (id, status) =>
    apiClient.patch(`/admin/enquiries/${id}/status`, { status }),

  // Banners CMS
  getBanners: (params = {}) => apiClient.get('/admin/banners', { params }),
  getBannerById: (id) => apiClient.get(`/admin/banners/${id}`),
  createBanner: (data) => apiClient.post('/admin/banners', data),
  updateBanner: (id, data) => apiClient.patch(`/admin/banners/${id}`, data),
  deleteBanner: (id) => apiClient.delete(`/admin/banners/${id}`),

  // Testimonials CMS
  getTestimonials: (params = {}) => apiClient.get('/admin/testimonials', { params }),
  getTestimonialById: (id) => apiClient.get(`/admin/testimonials/${id}`),
  createTestimonial: (data) => apiClient.post('/admin/testimonials', data),
  updateTestimonial: (id, data) => apiClient.patch(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id) => apiClient.delete(`/admin/testimonials/${id}`),

  // Homepage & Website Content CMS
  getHomepageContent: () => apiClient.get('/content/home'),
  updateHomepageContent: (data) => apiClient.patch('/admin/content/home', data),
  getBranding: () => apiClient.get('/content/branding'),
  updateBranding: (data) => apiClient.patch('/admin/content/branding', data),
  getStoreInfo: () => apiClient.get('/content/store-info'),
  updateStoreInfo: (data) => apiClient.patch('/admin/content/store-info', data),

  // Product Media Management
  uploadProductImage: (productId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProductImages: (productId) => apiClient.get(`/admin/products/${productId}/images`),
  setPrimaryProductImage: (productId, imageId) =>
    apiClient.patch(`/admin/products/${productId}/images/${imageId}/primary`),
  deleteProductImage: (productId, imageId) =>
    apiClient.delete(`/admin/products/${productId}/images/${imageId}`),
};
