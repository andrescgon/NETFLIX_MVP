import api from './api';

export const subscriptionService = {
  // Obtener todos los planes disponibles
  getPlans: async () => {
    const response = await api.get('/suscripciones/planes/');
    return response.data;
  },

  // Suscribirse a un plan
  subscribe: async (planId) => {
    const response = await api.post('/suscripciones/suscribirse/', {
      plan_id: planId,
    });
    return response.data;
  },

  // Obtener mi suscripción actual
  getMySubscription: async () => {
    const response = await api.get('/suscripciones/mi/');
    return response.data;
  },
};