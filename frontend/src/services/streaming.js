import api from './api';

export const streamingService = {
  // Obtener URL de reproducción para una película
  getPlayUrl: async (movieId, params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.perfil) queryParams.append('perfil', params.perfil);
    if (params.calidad) queryParams.append('calidad', params.calidad);
    if (params.trailer !== undefined) queryParams.append('trailer', params.trailer);

    const queryString = queryParams.toString();
    const url = `/streaming/play/${movieId}/${queryString ? '?' + queryString : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  // Listar todas las calidades disponibles para una película
  listStreams: async (movieId) => {
    const response = await api.get(`/streaming/list/${movieId}/`);
    return response.data;
  },
};