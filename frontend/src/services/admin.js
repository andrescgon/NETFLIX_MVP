import api from './api';

// ==================== PELÍCULAS ====================
export const getMoviesAdmin = async (params = {}) => {
  try {
    const response = await api.get('/admin/peliculas/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener películas' };
  }
};

export const getMovieDetailAdmin = async (movieId) => {
  try {
    const response = await api.get(`/admin/peliculas/${movieId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener película' };
  }
};

export const createMovie = async (movieData) => {
  try {
    const response = await api.post('/admin/peliculas/', movieData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al crear película' };
  }
};

export const updateMovie = async (movieId, movieData) => {
  try {
    const response = await api.put(`/admin/peliculas/${movieId}/`, movieData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al actualizar película' };
  }
};

export const deleteMovie = async (movieId) => {
  try {
    await api.delete(`/admin/peliculas/${movieId}/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al eliminar película' };
  }
};

// ==================== ACTORES ====================
export const getActors = async () => {
  try {
    const response = await api.get('/contenido/actores/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener actores' };
  }
};

export const createActor = async (actorData) => {
  try {
    const response = await api.post('/admin/actores/', actorData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al crear actor' };
  }
};

export const updateActor = async (actorId, actorData) => {
  try {
    const response = await api.put(`/admin/actores/${actorId}/`, actorData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al actualizar actor' };
  }
};

export const deleteActor = async (actorId) => {
  try {
    await api.delete(`/admin/actores/${actorId}/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al eliminar actor' };
  }
};

// ==================== DIRECTORES ====================
export const getDirectors = async () => {
  try {
    const response = await api.get('/contenido/directores/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener directores' };
  }
};

export const createDirector = async (directorData) => {
  try {
    const response = await api.post('/admin/directores/', directorData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al crear director' };
  }
};

export const updateDirector = async (directorId, directorData) => {
  try {
    const response = await api.put(`/admin/directores/${directorId}/`, directorData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al actualizar director' };
  }
};

export const deleteDirector = async (directorId) => {
  try {
    await api.delete(`/admin/directores/${directorId}/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al eliminar director' };
  }
};

// ==================== GÉNEROS ====================
export const getGenres = async () => {
  try {
    const response = await api.get('/contenido/generos/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener géneros' };
  }
};

export const createGenre = async (genreData) => {
  try {
    const response = await api.post('/admin/generos/', genreData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al crear género' };
  }
};

export const updateGenre = async (genreId, genreData) => {
  try {
    const response = await api.put(`/admin/generos/${genreId}/`, genreData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al actualizar género' };
  }
};

export const deleteGenre = async (genreId) => {
  try {
    await api.delete(`/admin/generos/${genreId}/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al eliminar género' };
  }
};

// ==================== USUARIOS ====================
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/usuarios/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener usuarios' };
  }
};

export const getUserDetail = async (userId) => {
  try {
    const response = await api.get(`/admin/usuarios/${userId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener usuario' };
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/admin/usuarios/${userId}/`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al actualizar usuario' };
  }
};

export const deleteUser = async (userId) => {
  try {
    await api.delete(`/admin/usuarios/${userId}/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al eliminar usuario' };
  }
};

// ==================== SUSCRIPCIONES ====================
export const getAllSubscriptions = async (params = {}) => {
  try {
    const response = await api.get('/suscripciones/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener suscripciones' };
  }
};

export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await api.post(`/suscripciones/${subscriptionId}/cancelar/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al cancelar suscripción' };
  }
};

// ==================== PLANES ====================
export const getPlansAdmin = async () => {
  try {
    const response = await api.get('/admin/planes/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener planes' };
  }
};

export const getPlanDetail = async (planId) => {
  try {
    const response = await api.get(`/admin/planes/${planId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener plan' };
  }
};

export const createPlan = async (planData) => {
  try {
    const response = await api.post('/admin/planes/', planData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al crear plan' };
  }
};

export const updatePlan = async (planId, planData) => {
  try {
    const response = await api.put(`/admin/planes/${planId}/`, planData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al actualizar plan' };
  }
};

export const deletePlan = async (planId) => {
  try {
    await api.delete(`/admin/planes/${planId}/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al eliminar plan' };
  }
};

// ==================== MEDIA ASSETS ====================
export const getMediaAssets = async (params = {}) => {
  try {
    const response = await api.get('/uploader/assets/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener assets' };
  }
};

export const createMediaAsset = async (assetData) => {
  try {
    const response = await api.post('/uploader/assets/', assetData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al crear asset' };
  }
};

export const deleteMediaAsset = async (assetId) => {
  try {
    await api.delete(`/uploader/assets/${assetId}/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al eliminar asset' };
  }
};

// ==================== HISTORIAL DE VISUALIZACIONES ====================
export const getAllHistory = async (params = {}) => {
  try {
    const response = await api.get('/history/all/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener historial' };
  }
};

// ==================== ESTADÍSTICAS ====================
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/stats/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener estadísticas' };
  }
};

export const getRecentActivity = async () => {
  try {
    const response = await api.get('/admin/activity/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener actividad reciente' };
  }
};

export const getPayments = async (params = {}) => {
  try {
    const response = await api.get('/pagos/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || 'Error al obtener pagos' };
  }
};
