import { api } from './api';

/**
 * Treatment Plan Service
 * Provides methods for interacting with the treatment plan API
 */
const treatmentPlanService = {
  /**
   * Search treatment plans
   * @param {string} query - Search query
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Treatment plans data
   */
  searchTreatmentPlans: async (query, { page = 1, limit = 10 } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (query) queryParams.append('query', query);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const endpoint = `/treatment-plans/search?${queryString}`;
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error searching treatment plans:', error);
      throw error;
    }
  },
  
  /**
   * Get all treatment plans for current doctor
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Treatment plans data
   */
  getDoctorTreatmentPlans: async ({ page = 1, limit = 10 } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const endpoint = `/treatment-plans/doctor?${queryString}`;
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor treatment plans:', error);
      throw error;
    }
  },
  
  /**
   * Get a treatment plan by session ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Treatment plan data
   */
  getTreatmentPlanBySessionId: async (sessionId) => {
    try {
      const response = await api.get(`/treatment-plans/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching treatment plan for session ${sessionId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a treatment plan
   * @param {string} sessionId - Session ID
   * @param {Object} planData - Treatment plan data
   * @returns {Promise<Object>} - Created treatment plan
   */
  createTreatmentPlan: async (sessionId, planData) => {
    try {
      const response = await api.post(`/treatment-plans/sessions/${sessionId}`, planData);
      return response.data;
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      throw error;
    }
  },
  
  /**
   * Update a treatment plan
   * @param {string} planId - Treatment plan ID
   * @param {Object} planData - Updated treatment plan data
   * @returns {Promise<Object>} - Updated treatment plan
   */
  updateTreatmentPlan: async (planId, planData) => {
    try {
      const response = await api.put(`/treatment-plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      console.error(`Error updating treatment plan ${planId}:`, error);
      throw error;
    }
  },
  
  /**
   * Add a step to a treatment plan
   * @param {string} planId - Treatment plan ID
   * @param {Object} stepData - Step data
   * @returns {Promise<Object>} - Created step
   */
  addStep: async (planId, stepData) => {
    try {
      const response = await api.post(`/treatment-plans/${planId}/steps`, stepData);
      return response.data;
    } catch (error) {
      console.error(`Error adding step to treatment plan ${planId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update a treatment plan step
   * @param {string} stepId - Step ID
   * @param {Object} stepData - Updated step data
   * @returns {Promise<Object>} - Updated step
   */
  updateStep: async (stepId, stepData) => {
    try {
      const response = await api.put(`/treatment-plans/steps/${stepId}`, stepData);
      return response.data;
    } catch (error) {
      console.error(`Error updating step ${stepId}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a treatment plan step
   * @param {string} stepId - Step ID
   * @returns {Promise<Object>} - Response data
   */
  deleteStep: async (stepId) => {
    try {
      const response = await api.delete(`/treatment-plans/steps/${stepId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting step ${stepId}:`, error);
      throw error;
    }
  }
};

export { treatmentPlanService }; 