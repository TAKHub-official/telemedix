// TreatmentPlan controller
const { TreatmentPlanModel, SessionModel, AuditLogModel, NotificationModel } = require('../models');
const prisma = require('../config/prisma');
const { emitNotification } = require('../index');

/**
 * Create a new treatment plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTreatmentPlan = async (req, res) => {
  try {
    const { sessionId, diagnosis, treatment, medications, notes, status } = req.body;
    
    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({ 
        message: 'Session ID ist erforderlich'
      });
    }
    
    // Find session by ID
    const session = await SessionModel.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        message: 'Session nicht gefunden'
      });
    }
    
    // Check if user has permission to create treatment plan
    if (req.user.role === 'DOCTOR') {
      if (session.assignedToId !== req.user.id && 
          session.status !== 'COMPLETED' && 
          session.status !== 'CANCELLED') {
        return res.status(403).json({ 
          message: 'Zugriff verweigert. Sie können keinen Behandlungsplan für eine Session erstellen, die nicht Ihnen zugewiesen ist.'
        });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Nur Ärzte und Administratoren können Behandlungspläne erstellen.'
      });
    }
    
    // Check if treatment plan already exists for this session
    const existingPlan = await TreatmentPlanModel.findBySessionId(sessionId);
    
    if (existingPlan) {
      return res.status(400).json({ 
        message: 'Für diese Session existiert bereits ein Behandlungsplan'
      });
    }
    
    // Create treatment plan
    const treatmentPlan = await TreatmentPlanModel.create({
      sessionId,
      doctorId: req.user.id,
      diagnosis: diagnosis || '',
      treatment: treatment || '',
      medications: medications || [],
      notes: notes || '',
      status: status || 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Log treatment plan creation
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'CREATE',
      'TREATMENT_PLAN',
      treatmentPlan.id,
      `Behandlungsplan erstellt für Session: ${session.title}`,
      ipAddress
    );
    
    // Notify the medic that a treatment plan has been created
    if (session.createdById) {
      try {
        // Create notification record
        await NotificationModel.create({
          userId: session.createdById,
          type: 'TREATMENT_PLAN',
          title: 'Neue Behandlungsplan',
          message: `Ein Behandlungsplan wurde für Ihre Session "${session.title}" erstellt.`,
          read: false,
          relatedId: sessionId
        });
        
        // Send real-time notification
        emitNotification(session.createdById, {
          title: 'Neue Behandlungsplan',
          content: `Ein Behandlungsplan wurde für Ihre Session "${session.title}" erstellt.`,
          type: 'TREATMENT_PLAN',
          relatedId: sessionId
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue execution even if notification creation fails
      }
    }
    
    res.status(201).json({
      message: 'Behandlungsplan erfolgreich erstellt',
      treatmentPlan
    });
  } catch (error) {
    console.error('Create treatment plan error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Get treatment plan by session ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTreatmentPlanBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({ 
        message: 'Session ID ist erforderlich'
      });
    }
    
    // Find session by ID
    const session = await SessionModel.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        message: 'Session nicht gefunden'
      });
    }
    
    // Check if user has permission to view treatment plan
    if (req.user.role === 'DOCTOR') {
      // Allow doctors to access treatment plans for:
      // 1. Their assigned sessions
      // 2. Any archived session (COMPLETED or CANCELLED)
      if (session.assignedToId !== req.user.id && 
          session.status !== 'COMPLETED' && 
          session.status !== 'CANCELLED') {
        return res.status(403).json({ 
          message: 'Zugriff verweigert. Sie können keinen Behandlungsplan für eine Session einsehen, die nicht Ihnen zugewiesen ist.'
        });
      }
    } else if (req.user.role === 'MEDIC') {
      if (session.createdById !== req.user.id) {
        return res.status(403).json({ 
          message: 'Zugriff verweigert. Sie können keinen Behandlungsplan für eine Session einsehen, die nicht von Ihnen erstellt wurde.'
        });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Nur Ärzte, Sanitäter und Administratoren können Behandlungspläne einsehen.'
      });
    }
    
    // Find treatment plan by session ID
    const treatmentPlan = await TreatmentPlanModel.findBySessionId(sessionId);
    
    if (!treatmentPlan) {
      // Auto-create a draft treatment plan if the session is assigned to a doctor
      if ((req.user.role === 'DOCTOR' && session.assignedToId === req.user.id) || req.user.role === 'ADMIN') {
        // Create a new draft treatment plan
        const newTreatmentPlan = await TreatmentPlanModel.create({
          sessionId,
          doctorId: session.assignedToId || req.user.id,
          diagnosis: '',
          treatment: '',
          medications: [],
          notes: '',
          status: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return res.status(200).json({
          message: 'Neuer Behandlungsplan-Entwurf erstellt',
          treatmentPlan: newTreatmentPlan
        });
      }

      return res.status(404).json({ 
        message: 'Behandlungsplan nicht gefunden'
      });
    }
    
    res.status(200).json({
      treatmentPlan
    });
  } catch (error) {
    console.error('Get treatment plan by session ID error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Update a treatment plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTreatmentPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { diagnosis } = req.body;
    
    // Find treatment plan by ID
    const treatmentPlan = await TreatmentPlanModel.findById(planId);
    
    if (!treatmentPlan) {
      return res.status(404).json({ 
        message: 'Behandlungsplan nicht gefunden'
      });
    }
    
    // Find the associated session
    const session = await SessionModel.findById(treatmentPlan.sessionId);
    
    // Check if user has access to update this treatment plan
    if (req.user.role === 'DOCTOR' && 
        session.assignedToId !== req.user.id && 
        session.status !== 'COMPLETED' && 
        session.status !== 'CANCELLED') {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Session ist einem anderen Arzt zugewiesen.'
      });
    }
    
    // Build update data
    const updateData = {};
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    
    // Update treatment plan
    const updatedPlan = await TreatmentPlanModel.update(planId, updateData);
    
    // Log treatment plan update
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'UPDATE',
      'TREATMENT_PLAN',
      planId,
      `Behandlungsplan aktualisiert: ${updatedPlan.diagnosis || 'Kein Titel'}`,
      ipAddress
    );
    
    res.status(200).json({
      message: 'Behandlungsplan erfolgreich aktualisiert',
      treatmentPlan: updatedPlan
    });
  } catch (error) {
    console.error('Update treatment plan error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Delete a treatment plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTreatmentPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    
    // Find treatment plan by ID
    const treatmentPlan = await TreatmentPlanModel.findById(planId);
    
    if (!treatmentPlan) {
      return res.status(404).json({ 
        message: 'Behandlungsplan nicht gefunden'
      });
    }
    
    // Find the associated session
    const session = await SessionModel.findById(treatmentPlan.sessionId);
    
    // Check if the user is allowed to delete this treatment plan
    if ((req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id) && 
        session.status !== 'COMPLETED' && 
        session.status !== 'CANCELLED') {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Sie können keinen Behandlungsplan löschen, den Sie nicht erstellt haben.'
      });
    }
    
    // Delete treatment plan
    await TreatmentPlanModel.delete(planId);
    
    // Log treatment plan deletion
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'DELETE',
      'TREATMENT_PLAN',
      planId,
      `Behandlungsplan gelöscht für Session: ${session.title}`,
      ipAddress
    );
    
    res.status(200).json({
      message: 'Behandlungsplan erfolgreich gelöscht'
    });
  } catch (error) {
    console.error('Delete treatment plan error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Add a step to a treatment plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addStep = async (req, res) => {
  try {
    const { planId } = req.params;
    const { title, description, order } = req.body;
    
    // Validate input
    if (!title) {
      return res.status(400).json({ 
        message: 'Titel ist erforderlich'
      });
    }
    
    // Find treatment plan
    const treatmentPlan = await TreatmentPlanModel.findById(planId);
    
    if (!treatmentPlan) {
      return res.status(404).json({ 
        message: 'Behandlungsplan nicht gefunden'
      });
    }
    
    // Find the associated session
    const session = await SessionModel.findById(treatmentPlan.sessionId);
    
    // Check if user has permission to add steps
    if (req.user.role === 'DOCTOR' && 
        session.assignedToId !== req.user.id && 
        session.status !== 'COMPLETED' && 
        session.status !== 'CANCELLED') {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Sie können keine Behandlungsschritte zu einem Plan hinzufügen, der nicht von Ihnen erstellt wurde.'
      });
    }
    
    // Add step to treatment plan
    const step = await TreatmentPlanModel.addStep(planId, {
      title,
      description,
      order,
      status: 'PENDING'
    });
    
    // Log step addition
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'CREATE',
      'TREATMENT_STEP',
      step.id,
      `Schritt hinzugefügt zum Behandlungsplan: ${description}`,
      ipAddress
    );
    
    res.status(201).json({
      message: 'Schritt erfolgreich hinzugefügt',
      step
    });
  } catch (error) {
    console.error('Add step error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Update a treatment step
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { title, description, order, completed } = req.body;
    
    // Find step by ID (this also gives us the plan ID)
    const step = await TreatmentPlanModel.findStepById(stepId);
    
    if (!step) {
      return res.status(404).json({ 
        message: 'Behandlungsschritt nicht gefunden'
      });
    }
    
    // Find treatment plan
    const treatmentPlan = await TreatmentPlanModel.findById(step.treatmentPlanId);
    
    // Find the associated session
    const session = await SessionModel.findById(treatmentPlan.sessionId);
    
    // Check if user has permission to update steps
    if (req.user.role === 'DOCTOR' && 
        session.assignedToId !== req.user.id && 
        session.status !== 'COMPLETED' && 
        session.status !== 'CANCELLED') {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Sie können keine Behandlungsschritte bearbeiten, die nicht von Ihnen erstellt wurden.'
      });
    }
    
    // Build update data
    const updateData = {};
    
    // For now, allow all users to modify description until status is implemented
    if (description) {
      updateData.description = description;
    }
    
    // For now, allow all users to update status
    if (completed) {
      updateData.completedAt = new Date();
    }
    
    // Both doctors and medics can add notes
    if (order !== undefined) {
      updateData.order = order;
    }
    
    // Don't update if there's nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        message: 'Keine Änderungen angegeben'
      });
    }
    
    // Update step
    const updatedStep = await TreatmentPlanModel.updateStep(stepId, updateData);
    
    // Log step update
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'UPDATE',
      'TREATMENT_STEP',
      stepId,
      `Schritt aktualisiert: ${step.description}`,
      ipAddress
    );
    
    res.status(200).json({
      message: 'Schritt erfolgreich aktualisiert',
      step: updatedStep
    });
  } catch (error) {
    console.error('Update step error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Delete a treatment step
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    
    // Find step by ID (this also gives us the plan ID)
    const step = await TreatmentPlanModel.findStepById(stepId);
    
    if (!step) {
      return res.status(404).json({ 
        message: 'Behandlungsschritt nicht gefunden'
      });
    }
    
    // Find treatment plan
    const treatmentPlan = await TreatmentPlanModel.findById(step.treatmentPlanId);
    
    // Find the associated session
    const session = await SessionModel.findById(treatmentPlan.sessionId);
    
    // Check if user has permission to delete steps
    if ((req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id) && 
        session.status !== 'COMPLETED' && 
        session.status !== 'CANCELLED') {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Sie können keine Behandlungsschritte löschen, die nicht von Ihnen erstellt wurden.'
      });
    }
    
    // Delete step
    await TreatmentPlanModel.deleteStep(stepId);
    
    // Log step deletion
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'DELETE',
      'TREATMENT_STEP',
      stepId,
      `Schritt gelöscht: ${step.description}`,
      ipAddress
    );
    
    res.status(200).json({
      message: 'Schritt erfolgreich gelöscht'
    });
  } catch (error) {
    console.error('Delete step error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Search treatment plans
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchTreatmentPlans = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;
    
    // Perform the search
    const treatmentPlans = await TreatmentPlanModel.searchTreatmentPlans(
      query || '', 
      userId, 
      { 
        skip, 
        take: parseInt(limit) 
      }
    );
    
    // Count total results for pagination
    const totalMatches = treatmentPlans.length;
    
    res.status(200).json({
      treatmentPlans,
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalMatches,
      totalPages: Math.ceil(totalMatches / parseInt(limit))
    });
  } catch (error) {
    console.error('Search treatment plans error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Get treatment plans by doctor ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTreatmentPlansByDoctor = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;
    
    // Get all treatment plans for the doctor
    const treatmentPlans = await TreatmentPlanModel.findByDoctorId(
      userId, 
      { 
        skip, 
        take: parseInt(limit) 
      }
    );
    
    res.status(200).json({
      treatmentPlans,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get treatment plans by doctor error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

module.exports = {
  createTreatmentPlan,
  getTreatmentPlanBySessionId,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  addStep,
  updateStep,
  deleteStep,
  searchTreatmentPlans,
  getTreatmentPlansByDoctor
}; 