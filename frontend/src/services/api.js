import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enviar cookies con cada request
});

// Interceptor para agregar el token a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar refresh token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log('API Error:', error.response?.status, error.config?.url);

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('Intentando refrescar token...');

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          console.error('No hay refresh token disponible');
          throw new Error('No refresh token');
        }

        // Intentar refrescar el token
        const response = await axios.post('/api/users/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        console.log('Token refrescado exitosamente');
        localStorage.setItem('access_token', access);

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir al login
        console.error('Fallo al refrescar token:', refreshError);
        console.error('Limpiando tokens y redirigiendo al login...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
