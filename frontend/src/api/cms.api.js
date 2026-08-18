import apiClient from './client';

export const cmsApi = {
  getBanners: () => apiClient.get('/banners'),
  getTestimonials: () => apiClient.get('/testimonials'),
  getHomepageContent: () => apiClient.get('/content/home'),
};
