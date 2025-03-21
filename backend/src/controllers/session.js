// Session controller
const { SessionModel, NotificationModel, AuditLogModel } = require('../models');
const { emitSessionUpdate, emitNotification } = require('../index');

/**
 * Get all sessions with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSessions = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Apply filters based on user role
    const filterOptions = {
      status: status ? status.toUpperCase() : undefined,
      priority: priority ? priority.toUpperCase() : undefined,
      skip,
      take: parseInt(limit)
    };
    
    // If user is a doctor, only show sessions assigned to them
    if (req.user.role === 'DOCTOR') {
      filterOptions.assignedToId = req.user.id;
    }
    
    // If user is a medic, only show sessions created by them
    if (req.user.role === 'MEDIC') {
      filterOptions.createdById = req.user.id;
    }
    
    // Find sessions with filters
    const sessions = await SessionModel.findAll(filterOptions);
    
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
 * Get a single session by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    
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
    
    res.status(200).json({
      session
    });
  } catch (error) {
    console.error('Get session by ID error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
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
    
    // Validate input
    if (!title || !patientCode) {
      return res.status(400).json({ 
        message: 'Titel und Patienten-Code sind erforderlich'
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
      await SessionModel.addMedicalRecord(session.id, medicalRecord);
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
    const { title, priority, status } = req.body;
    
    // Find session by ID
    const session = await SessionModel.findById(id);
    
    if (!session) {
      return res.status(404).json({ 
        message: 'Session nicht gefunden'
      });
    }
    
    // Check if user has access to update this session
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
    
    // Build update data
    const updateData = {};
    if (title) updateData.title = title;
    if (priority) updateData.priority = priority.toUpperCase();
    
    // Only doctors can change status
    if (status && (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN')) {
      updateData.status = status.toUpperCase();
    }
    
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
      // Create notification record
      await NotificationModel.create({
        userId: session.createdById,
        title: 'Session Status Aktualisiert',
        content: `Die Session "${updatedSession.title}" wurde auf "${status.toUpperCase()}" gesetzt.`,
        type: 'SESSION_STATUS',
        relatedId: id,
        isRead: false
      });
      
      // Send real-time notification to the medic
      emitNotification(session.createdById, {
        title: 'Session Status Aktualisiert',
        content: `Die Session "${updatedSession.title}" wurde auf "${status.toUpperCase()}" gesetzt.`,
        type: 'SESSION_STATUS',
        relatedId: id
      });
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
    const { doctorId } = req.body;
    
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
    await NotificationModel.createSessionNotification(doctorId, updatedSession);
    
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

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  assignSession,
  addVitalSign,
  addNote
}; 