import api from './api';

export const teamService = {
  getTeamMembers: async () => {
    const response = await api.get('/team');
    return response.data;
  },

  inviteMember: async (memberData) => {
    const response = await api.post('/team', memberData);
    return response.data;
  },

  updateMemberRole: async (id, role) => {
    const response = await api.put(`/team/${id}`, { role });
    return response.data;
  },

  removeMember: async (id) => {
    const response = await api.delete(`/team/${id}`);
    return response.data;
  }
};
