import api from './api';

export const reportService = {
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  exportCSV: async () => {
    const response = await api.get('/reports/export/csv', {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ContractIQ_Contracts_Export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
