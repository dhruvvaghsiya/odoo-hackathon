import api from './api';

export const expensesService = {
  create: (tripId, data) =>
    api.post(`/trips/${tripId}/expenses`, data),

  list: (tripId, params = {}) =>
    api.get(`/trips/${tripId}/expenses`, { params }),

  update: (tripId, expenseId, data) =>
    api.patch(`/trips/${tripId}/expenses/${expenseId}`, data),

  delete: (tripId, expenseId) =>
    api.delete(`/trips/${tripId}/expenses/${expenseId}`),
};
