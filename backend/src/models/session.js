// Session model for database operations
const prisma = require('../config/prisma');

/**
 * Session model class for database operations
 */
class SessionModel {
  /**
   * Create a new session
   * @param {Object} sessionData - The session data
   * @returns {Promise<Object>} The created session
   */
  static async create(sessionData) {
    return prisma.session.create({
      data: sessionData,
      include: {
        createdBy: true,
        assignedTo: true
      }
    });
  }

  /**
   * Find a session by ID
   * @param {string} id - The session ID
   * @returns {Promise<Object>} The session if found
   */
  static async findById(id) {
    try {
      return prisma.session.findUnique({
        where: { id },
        include: {
          createdBy: true,
          assignedTo: true,
          medicalRecord: true,
          vitalSigns: {
            orderBy: {
              timestamp: 'desc'
            }
          },
          notes: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          attachments: true
        }
      });
    } catch (error) {
      console.error("Error finding session by ID:", error);
      throw error;
    }
  }

  /**
   * Update a session
   * @param {string} id - The session ID
   * @param {Object} sessionData - The session data to update
   * @returns {Promise<Object>} The updated session
   */
  static async update(id, sessionData) {
    return prisma.session.update({
      where: { id },
      data: sessionData,
      include: {
        createdBy: true,
        assignedTo: true
      }
    });
  }

  /**
   * Delete a session
   * @param {string} id - The session ID
   * @returns {Promise<Object>} The deleted session
   */
  static async delete(id) {
    return prisma.session.delete({
      where: { id }
    });
  }

  /**
   * Find all sessions with optional filtering and pagination
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Array>} List of sessions
   */
  static async findAll({ 
    status, 
    priority, 
    createdById,
    assignedToId,
    skip = 0, 
    take = 20 
  } = {}) {
    const where = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (createdById) where.createdById = createdById;
    if (assignedToId) where.assignedToId = assignedToId;
    
    return prisma.session.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: true,
        assignedTo: true,
        medicalRecord: true
      }
    });
  }

  /**
   * Assign a session to a doctor
   * @param {string} id - The session ID
   * @param {string} doctorId - The doctor's user ID
   * @returns {Promise<Object>} The updated session
   */
  static async assignToDoctor(id, doctorId) {
    return prisma.session.update({
      where: { id },
      data: {
        assignedToId: doctorId,
        status: 'ASSIGNED',
        updatedAt: new Date()
      },
      include: {
        createdBy: true,
        assignedTo: true
      }
    });
  }

  /**
   * Change the status of a session
   * @param {string} id - The session ID
   * @param {string} status - The new status
   * @returns {Promise<Object>} The updated session
   */
  static async changeStatus(id, status) {
    const data = { status, updatedAt: new Date() };
    
    // If status is COMPLETED, set completedAt
    if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }
    
    return prisma.session.update({
      where: { id },
      data,
      include: {
        createdBy: true,
        assignedTo: true
      }
    });
  }

  /**
   * Add a medical record to a session
   * @param {string} sessionId - The session ID
   * @param {Object} medicalRecordData - The medical record data
   * @returns {Promise<Object>} The created medical record
   */
  static async addMedicalRecord(sessionId, medicalRecordData) {
    return prisma.medicalRecord.create({
      data: {
        ...medicalRecordData,
        session: {
          connect: { id: sessionId }
        }
      }
    });
  }

  /**
   * Add a vital sign to a session
   * @param {string} sessionId - The session ID
   * @param {Object} vitalSignData - The vital sign data
   * @returns {Promise<Object>} The created vital sign
   */
  static async addVitalSign(sessionId, vitalSignData) {
    return prisma.vitalSign.create({
      data: {
        ...vitalSignData,
        session: {
          connect: { id: sessionId }
        }
      }
    });
  }

  /**
   * Add a note to a session
   * @param {string} sessionId - The session ID
   * @param {string} content - The note content
   * @returns {Promise<Object>} The created note
   */
  static async addNote(sessionId, content) {
    return prisma.note.create({
      data: {
        content,
        session: {
          connect: { id: sessionId }
        }
      }
    });
  }
}

module.exports = SessionModel; 