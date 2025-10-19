import api from './api';

export const movieService = {
  // Obtener todas las películas
  getMovies: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.genero_id) queryParams.append('genero_id', params.genero_id);
    if (params.actor_id) queryParams.append('actor_id', params.actor_id);
    if (params.director_id) queryParams.append('director_id', params.director_id);
    if (params.anio) queryParams.append('anio', params.anio);

    const queryString = queryParams.toString();
    const url = `/contenido/peliculas/${queryString ? '?' + queryString : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  // Obtener detalle de una película
  getMovieDetail: async (movieId) => {
    const response = await api.get(`/contenido/peliculas/${movieId}/`);
    return response.data;
  },

  // Obtener filtros disponibles (géneros, actores, directores)
  getFilters: async () => {
    const response = await api.get('/contenido/filtros/');
    return response.data;
  },
};