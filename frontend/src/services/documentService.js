import api from './api';

export const documentService = {
  uploadDocument: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};
