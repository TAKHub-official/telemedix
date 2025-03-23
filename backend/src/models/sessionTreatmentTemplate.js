// SessionTreatmentTemplate model for database operations
const prisma = require('../config/prisma');

/**
 * SessionTreatmentTemplate model class for database operations
 */
class SessionTreatmentTemplateModel {
  /**
   * Create a new session treatment template
   * @param {Object} data - The session treatment template data
   * @returns {Promise<Object>} The created session treatment template
   */
  static async create(data) {
    return prisma.sessionTreatmentTemplate.create({
      data,
      include: {
        session: true,
        treatmentTemplate: true
      }
    });
  }

  /**
   * Find a session treatment template by session ID
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} The session treatment template if found
   */
  static async findBySessionId(sessionId) {
    return prisma.sessionTreatmentTemplate.findUnique({
      where: { sessionId },
      include: {
        session: true,
        treatmentTemplate: true
      }
    });
  }

  /**
   * Find a session treatment template by ID
   * @param {string} id - The session treatment template ID
   * @returns {Promise<Object>} The session treatment template if found
   */
  static async findById(id) {
    return prisma.sessionTreatmentTemplate.findUnique({
      where: { id },
      include: {
        session: true,
        treatmentTemplate: true
      }
    });
  }

  /**
   * Update a session treatment template
   * @param {string} id - The session treatment template ID
   * @param {Object} data - The data to update
   * @returns {Promise<Object>} The updated session treatment template
   */
  static async update(id, data) {
    return prisma.sessionTreatmentTemplate.update({
      where: { id },
      data,
      include: {
        session: true,
        treatmentTemplate: true
      }
    });
  }

  /**
   * Update a session treatment template by session ID
   * @param {string} sessionId - The session ID
   * @param {Object} data - The data to update
   * @returns {Promise<Object>} The updated session treatment template
   */
  static async updateBySessionId(sessionId, data) {
    return prisma.sessionTreatmentTemplate.update({
      where: { sessionId },
      data,
      include: {
        session: true,
        treatmentTemplate: true
      }
    });
  }

  /**
   * Delete a session treatment template
   * @param {string} id - The session treatment template ID
   * @returns {Promise<Object>} The deleted session treatment template
   */
  static async delete(id) {
    return prisma.sessionTreatmentTemplate.delete({
      where: { id }
    });
  }

  /**
   * Delete a session treatment template by session ID
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} The deleted session treatment template
   */
  static async deleteBySessionId(sessionId) {
    return prisma.sessionTreatmentTemplate.delete({
      where: { sessionId }
    });
  }
}

module.exports = SessionTreatmentTemplateModel; 