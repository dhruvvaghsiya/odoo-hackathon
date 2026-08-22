import api from './api';

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  signup: (payloadOrName, email, password) => {
    const payload =
      typeof payloadOrName === 'object' && payloadOrName !== null
        ? payloadOrName
        : { name: payloadOrName, email, password };
    return api.post('/auth/signup', payload);
  },

  getMe: () =>
    api.get('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),
};

