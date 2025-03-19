// AuditLog model for database operations
const prisma = require('../config/prisma');

/**
 * AuditLog model class for database operations
 */
class AuditLogModel {
  /**
   * Create a new audit log entry
   * @param {string} userId - The ID of the user who performed the action
   * @param {string} action - The action performed
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} The created audit log
   */
  static async create(userId, action, options = {}) {
    const { details, entityType, entityId, ipAddress } = options;
    
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        entityType,
        entityId,
        ipAddress,
        timestamp: new Date()
      },
      include: {
        user: true
      }
    });
  }

  /**
   * Find audit logs by user ID
   * @param {string} userId - The user ID
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Array>} List of audit logs
   */
  static async findByUserId(userId, { skip = 0, take = 50 } = {}) {
    return prisma.auditLog.findMany({
      where: { userId },
      skip,
      take,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: true
      }
    });
  }

  /**
   * Find audit logs by entity
   * @param {string} entityType - The entity type
   * @param {string} entityId - The entity ID
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Array>} List of audit logs
   */
  static async findByEntity(entityType, entityId, { skip = 0, take = 50 } = {}) {
    return prisma.auditLog.findMany({
      where: { 
        entityType,
        entityId
      },
      skip,
      take,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: true
      }
    });
  }

  /**
   * Find all audit logs with optional filtering and pagination
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Array>} List of audit logs
   */
  static async findAll({ 
    action, 
    entityType, 
    fromDate, 
    toDate,
    skip = 0, 
    take = 50 
  } = {}) {
    const where = {};
    
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    
    // Date range filtering
    if (fromDate || toDate) {
      where.timestamp = {};
      
      if (fromDate) {
        where.timestamp.gte = new Date(fromDate);
      }
      
      if (toDate) {
        where.timestamp.lte = new Date(toDate);
      }
    }
    
    return prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: true
      }
    });
  }

  /**
   * Create a helper function to log user authentication events
   * @param {string} userId - The user ID
   * @param {string} event - The authentication event (login, logout, etc.)
   * @param {string} ipAddress - The IP address of the user
   * @returns {Promise<Object>} The created audit log
   */
  static async logAuthEvent(userId, event, ipAddress) {
    return this.create(userId, `AUTH_${event.toUpperCase()}`, {
      details: `User authentication: ${event}`,
      entityType: 'USER',
      entityId: userId,
      ipAddress
    });
  }

  /**
   * Create a helper function to log data modification events
   * @param {string} userId - The user ID
   * @param {string} action - The action (create, update, delete)
   * @param {string} entityType - The type of entity modified
   * @param {string} entityId - The ID of the entity modified
   * @param {string} details - Additional details
   * @param {string} ipAddress - The IP address of the user
   * @returns {Promise<Object>} The created audit log
   */
  static async logDataEvent(userId, action, entityType, entityId, details, ipAddress) {
    return this.create(userId, `DATA_${action.toUpperCase()}`, {
      details,
      entityType,
      entityId,
      ipAddress
    });
  }
}

module.exports = AuditLogModel; 