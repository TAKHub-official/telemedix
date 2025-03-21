import { api } from './api';

/**
 * Session Service
 * Provides methods for interacting with the session API
 */
const sessionService = {
  /**
   * Get all sessions with optional filtering
   * @param {Object} filters - Optional filters (status, priority, page, limit)
   * @returns {Promise<Object>} - Sessions data
   */
  getSessions: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/sessions?${queryString}` : '/sessions';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },
  
  /**
   * Get a single session by ID
   * @param {string} id - Session ID
   * @returns {Promise<Object>} - Session data
   */
  getSessionById: async (id) => {
    try {
      const response = await api.get(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching session with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} - Created session
   */
  createSession: async (sessionData) => {
    try {
      const response = await api.post('/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },
  
  /**
   * Update a session
   * @param {string} id - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise<Object>} - Updated session
   */
  updateSession: async (id, sessionData) => {
    try {
      const response = await api.put(`/sessions/${id}`, sessionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating session with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Add a vital sign to a session
   * @param {string} sessionId - Session ID
   * @param {Object} vitalSignData - Vital sign data
   * @returns {Promise<Object>} - Added vital sign
   */
  addVitalSign: async (sessionId, vitalSignData) => {
    try {
      // Ensure value is a string since the database expects strings
      const data = {
        ...vitalSignData,
        value: String(vitalSignData.value) // Convert value to string
      };
      
      const response = await api.post(`/sessions/${sessionId}/vitals`, data);
      return response.data;
    } catch (error) {
      console.error(`Error adding vital sign to session ${sessionId}:`, error);
      throw error;
    }
  },
  
  /**
   * Add a note to a session
   * @param {string} sessionId - Session ID
   * @param {string} content - Note content
   * @returns {Promise<Object>} - Added note
   */
  addNote: async (sessionId, content) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/notes`, { content });
      return response.data;
    } catch (error) {
      console.error(`Error adding note to session ${sessionId}:`, error);
      throw error;
    }
  }
};

export { sessionService }; 