import api from './api';

export const budgetService = {
  getSummary: (tripId) =>
    api.get(`/trips/${tripId}/budget`),

  getAnalysis: (tripId) =>
    api.get(`/trips/${tripId}/budget/analysis`),
};
