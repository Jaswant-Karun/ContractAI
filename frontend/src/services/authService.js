import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('contractiq_token', response.data.data.token);
      localStorage.setItem('contractiq_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('contractiq_token', response.data.data.token);
      localStorage.setItem('contractiq_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('contractiq_token');
      localStorage.removeItem('contractiq_user');
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }
};
