import api from './api';

export const notificationsService = {
  list: (params = {}) =>
    api.get('/notifications', { params }),

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),
};
