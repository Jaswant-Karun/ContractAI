import api from './api';

export const contractService = {
  getContracts: async (params = {}) => {
    const response = await api.get('/contracts', { params });
    return response.data;
  },

  getContractById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  updateContract: async (id, contractData) => {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },

  deleteContract: async (id) => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  getCalendarEvents: async () => {
    const response = await api.get('/calendar');
    return response.data;
  }
};
