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

  reanalyzeContract: async (id) => {
    const response = await api.post(`/contracts/${id}/reanalyze`);
    return response.data;
  },

  bulkOperations: async (action, contractIds, payload = {}) => {
    const response = await api.post('/contracts/bulk', { action, contractIds, payload });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  getCalendarEvents: async () => {
    const response = await api.get('/calendar');
    return response.data;
  },

  getAnalysis: async (contractId = 'latest') => {
    const response = await api.get(`/analysis/${contractId}`);
    return response.data;
  },

  getRiskOverview: async () => {
    const response = await api.get('/risks');
    return response.data;
  },

  getRenewalCenter: async () => {
    const response = await api.get('/renewals');
    return response.data;
  },

  handleRenewalAction: async (contractId, actionData) => {
    const response = await api.post(`/renewals/${contractId}/action`, actionData);
    return response.data;
  },

  getChatSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },

  sendChatMessage: async (data) => {
    const response = await api.post('/chat', data);
    return response.data;
  },

  compareContracts: async (contractAId, contractBId) => {
    const response = await api.post('/comparison', { contractAId, contractBId });
    return response.data;
  },

  getClauseIntelligence: async (params = {}) => {
    const response = await api.get('/clauses', { params });
    return response.data;
  },

  getEvidenceExplorer: async (params = {}) => {
    const response = await api.get('/evidence', { params });
    return response.data;
  },

  getAnalyticsOverview: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  getCounterparties: async () => {
    const response = await api.get('/counterparties');
    return response.data;
  },

  getObligations: async (params = {}) => {
    const response = await api.get('/obligations', { params });
    return response.data;
  },

  updateObligation: async (id, data) => {
    const response = await api.put(`/obligations/${id}`, data);
    return response.data;
  },

  getAutomationStatus: async () => {
    const response = await api.get('/automations');
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get('/audit', { params });
    return response.data;
  },

  getWorkspaceDetails: async () => {
    const response = await api.get('/workspace');
    return response.data;
  }
};
