import apiClient from './client';

export const contactApi = {
  submitEnquiry: (data) => apiClient.post('/contact', data),
};
