import api from './api';

export const tripsService = {
  // ── Trips CRUD ──
  create: (data) =>
    api.post('/trips', data),

  list: (params = {}) =>
    api.get('/trips', { params }),

  getById: (id) =>
    api.get(`/trips/${id}`),

  update: (id, data) =>
    api.patch(`/trips/${id}`, data),

  delete: (id) =>
    api.delete(`/trips/${id}`),

  // ── Stops ──
  addStop: (tripId, data) =>
    api.post(`/trips/${tripId}/stops`, data),

  listStops: (tripId) =>
    api.get(`/trips/${tripId}/stops`),

  updateStop: (tripId, stopId, data) =>
    api.patch(`/trips/${tripId}/stops/${stopId}`, data),

  deleteStop: (tripId, stopId) =>
    api.delete(`/trips/${tripId}/stops/${stopId}`),

  reorderStops: (tripId, orderedStopIds) =>
    api.patch(`/trips/${tripId}/stops/reorder`, { ordered_stop_ids: orderedStopIds }),

  // ── Trip Activities ──
  addActivity: (tripId, stopId, data) =>
    api.post(`/trips/${tripId}/stops/${stopId}/activities`, data),

  listActivities: (tripId, stopId) =>
    api.get(`/trips/${tripId}/stops/${stopId}/activities`),

  updateActivity: (tripId, stopId, activityId, data) =>
    api.patch(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`, data),

  deleteActivity: (tripId, stopId, activityId) =>
    api.delete(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`),

  reorderActivities: (tripId, orderedActivityIds) =>
    api.patch(`/trips/${tripId}/activities/reorder`, { ordered_activity_ids: orderedActivityIds }),

  // ── Itinerary ──
  getItinerary: (tripId) =>
    api.get(`/trips/${tripId}/itinerary`),

  // ── Timeline ──
  getTimeline: (tripId) =>
    api.get(`/trips/${tripId}/timeline`),
};
