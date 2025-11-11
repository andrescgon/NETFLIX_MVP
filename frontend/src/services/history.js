import api from './api';

export const historyService = {
  // Obtener historial reciente
  getRecentHistory: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.days) queryParams.append('days', params.days);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.perfil) queryParams.append('perfil', params.perfil);

    const queryString = queryParams.toString();
    const url = `/history/recent/${queryString ? '?' + queryString : ''}`;

    const response = await api.get(url);
    return response.data;
  },
};