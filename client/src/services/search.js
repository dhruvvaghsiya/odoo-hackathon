import api from './api';

export const searchService = {
  search: (q, params = {}) =>
    api.get('/search', { params: { q, ...params } }),
};
