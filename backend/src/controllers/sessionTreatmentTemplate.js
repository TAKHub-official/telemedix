// SessionTreatmentTemplate controller
const { 
  SessionTreatmentTemplateModel, 
  SessionModel, 
  AuditLogModel, 
  NotificationModel 
} = require('../models');
const prisma = require('../config/prisma');
const { emitNotification } = require('../index');

/**
 * Assign a treatment template to a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignTreatmentTemplate = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { treatmentTemplateId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!treatmentTemplateId) {
      return res.status(400).json({
        message: 'Treatment template ID is required'
      });
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        sessionTreatmentTemplate: true
      }
    });

    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      });
    }

    // Check if user has permission (must be a doctor)
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Only doctors can assign treatment templates'
      });
    }

    // Check if treatment template exists
    const treatmentTemplate = await prisma.treatmentTemplate.findUnique({
      where: { id: treatmentTemplateId }
    });

    if (!treatmentTemplate) {
      return res.status(404).json({
        message: 'Treatment template not found'
      });
    }

    // Check if session already has a treatment template
    if (session.sessionTreatmentTemplate) {
      // Update existing assignment
      const updated = await SessionTreatmentTemplateModel.updateBySessionId(sessionId, {
        treatmentTemplateId,
        assignedById: userId,
        status: 'NEW',
        currentStep: 0,
        startedAt: null,
        completedAt: null,
        assignedAt: new Date()
      });

      // Create audit log
      await AuditLogModel.create({
        userId,
        action: 'UPDATE_SESSION_TREATMENT_TEMPLATE',
        entityType: 'SessionTreatmentTemplate',
        entityId: updated.id,
        details: `Updated treatment template assignment for session ${sessionId}`
      });

      // Create notification for assigned user if present
      if (session.assignedToId) {
        await NotificationModel.create({
          userId: session.assignedToId,
          type: 'TREATMENT_TEMPLATE_UPDATED',
          title: 'Behandlungsplan aktualisiert',
          message: `Der Behandlungsplan für die Session "${session.title}" wurde aktualisiert.`
        });

        // Emit socket notification
        emitNotification(session.assignedToId, {
          type: 'TREATMENT_TEMPLATE_UPDATED',
          message: `Der Behandlungsplan für die Session "${session.title}" wurde aktualisiert.`,
          sessionId: session.id
        });
      }

      return res.status(200).json({
        message: 'Treatment template updated successfully',
        sessionTreatmentTemplate: updated
      });
    } else {
      // Create new assignment
      const created = await SessionTreatmentTemplateModel.create({
        sessionId,
        treatmentTemplateId,
        assignedById: userId,
        status: 'NEW',
        currentStep: 0
      });

      // Create audit log
      await AuditLogModel.create({
        userId,
        action: 'ASSIGN_TREATMENT_TEMPLATE',
        entityType: 'SessionTreatmentTemplate',
        entityId: created.id,
        details: `Assigned treatment template to session ${sessionId}`
      });

      // Create notification for assigned user if present
      if (session.assignedToId) {
        await NotificationModel.create({
          userId: session.assignedToId,
          type: 'TREATMENT_TEMPLATE_ASSIGNED',
          title: 'Neuer Behandlungsplan zugewiesen',
          message: `Ein neuer Behandlungsplan wurde der Session "${session.title}" zugewiesen.`
        });

        // Emit socket notification
        emitNotification(session.assignedToId, {
          type: 'TREATMENT_TEMPLATE_ASSIGNED',
          message: `Ein neuer Behandlungsplan wurde der Session "${session.title}" zugewiesen.`,
          sessionId: session.id
        });
      }

      return res.status(201).json({
        message: 'Treatment template assigned successfully',
        sessionTreatmentTemplate: created
      });
    }
  } catch (error) {
    console.error('Error assigning treatment template:', error);
    return res.status(500).json({
      message: 'An error occurred while assigning the treatment template',
      error: error.message
    });
  }
};

/**
 * Get treatment template for a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSessionTreatmentTemplate = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      });
    }

    // Get treatment template for session
    const sessionTreatmentTemplate = await SessionTreatmentTemplateModel.findBySessionId(sessionId);

    if (!sessionTreatmentTemplate) {
      return res.status(404).json({
        message: 'No treatment template assigned to this session'
      });
    }

    // Parse steps from the treatment template
    const treatmentTemplate = sessionTreatmentTemplate.treatmentTemplate;
    const steps = typeof treatmentTemplate.steps === 'string' 
      ? JSON.parse(treatmentTemplate.steps) 
      : treatmentTemplate.steps;

    return res.status(200).json({
      sessionTreatmentTemplate: {
        ...sessionTreatmentTemplate,
        treatmentTemplate: {
          ...treatmentTemplate,
          steps
        }
      }
    });
  } catch (error) {
    console.error('Error getting session treatment template:', error);
    return res.status(500).json({
      message: 'An error occurred while retrieving the treatment template',
      error: error.message
    });
  }
};

/**
 * Update session treatment template status and progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSessionTreatmentTemplate = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, currentStep } = req.body;
    const userId = req.user.id;

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        sessionTreatmentTemplate: true
      }
    });

    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      });
    }

    // Check if session has a treatment template
    if (!session.sessionTreatmentTemplate) {
      return res.status(404).json({
        message: 'No treatment template assigned to this session'
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (status !== undefined) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'IN_PROGRESS' && !session.sessionTreatmentTemplate.startedAt) {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED' && !session.sessionTreatmentTemplate.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    if (currentStep !== undefined) {
      updateData.currentStep = currentStep;
    }

    // Update session treatment template
    const updated = await SessionTreatmentTemplateModel.updateBySessionId(sessionId, updateData);

    // Create audit log
    await AuditLogModel.create({
      userId,
      action: 'UPDATE_TREATMENT_PROGRESS',
      entityType: 'SessionTreatmentTemplate',
      entityId: updated.id,
      details: `Updated treatment template progress for session ${sessionId}`
    });

    // Create notification for doctor if medic is updating
    if (req.user.role === 'MEDIC' && session.createdById !== session.assignedToId) {
      await NotificationModel.create({
        userId: session.createdById,
        type: 'TREATMENT_PROGRESS_UPDATED',
        title: 'Behandlungsfortschritt aktualisiert',
        message: `Der Fortschritt des Behandlungsplans für Session "${session.title}" wurde aktualisiert.`
      });

      // Emit socket notification
      emitNotification(session.createdById, {
        type: 'TREATMENT_PROGRESS_UPDATED',
        message: `Der Fortschritt des Behandlungsplans für Session "${session.title}" wurde aktualisiert.`,
        sessionId: session.id
      });
    }

    return res.status(200).json({
      message: 'Treatment template progress updated successfully',
      sessionTreatmentTemplate: updated
    });
  } catch (error) {
    console.error('Error updating treatment template progress:', error);
    return res.status(500).json({
      message: 'An error occurred while updating the treatment progress',
      error: error.message
    });
  }
};

/**
 * Remove treatment template from session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeSessionTreatmentTemplate = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        sessionTreatmentTemplate: true
      }
    });

    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      });
    }

    // Check if user has permission (must be a doctor)
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Only doctors can remove treatment templates'
      });
    }

    // Check if session has a treatment template
    if (!session.sessionTreatmentTemplate) {
      return res.status(404).json({
        message: 'No treatment template assigned to this session'
      });
    }

    // Delete session treatment template
    await SessionTreatmentTemplateModel.deleteBySessionId(sessionId);

    // Create audit log
    await AuditLogModel.create({
      userId,
      action: 'REMOVE_TREATMENT_TEMPLATE',
      entityType: 'Session',
      entityId: sessionId,
      details: `Removed treatment template from session ${sessionId}`
    });

    return res.status(200).json({
      message: 'Treatment template removed successfully'
    });
  } catch (error) {
    console.error('Error removing treatment template:', error);
    return res.status(500).json({
      message: 'An error occurred while removing the treatment template',
      error: error.message
    });
  }
};

/**
 * Evaluate a treatment for a completed session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const evaluateTreatment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedback } = req.body;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating is required and must be between 1 and 5' });
    }
    
    // Check if session exists
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if session is completed
    if (session.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Only completed sessions can be evaluated' });
    }
    
    // Check if a treatment template was assigned
    const treatmentTemplate = await SessionTreatmentTemplateModel.findBySessionId(sessionId);
    if (!treatmentTemplate) {
      return res.status(400).json({ message: 'No treatment template found for this session' });
    }
    
    // Update the treatment template with the evaluation
    const updatedTemplate = await SessionTreatmentTemplateModel.updateBySessionId(sessionId, {
      evaluation: {
        rating,
        feedback: feedback || '',
        evaluatedAt: new Date(),
        evaluatedBy: req.user.id
      }
    });
    
    // Create audit log
    await AuditLogModel.create({
      action: 'EVALUATE_TREATMENT',
      entity: 'SESSION',
      entityId: sessionId,
      userId: req.user.id,
      metadata: {
        rating,
        feedback: feedback || ''
      }
    });
    
    // Create notification for the doctor who created the template
    if (treatmentTemplate.createdBy) {
      await NotificationModel.create({
        type: 'TREATMENT_EVALUATED',
        userId: treatmentTemplate.createdBy,
        title: 'Treatment Evaluation',
        message: `Your treatment plan for session ${sessionId} has been evaluated`,
        metadata: {
          sessionId,
          rating,
          feedback: feedback || ''
        }
      });
      
      // Emit the notification in real-time
      emitNotification(treatmentTemplate.createdBy, {
        type: 'TREATMENT_EVALUATED',
        title: 'Treatment Evaluation',
        message: `Your treatment plan for session ${sessionId} has been evaluated`,
        metadata: {
          sessionId,
          rating,
          feedback: feedback || ''
        }
      });
    }
    
    return res.status(200).json({
      message: 'Treatment evaluated successfully',
      evaluation: updatedTemplate.evaluation
    });
  } catch (error) {
    console.error('Error in evaluateTreatment:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  assignTreatmentTemplate,
  getSessionTreatmentTemplate,
  updateSessionTreatmentTemplate,
  removeSessionTreatmentTemplate,
  evaluateTreatment
}; 