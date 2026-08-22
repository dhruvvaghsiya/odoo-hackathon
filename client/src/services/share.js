import api from './api';

export const shareService = {
  create: (tripId) =>
    api.post(`/trips/${tripId}/share`),

  get: (tripId) =>
    api.get(`/trips/${tripId}/share`),

  update: (tripId, data) =>
    api.patch(`/trips/${tripId}/share`, data),

  delete: (tripId) =>
    api.delete(`/trips/${tripId}/share`),

  // Public endpoints (no auth required for getPublic)
  getPublic: (token) =>
    api.get(`/public/trips/${token}`),

  copyTrip: (token) =>
    api.post(`/public/trips/${token}/copy`),
};
