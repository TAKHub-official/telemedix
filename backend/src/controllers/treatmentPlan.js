// TreatmentPlan controller
const { TreatmentPlanModel, SessionModel, AuditLogModel } = require('../models');
const prisma = require('../config/prisma');

/**
 * Create a new treatment plan for a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTreatmentPlan = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { diagnosis, steps } = req.body;
    
    // Validate input
    if (!sessionId) {
      return res.status(400).json({ 
        message: 'Session-ID ist erforderlich'
      });
    }
    
    // Find session by ID
    const session = await SessionModel.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        message: 'Session nicht gefunden'
      });
    }
    
    // Check if session already has a treatment plan
    const existingPlan = await TreatmentPlanModel.findBySessionId(sessionId);
    if (existingPlan) {
      return res.status(409).json({ 
        message: 'Diese Session hat bereits einen Behandlungsplan'
      });
    }
    
    // Check if user has access to create a treatment plan for this session
    if (req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Session ist einem anderen Arzt zugewiesen.'
      });
    }
    
    // Create treatment plan
    const treatmentPlanData = {
      sessionId,
      diagnosis: diagnosis || null,
      steps: steps || []
    };
    
    const treatmentPlan = await TreatmentPlanModel.create(treatmentPlanData);
    
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
 * Get a treatment plan by session ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTreatmentPlanBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find session by ID
    const session = await SessionModel.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        message: 'Session nicht gefunden'
      });
    }
    
    // Check if user has access to this session
    if (req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Session ist einem anderen Arzt zugewiesen.'
      });
    }
    
    if (req.user.role === 'MEDIC' && session.createdById !== req.user.id) {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Sie haben diese Session nicht erstellt.'
      });
    }
    
    // Find treatment plan by session ID
    const treatmentPlan = await TreatmentPlanModel.findBySessionId(sessionId);
    
    if (!treatmentPlan) {
      return res.status(404).json({ 
        message: 'Behandlungsplan nicht gefunden'
      });
    }
    
    res.status(200).json({
      treatmentPlan
    });
  } catch (error) {
    console.error('Get treatment plan error:', error);
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
    if (req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id) {
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
    
    // Check if user has access to delete this treatment plan
    if (req.user.role !== 'ADMIN' && 
       (req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id)) {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Sie haben keine Berechtigung, diesen Behandlungsplan zu löschen.'
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
    const { description } = req.body;
    
    // Validate input
    if (!description) {
      return res.status(400).json({ 
        message: 'Beschreibung ist erforderlich'
      });
    }
    
    // Find treatment plan by ID
    const treatmentPlan = await TreatmentPlanModel.findById(planId);
    
    if (!treatmentPlan) {
      return res.status(404).json({ 
        message: 'Behandlungsplan nicht gefunden'
      });
    }
    
    // Find the associated session
    const session = await SessionModel.findById(treatmentPlan.sessionId);
    
    // Check if user has access to add steps to this treatment plan
    if (req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Session ist einem anderen Arzt zugewiesen.'
      });
    }
    
    // Add step to treatment plan
    const step = await TreatmentPlanModel.addStep(planId, {
      description,
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
    const { description, status, notes } = req.body;
    
    // Get step first to get the treatment plan ID
    const step = await prisma.treatmentStep.findUnique({
      where: { id: stepId },
      include: { treatmentPlan: true }
    });
    
    if (!step) {
      return res.status(404).json({ 
        message: 'Schritt nicht gefunden'
      });
    }
    
    // Get the treatment plan
    const treatmentPlan = await TreatmentPlanModel.findById(step.treatmentPlanId);
    
    // Find the associated session
    const session = await SessionModel.findById(treatmentPlan.sessionId);
    
    // Check if user has access to update this step
    if (req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Session ist einem anderen Arzt zugewiesen.'
      });
    }
    
    // Build update data
    const updateData = {};
    
    // For now, allow all users to modify description until status is implemented
    if (description) {
      updateData.description = description;
    }
    
    // For now, allow all users to update status
    if (status) {
      updateData.status = status.toUpperCase();
      if (status.toUpperCase() === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    
    // Both doctors and medics can add notes
    if (notes !== undefined) {
      updateData.notes = notes;
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
    
    // Get step first to get the treatment plan ID
    const step = await prisma.treatmentStep.findUnique({
      where: { id: stepId },
      include: { treatmentPlan: true }
    });
    
    if (!step) {
      return res.status(404).json({ 
        message: 'Schritt nicht gefunden'
      });
    }
    
    // Get the treatment plan
    const treatmentPlan = await TreatmentPlanModel.findById(step.treatmentPlanId);
    
    // Find the associated session
    const session = await SessionModel.findById(treatmentPlan.sessionId);
    
    // Check if user has access to delete this step
    if (req.user.role !== 'ADMIN' && 
       (req.user.role === 'DOCTOR' && session.assignedToId !== req.user.id)) {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Sie haben keine Berechtigung, diesen Schritt zu löschen.'
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

module.exports = {
  createTreatmentPlan,
  getTreatmentPlanBySessionId,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  addStep,
  updateStep,
  deleteStep
}; 