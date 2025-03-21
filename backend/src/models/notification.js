// Notification model for database operations
const prisma = require('../config/prisma');

/**
 * Notification model class for database operations
 */
class NotificationModel {
  /**
   * Create a new notification
   * @param {Object|string} userIdOrData - Either the user ID or a notification data object
   * @param {string} [type] - The notification type (optional if userIdOrData is an object)
   * @param {string} [title] - The notification title (optional if userIdOrData is an object)
   * @param {string} [message] - The notification message (optional if userIdOrData is an object)
   * @returns {Promise<Object>} The created notification
   */
  static async create(userIdOrData, type, title, message) {
    try {
      // Handle the case where userIdOrData is an object with all notification data
      if (typeof userIdOrData === 'object') {
        const notificationData = userIdOrData;
        return prisma.notification.create({
          data: {
            userId: notificationData.userId,
            type: notificationData.type || 'GENERAL',
            title: notificationData.title,
            message: notificationData.message || notificationData.content,
            read: notificationData.read !== undefined ? notificationData.read : false,
            createdAt: new Date()
          },
          include: {
            user: true
          }
        });
      }
      
      // Handle the case with individual parameters
      const userId = userIdOrData;
      return prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          read: false,
          createdAt: new Date()
        },
        include: {
          user: true
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Find notifications for a user
   * @param {string} userId - The user ID
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Array>} List of notifications
   */
  static async findByUserId(userId, { isRead, skip = 0, take = 20 } = {}) {
    const where = { userId };
    
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    
    return prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });
  }

  /**
   * Find unread notifications for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} List of unread notifications
   */
  static async findUnreadByUserId(userId) {
    return prisma.notification.findMany({
      where: { 
        userId,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Mark notification as read
   * @param {string} id - The notification ID
   * @returns {Promise<Object>} The updated notification
   */
  static async markAsRead(id) {
    return prisma.notification.update({
      where: { id },
      data: {
        read: true,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The prisma update result
   */
  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { 
        userId,
        read: false
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Delete a notification
   * @param {string} id - The notification ID
   * @returns {Promise<Object>} The deleted notification
   */
  static async delete(id) {
    return prisma.notification.delete({
      where: { id }
    });
  }

  /**
   * Delete all notifications for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The prisma delete result
   */
  static async deleteAllForUser(userId) {
    return prisma.notification.deleteMany({
      where: { userId }
    });
  }

  /**
   * Count unread notifications for a user
   * @param {string} userId - The user ID
   * @returns {Promise<number>} Number of unread notifications
   */
  static async countUnreadByUserId(userId) {
    return prisma.notification.count({
      where: { 
        userId,
        read: false
      }
    });
  }

  /**
   * Create a session notification
   * @param {string} userId - The recipient user ID
   * @param {Object} session - The session data
   * @returns {Promise<Object>} The created notification
   */
  static async createSessionNotification(userId, session) {
    return this.create(
      userId,
      'NEW_SESSION',
      'Neue Session verfügbar',
      `Eine neue Session "${session.title}" wurde erstellt und wartet auf Bearbeitung.`
    );
  }

  /**
   * Create a treatment plan notification
   * @param {string} userId - The recipient user ID
   * @param {Object} plan - The treatment plan data
   * @returns {Promise<Object>} The created notification
   */
  static async createTreatmentPlanNotification(userId, plan) {
    return this.create(
      userId,
      'PLAN_UPDATED',
      'Behandlungsplan aktualisiert',
      `Der Behandlungsplan "${plan.title}" wurde aktualisiert.`
    );
  }

  /**
   * Create a step completion notification
   * @param {string} userId - The recipient user ID
   * @param {Object} step - The completed step
   * @param {Object} session - The session data
   * @returns {Promise<Object>} The created notification
   */
  static async createStepCompletionNotification(userId, step, session) {
    return this.create(
      userId,
      'STEP_COMPLETED',
      'Behandlungsschritt abgeschlossen',
      `Schritt ${step.order}: "${step.instruction}" in Session "${session.title}" wurde abgeschlossen.`
    );
  }
}

module.exports = NotificationModel; 