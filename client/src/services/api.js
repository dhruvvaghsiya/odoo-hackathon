import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('globetrotter_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — unwrap data, handle auth errors
api.interceptors.response.use(
  (response) => {
    // Backend wraps in { success, message, data, error }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle 401 — token expired or invalid
    if (status === 401) {
      localStorage.removeItem('globetrotter_token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }

    // Construct a clean error object
    const apiError = {
      status,
      message: data?.message || error.message || 'Something went wrong',
      errors: data?.error || null,
    };

    return Promise.reject(apiError);
  }
);

export default api;
