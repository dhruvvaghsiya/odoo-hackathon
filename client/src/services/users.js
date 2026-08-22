import api from './api';

export const usersService = {
  getProfile: () =>
    api.get('/users/me'),

  updateProfile: (data) =>
    api.patch('/users/me', data),

  deleteAccount: () =>
    api.delete('/users/me'),
};
