import apiClient from './client';

export const collectionsApi = {
  getCollections: () => apiClient.get('/collections'),
  getCollectionBySlug: (slug) => apiClient.get(`/collections/${slug}`),
};
