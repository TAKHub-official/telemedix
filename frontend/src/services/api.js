import axios from 'axios';

// Log configuration for debugging
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('API URL:', apiUrl);

// Create axios instance with default config
const api = axios.create({
  baseURL: apiUrl,
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
  update: (id, data) => api.put(`/sessions/${id}`, data),
  assign: (id, doctorId) => api.post(`/sessions/${id}/assign`, { doctorId }),
  addVitalSign: (id, data) => api.post(`/sessions/${id}/vitals`, data),
  addNote: (id, content) => api.post(`/sessions/${id}/notes`, { content }),
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

export {
  api,
  authAPI,
  usersAPI,
  sessionsAPI,
  treatmentPlansAPI,
}; 