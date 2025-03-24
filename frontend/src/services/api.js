import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

// Log configuration for debugging
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('API URL:', apiUrl);

// Create axios instance with baseURL and common configurations
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common response tasks
api.interceptors.response.use(
  (response) => {
    // Optional: Log successful responses
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Handle response errors
    console.error('API Error Response:', error);
    
    if (error.response) {
      // The request was made and the server responded with a non-2xx status
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper to handle array parameters for filters
const processParams = (params) => {
  if (!params) return params;
  
  const modifiedParams = { ...params };
  
  // Handle status arrays for filtering
  if (params && params.status && Array.isArray(params.status)) {
    if (params.status.length === 0) {
      delete modifiedParams.status;
    } else {
      // Convert status array to comma-separated string
      modifiedParams.status = params.status.join(',');
    }
  }
  
  return modifiedParams;
};

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
  create: (data) => {
    console.log('Creating new user with data:', {...data, password: '[REDACTED]'});
    return api.post('/users', data);
  },
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
  resetUserPassword: (id, newPassword) => {
    console.log(`Resetting password for user ID: ${id}`);
    return api.post(`/admin/users/${id}/reset-password`, { newPassword });
  },
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