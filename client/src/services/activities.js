import api from './api';

export const activitiesService = {
  list: (params = {}) =>
    api.get('/activities', { params }),

  search: (q, params = {}) =>
    api.get('/activities/search', { params: { q, ...params } }),

  popular: (params = {}) =>
    api.get('/activities/popular', { params }),

  getById: (id) =>
    api.get(`/activities/${id}`),
};
