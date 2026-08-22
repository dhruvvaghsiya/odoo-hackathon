import api from './api';

export const citiesService = {
  list: (params = {}) =>
    api.get('/cities', { params }),

  search: (q, params = {}) =>
    api.get('/cities/search', { params: { q, ...params } }),

  popular: (params = {}) =>
    api.get('/cities/popular', { params }),

  getById: (id) =>
    api.get(`/cities/${id}`),

  getActivities: (cityId, params = {}) =>
    api.get(`/cities/${cityId}/activities`, { params }),
};
