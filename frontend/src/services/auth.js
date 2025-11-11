import api from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/users/login/', { email, password });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Obtener datos del usuario después del login
    try {
      const userData = await authService.getCurrentUser();
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }

    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/users/register/', userData);
    return response.data;
  },

  // Get current user data
  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Get current tokens
  getTokens: () => {
    return {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    };
  },

  // Get user data from localStorage
  getUserData: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};