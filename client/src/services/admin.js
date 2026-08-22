import api from './api';

export const adminService = {
  getAnalytics: () =>
    api.get('/admin/analytics'),

  listUsers: (params = {}) =>
    api.get('/admin/users', { params }),

  listTrips: (params = {}) =>
    api.get('/admin/trips', { params }),
};
