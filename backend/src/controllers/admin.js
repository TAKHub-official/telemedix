// Admin controller
const { UserModel } = require('../models');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get sessions counts by status
    const activeSessions = await prisma.session.count({
      where: {
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
      }
    });
    
    const completedSessions = await prisma.session.count({
      where: {
        status: 'COMPLETED'
      }
    });
    
    const pendingSessions = await prisma.session.count({
      where: {
        status: 'OPEN'
      }
    });
    
    // Return statistics
    res.status(200).json({
      totalUsers,
      activeSessions,
      completedSessions,
      pendingSessions
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Get detailed dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDetailedStats = async (req, res) => {
  try {
    // Get basic stats
    const totalUsers = await prisma.user.count();
    
    const activeSessions = await prisma.session.count({
      where: {
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
      }
    });
    
    const completedSessions = await prisma.session.count({
      where: {
        status: 'COMPLETED'
      }
    });
    
    const pendingSessions = await prisma.session.count({
      where: {
        status: 'OPEN'
      }
    });
    
    // Get users by role
    const adminUsers = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    
    const doctorUsers = await prisma.user.count({
      where: { role: 'DOCTOR' }
    });
    
    const medicUsers = await prisma.user.count({
      where: { role: 'MEDIC' }
    });
    
    // Get sessions by priority
    const lowPrioritySessions = await prisma.session.count({
      where: { priority: 'LOW' }
    });
    
    const normalPrioritySessions = await prisma.session.count({
      where: { priority: 'NORMAL' }
    });
    
    const highPrioritySessions = await prisma.session.count({
      where: { priority: 'HIGH' }
    });
    
    const urgentPrioritySessions = await prisma.session.count({
      where: { priority: 'URGENT' }
    });
    
    // Get recent activities (last 5 audit logs)
    const recentLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    // Format recent activities for display
    const recentActivities = recentLogs.map(log => {
      const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unbekannt';
      
      let title, description;
      switch (log.action) {
        case 'CREATE':
          title = `${userName} hat ${log.entityType} erstellt`;
          description = log.details || `Neue/r ${log.entityType} wurde erstellt`;
          break;
        case 'UPDATE':
          title = `${userName} hat ${log.entityType} aktualisiert`;
          description = log.details || `${log.entityType} wurde aktualisiert`;
          break;
        case 'DELETE':
          title = `${userName} hat ${log.entityType} gelöscht`;
          description = log.details || `${log.entityType} wurde gelöscht`;
          break;
        default:
          title = `${userName} hat eine Aktion ausgeführt`;
          description = log.details || 'Unbekannte Aktion';
      }
      
      return {
        id: log.id,
        title,
        time: log.timestamp,
        description,
        type: log.entityType,
        action: log.action
      };
    });
    
    // Return detailed statistics
    res.status(200).json({
      totalUsers,
      activeSessions,
      completedSessions,
      pendingSessions,
      usersByRole: {
        ADMIN: adminUsers,
        DOCTOR: doctorUsers,
        MEDIC: medicUsers
      },
      sessionsByPriority: {
        LOW: lowPrioritySessions,
        NORMAL: normalPrioritySessions,
        HIGH: highPrioritySessions,
        URGENT: urgentPrioritySessions
      },
      recentActivities
    });
  } catch (error) {
    console.error('Get detailed stats error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Get audit logs with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, startDate, endDate, userId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause for filtering
    const where = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    
    // Add date range filter if provided
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }
    
    // Get total count for pagination
    const totalLogs = await prisma.auditLog.count({ where });
    
    // Fetch audit logs with filtering and pagination
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    // Format logs to include user name
    const formattedLogs = logs.map(log => {
      return {
        ...log,
        userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : null,
        userEmail: log.user?.email
      };
    });
    
    res.status(200).json({
      logs: formattedLogs,
      total: totalLogs,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalLogs / parseInt(limit))
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Reset user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    console.log(`Admin attempting to reset password for user ID: ${id}`);
    
    if (!newPassword) {
      console.log('Password reset failed: New password is required');
      return res.status(400).json({ 
        message: 'Neues Passwort ist erforderlich'
      });
    }
    
    // Find user by ID
    const user = await UserModel.findById(id);
    
    if (!user) {
      console.log(`Password reset failed: User ID ${id} not found`);
      return res.status(404).json({ 
        message: 'Benutzer nicht gefunden'
      });
    }
    
    console.log(`Resetting password for user: ${user.email} (${user.role})`);
    
    // Update password
    await UserModel.update(id, {
      password: newPassword
    });
    
    console.log(`Password reset successful for user: ${user.email}`);
    
    // TODO: Send password reset email to user
    
    res.status(200).json({
      message: 'Passwort erfolgreich zurückgesetzt'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

module.exports = {
  getStats,
  getDetailedStats,
  getAuditLogs,
  resetUserPassword
}; 