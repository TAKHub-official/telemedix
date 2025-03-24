import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

// Log configuration for debugging
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('API URL:', apiUrl);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for slow connections
  timeout: 10000,
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log(`Request to ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.log('Unauthorized error, clearing session');
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
const authAPI = {
  login: (credentials) => {
    console.log('Calling login API with:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Users API
const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateNotificationSettings: (id, settings) => api.put(`/users/${id}/notifications`, settings),
};

// Admin API
const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getDetailedStats: () => api.get('/admin/stats/detailed'),
  getAuditLogs: (filters = {}) => api.get('/admin/logs', { params: filters }),
  resetUserPassword: (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, { newPassword }),
};

// Sessions API
const sessionsAPI = {
  getAll: (params) => {
    // Handle array parameters correctly
    if (params && params.status && Array.isArray(params.status)) {
      // Create a copy to avoid modifying the original object
      const modifiedParams = { ...params };
      // Convert status array to comma-separated string
      modifiedParams.status = params.status.join(',');
      return api.get('/sessions', { params: modifiedParams });
    }
    // Regular case
    return api.get('/sessions', { params });
  },
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => {
    console.log(`API call: updating session ${id} with data:`, data);
    return api.put(`/sessions/${id}`, data)
      .then(response => {
        console.log('Session update success response:', response);
        return response.data;
      })
      .catch(error => {
        console.error('Session update error:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      });
  },
  assign: (id, doctorId) => {
    console.log(`API call: assigning session ${id} to doctor`, doctorId || 'current user');
    return api.put(`/sessions/${id}/assign`, { doctorId }).then(response => {
      console.log('Session assign response:', response);
      return response.data;
    });
  },
  addVitalSign: (id, data) => api.post(`/sessions/${id}/vitals`, data),
  addNote: (id, content) => api.post(`/sessions/${id}/notes`, { content }),
  evaluateTreatment: async (sessionId, evaluationData) => {
    return api.post(`/api/sessions/${sessionId}/treatment-evaluation`, evaluationData);
  },
  // Add treatment template methods
  getSessionTreatmentTemplate: (sessionId) => api.get(`/sessions/${sessionId}/treatment-template`),
  assignTreatmentTemplate: (sessionId, templateId) => api.post(`/sessions/${sessionId}/treatment-template`, { treatmentTemplateId: templateId }),
  updateTreatmentTemplate: (sessionId, data) => api.put(`/sessions/${sessionId}/treatment-template`, data),
  removeTreatmentTemplate: (sessionId) => api.delete(`/sessions/${sessionId}/treatment-template`),
};

// Treatment Plans API
const treatmentPlansAPI = {
  getBySessionId: (sessionId) => api.get(`/treatment-plans/sessions/${sessionId}`),
  create: (sessionId, data) => api.post(`/treatment-plans/sessions/${sessionId}`, data),
  update: (planId, data) => api.put(`/treatment-plans/${planId}`, data),
  delete: (planId) => api.delete(`/treatment-plans/${planId}`),
  
  // Treatment Steps
  addStep: (planId, description) => api.post(`/treatment-plans/${planId}/steps`, { description }),
  updateStep: (stepId, data) => api.put(`/treatment-plans/steps/${stepId}`, data),
  deleteStep: (stepId) => api.delete(`/treatment-plans/steps/${stepId}`),
};

// Treatment Templates API
const treatmentTemplatesAPI = {
  getAll: () => api.get('/treatment-templates'),
  getById: (id) => api.get(`/treatment-templates/${id}`),
  create: (data) => api.post('/treatment-templates', data),
  update: (id, data) => api.put(`/treatment-templates/${id}`, data),
  delete: (id) => api.delete(`/treatment-templates/${id}`),
  
  // Favorite functionality
  favorite: (id) => api.post(`/treatment-templates/${id}/favorite`),
  unfavorite: (id) => api.delete(`/treatment-templates/${id}/favorite`)
};

export {
  api,
  authAPI,
  usersAPI,
  sessionsAPI,
  treatmentPlansAPI,
  treatmentTemplatesAPI,
  adminAPI,
}; 