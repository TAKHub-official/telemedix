// Session controller
const { SessionModel, NotificationModel, AuditLogModel } = require('../models');
const { emitSessionUpdate, emitNotification } = require('../index');

/**
 * Get all sessions with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllSessions = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let processedStatus = status;
    
    // Process status parameter - handle comma-separated values
    if (status && typeof status === 'string' && status.includes(',')) {
      processedStatus = status.split(',');
    }
    
    let sessions;
    
    // Apply filters based on user role
    if (req.user.role === 'DOCTOR') {
      // For doctors: show both assigned sessions AND open sessions
      sessions = await SessionModel.findAllForDoctor(req.user.id, {
        status: processedStatus ? 
          // Handle both array and string values for status
          (Array.isArray(processedStatus) ? processedStatus.map(s => s.toUpperCase()) : processedStatus.toUpperCase()) 
          : undefined,
        priority: priority ? priority.toUpperCase() : undefined,
        skip,
        take: parseInt(limit)
      });
    } else if (req.user.role === 'MEDIC') {
      // For medics: only show sessions created by them
      sessions = await SessionModel.findAll({
        status: processedStatus ? 
          // Handle both array and string values for status
          (Array.isArray(processedStatus) ? processedStatus.map(s => s.toUpperCase()) : processedStatus.toUpperCase()) 
          : undefined,
        priority: priority ? priority.toUpperCase() : undefined,
        createdById: req.user.id,
        skip,
        take: parseInt(limit)
      });
    } else {
      // For admin or other roles: show all sessions with optional filters
      sessions = await SessionModel.findAll({
        status: processedStatus ? 
          // Handle both array and string values for status
          (Array.isArray(processedStatus) ? processedStatus.map(s => s.toUpperCase()) : processedStatus.toUpperCase()) 
          : undefined,
        priority: priority ? priority.toUpperCase() : undefined,
        skip,
        take: parseInt(limit)
      });
    }
    
    res.status(200).json({
      sessions,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Get a session by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the session exists
    const session = await SessionModel.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user has permission to access this session
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Admin can access any session
    if (userRole === 'ADMIN') {
      return res.status(200).json({ session });
    }
    
    // Medic can access sessions they created
    if (userRole === 'MEDIC' && session.createdById === userId) {
      return res.status(200).json({ session });
    }
    
    // Doctor can access sessions assigned to them or with status OPEN
    if (userRole === 'DOCTOR' && (session.assignedToId === userId || session.status === 'OPEN')) {
      return res.status(200).json({ session });
    }
    
    // Patient can access sessions they are the patient for
    if (userRole === 'PATIENT' && session.patientId === userId) {
      return res.status(200).json({ session });
    }
    
    // If none of the above conditions are met, deny access
    return res.status(403).json({ message: 'You do not have permission to access this session' });
  } catch (error) {
    console.error('Error in getSessionById:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new session (medic only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSession = async (req, res) => {
  try {
    const { title, patientCode, priority, medicalRecord } = req.body;
    
    // Validate input - only title is required now since patientCode is auto-generated
    if (!title) {
      return res.status(400).json({ 
        message: 'Ein Titel ist erforderlich'
      });
    }
    
    // Create session data
    const sessionData = {
      title,
      patientCode,
      status: 'OPEN',
      priority: priority ? priority.toUpperCase() : 'NORMAL',
      createdById: req.user.id
    };
    
    // Create session
    const session = await SessionModel.create(sessionData);
    
    // Add medical record if provided
    if (medicalRecord) {
      // Parse the patientHistory if it's a string
      if (medicalRecord.patientHistory && typeof medicalRecord.patientHistory === 'string') {
        try {
          const patientHistory = JSON.parse(medicalRecord.patientHistory);
          
          // If we have patientHistory, let's use the provided age rather than a random one
          await SessionModel.addMedicalRecord(session.id, medicalRecord);
        } catch (e) {
          console.error('Error parsing patientHistory:', e);
          // If parsing fails, add the medical record as is
          await SessionModel.addMedicalRecord(session.id, medicalRecord);
        }
      } else {
        await SessionModel.addMedicalRecord(session.id, medicalRecord);
      }
    } else {
      // Create a default medical record with the patient's age from the form
      // The age is sent in the patientHistory JSON by the frontend
      // Extract age and gender from the form data if available, otherwise use defaults
      const patientAge = medicalRecord?.patientHistory?.age || '45'; // Default to 45
      const patientGender = medicalRecord?.patientHistory?.gender || 'Männlich'; // Default to male
      
      const defaultMedicalRecord = {
        patientHistory: JSON.stringify({
          personalInfo: {
            fullName: title.includes('Patient') ? title : title,
            age: patientAge,
            gender: patientGender
          },
          symptoms: ['Kopfschmerzen', 'Fieber', 'Müdigkeit'],
          onset: '2 Tage',
          description: 'Patient berichtet über zunehmende Symptome in den letzten Tagen.'
        }),
        allergies: 'Keine bekannten Allergien',
        currentMedications: 'Ibuprofen bei Bedarf'
      };
      
      await SessionModel.addMedicalRecord(session.id, defaultMedicalRecord);
      
      // Add some default vital signs
      const vitalSigns = [
        { type: 'HEART_RATE', value: '78', unit: 'bpm' },
        { type: 'BLOOD_PRESSURE', value: '120/80', unit: 'mmHg' },
        { type: 'TEMPERATURE', value: '37.2', unit: '°C' },
        { type: 'OXYGEN_SATURATION', value: '98', unit: '%' }
      ];
      
      for (const vitalSign of vitalSigns) {
        await SessionModel.addVitalSign(session.id, vitalSign);
      }
    }
    
    // Log session creation
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'CREATE',
      'SESSION',
      session.id,
      `Session erstellt: ${session.title}`,
      ipAddress
    );
    
    // Notify doctors about new session
    // This would typically query for all doctors and notify them
    // For now, we'll just log it
    console.log(`New session created: ${session.title}. Doctors would be notified here.`);
    
    res.status(201).json({
      message: 'Session erfolgreich erstellt',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Update a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priority, status, completionReason, completionNote } = req.body;
    
    // Find session by ID
    const session = await SessionModel.findById(id);
    
    if (!session) {
      return res.status(404).json({ 
        message: 'Session nicht gefunden'
      });
    }
    
    // Check if user has access to update this session
    let hasAccess = false;
    
    if (req.user.role === 'ADMIN') {
      // Admins always have access
      hasAccess = true;
    } else if (req.user.role === 'DOCTOR') {
      // Doctors can update their assigned sessions
      if (session.assignedToId === req.user.id) {
        hasAccess = true;
      }
    } else if (req.user.role === 'MEDIC') {
      // Medics can update sessions they created
      if (session.createdById === req.user.id) {
        hasAccess = true;
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ 
        message: 'Zugriff verweigert. Sie haben keine Berechtigung, diese Session zu aktualisieren.'
      });
    }
    
    // Build update data
    const updateData = {};
    if (title) updateData.title = title;
    if (priority) updateData.priority = priority.toUpperCase();
    
    // Handle status changes with proper validation
    if (status) {
      // Only doctors and admins can change status
      if (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN') {
        // Make sure the status change is valid
        if (status.toUpperCase() === 'IN_PROGRESS' && session.status === 'ASSIGNED') {
          // Valid progression: ASSIGNED -> IN_PROGRESS
          updateData.status = 'IN_PROGRESS';
        } else if (status.toUpperCase() === 'COMPLETED' && (session.status === 'IN_PROGRESS' || session.status === 'ASSIGNED')) {
          // Valid progression: ASSIGNED/IN_PROGRESS -> COMPLETED
          updateData.status = 'COMPLETED';
          updateData.completedAt = new Date();
          
          // Store completion reason and note if provided
          if (completionReason) {
            updateData.completionReason = completionReason;
          }
          
          if (completionNote) {
            updateData.completionNote = completionNote;
          }
        } else {
          // General case
          updateData.status = status.toUpperCase();
        }
      }
    }
    
    // If there are no updates, return the current session
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        message: 'Keine Änderungen vorgenommen',
        session
      });
    }
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    // Update session
    const updatedSession = await SessionModel.update(id, updateData);
    
    // Log session update
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'UPDATE',
      'SESSION',
      id,
      `Session aktualisiert: ${updatedSession.title}`,
      ipAddress
    );
    
    // Emit session update via socket.io
    emitSessionUpdate(id, {
      type: 'STATUS_CHANGE',
      session: updatedSession
    });
    
    // If status has changed, notify the medic
    if (status && session.createdById && status !== session.status) {
      try {
        // Create notification record
        await NotificationModel.create({
          userId: session.createdById,
          type: 'SESSION_STATUS',
          title: 'Session Status Aktualisiert',
          message: `Die Session "${updatedSession.title}" wurde auf "${status.toUpperCase()}" gesetzt.`,
          read: false,
          relatedId: id
        });
        
        // Send real-time notification to the medic
        emitNotification(session.createdById, {
          title: 'Session Status Aktualisiert',
          content: `Die Session "${updatedSession.title}" wurde auf "${status.toUpperCase()}" gesetzt.`,
          type: 'SESSION_STATUS',
          relatedId: id
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue execution even if notification creation fails
      }
    }
    
    res.status(200).json({
      message: 'Session erfolgreich aktualisiert',
      session: updatedSession
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Assign a session to a doctor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignSession = async (req, res) => {
  try {
    const { id } = req.params;
    let { doctorId } = req.body;
    
    // Use current user's ID as doctorId if not provided and user is a doctor
    if (!doctorId && req.user.role === 'DOCTOR') {
      doctorId = req.user.id;
    }
    
    if (!doctorId) {
      return res.status(400).json({ 
        message: 'Arzt-ID ist erforderlich'
      });
    }
    
    // Find session by ID
    const session = await SessionModel.findById(id);
    
    if (!session) {
      return res.status(404).json({ 
        message: 'Session nicht gefunden'
      });
    }
    
    // Assign session to doctor
    const updatedSession = await SessionModel.assignToDoctor(id, doctorId);
    
    // Log session assignment
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'UPDATE',
      'SESSION',
      id,
      `Session zugewiesen an Arzt ID: ${doctorId}`,
      ipAddress
    );
    
    // Notify the doctor about the assignment
    try {
      await NotificationModel.createSessionNotification(doctorId, updatedSession);
    } catch (err) {
      console.error('Error creating notification:', err);
      // Continue execution even if notification creation fails
    }
    
    // Emit update via websocket
    try {
      emitSessionUpdate(id, {
        type: 'STATUS_CHANGE',
        session: updatedSession
      });
    } catch (err) {
      console.error('Error emitting session update:', err);
      // Continue execution even if socket emission fails
    }
    
    res.status(200).json({
      message: 'Session erfolgreich zugewiesen',
      session: updatedSession
    });
  } catch (error) {
    console.error('Assign session error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Add a vital sign to a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addVitalSign = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, unit } = req.body;
    
    // Validate input
    if (!type || value === undefined || !unit) {
      return res.status(400).json({ 
        message: 'Typ, Wert und Einheit sind erforderlich'
      });
    }
    
    // Find session by ID
    const session = await SessionModel.findById(id);
    
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
    
    // Add vital sign
    const vitalSign = await SessionModel.addVitalSign(id, {
      type: type.toUpperCase(),
      value: String(value), // Ensure value is a string for Prisma
      unit
    });
    
    // Log vital sign addition
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'CREATE',
      'VITAL_SIGN',
      vitalSign.id,
      `Vitalwert hinzugefügt: ${type} ${value} ${unit}`,
      ipAddress
    );
    
    res.status(201).json({
      message: 'Vitalwert erfolgreich hinzugefügt',
      vitalSign
    });
  } catch (error) {
    console.error('Add vital sign error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Add a note to a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Validate input
    if (!content) {
      return res.status(400).json({ 
        message: 'Inhalt ist erforderlich'
      });
    }
    
    // Find session by ID
    const session = await SessionModel.findById(id);
    
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
    
    // Add note
    const note = await SessionModel.addNote(id, content);
    
    // Log note addition
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'CREATE',
      'NOTE',
      note.id,
      `Notiz hinzugefügt zur Session: ${session.title}`,
      ipAddress
    );
    
    res.status(201).json({
      message: 'Notiz erfolgreich hinzugefügt',
      note
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Delete a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if session exists
    const session = await SessionModel.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Delete the session
    await SessionModel.delete(id);
    
    // Create audit log
    await AuditLogModel.create({
      action: 'DELETE_SESSION',
      entity: 'SESSION',
      entityId: id,
      userId: req.user.id,
      metadata: {
        sessionId: id
      }
    });
    
    // Emit event for real-time updates
    emitSessionUpdate({
      action: 'DELETE',
      session: { id }
    });
    
    return res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSession:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Mark a session as completed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { summary } = req.body;
    
    // Check if session exists
    const session = await SessionModel.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user is authorized to complete this session
    const userId = req.user.id;
    if (session.assignedToId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You are not authorized to complete this session' });
    }
    
    // Update session status and add completion details
    const updatedSession = await SessionModel.update(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
      completedById: userId,
      summary: summary || ''
    });
    
    // Create audit log
    await AuditLogModel.create({
      action: 'COMPLETE_SESSION',
      entity: 'SESSION',
      entityId: id,
      userId: req.user.id,
      metadata: {
        sessionId: id,
        summary: summary || ''
      }
    });
    
    // Create notification for patient
    if (session.patientId) {
      await NotificationModel.create({
        type: 'SESSION_COMPLETED',
        userId: session.patientId,
        title: 'Session Completed',
        message: 'Your session has been marked as completed',
        metadata: {
          sessionId: id
        }
      });
      
      // Emit notification in real-time
      emitNotification(session.patientId, {
        type: 'SESSION_COMPLETED',
        title: 'Session Completed',
        message: 'Your session has been marked as completed',
        metadata: {
          sessionId: id
        }
      });
    }
    
    // Emit event for real-time updates
    emitSessionUpdate({
      action: 'UPDATE',
      session: updatedSession
    });
    
    return res.status(200).json({
      message: 'Session marked as completed',
      session: updatedSession
    });
  } catch (error) {
    console.error('Error in completeSession:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  assignSession,
  addVitalSign,
  addNote,
  deleteSession,
  completeSession
}; 