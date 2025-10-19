import api from './api';

export const profileService = {
  // Obtener todos los perfiles del usuario
  getProfiles: async () => {
    const response = await api.get('/perfiles/');
    return response.data;
  },

  // Crear un nuevo perfil
  createProfile: async (profileData) => {
    const response = await api.post('/perfiles/', profileData);
    return response.data;
  },

  // Actualizar un perfil
  updateProfile: async (profileId, profileData) => {
    const response = await api.put(`/perfiles/${profileId}/`, profileData);
    return response.data;
  },

  // Eliminar un perfil
  deleteProfile: async (profileId) => {
    const response = await api.delete(`/perfiles/${profileId}/`);
    return response.data;
  },

  // Activar un perfil (establece cookie)
  activateProfile: async (profileId) => {
    const response = await api.post(`/perfiles/${profileId}/activar/`);
    return response.data;
  },

  // Ver perfil activo
  getActiveProfile: async () => {
    const response = await api.get('/perfiles/activo/');
    return response.data;
  },

  // Desactivar perfil (elimina cookie)
  deactivateProfile: async () => {
    const response = await api.post('/perfiles/desactivar/');
    return response.data;
  },
};