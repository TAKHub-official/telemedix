const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  completeSession,
  addVitalSign,
  addNote,
  assignSession
} = require('../controllers/session');
const {
  assignTreatmentTemplate,
  getSessionTreatmentTemplate,
  updateSessionTreatmentTemplate,
  removeSessionTreatmentTemplate,
  evaluateTreatment
} = require('../controllers/sessionTreatmentTemplate');

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/sessions
 * @desc Get all sessions (filtered by role)
 * @access Private
 */
router.get('/', getAllSessions);

/**
 * @route GET /api/sessions/:id
 * @desc Get a session by ID
 * @access Private
 */
router.get('/:id', getSessionById);

/**
 * @route POST /api/sessions
 * @desc Create a new session
 * @access Private (Medic or Admin)
 */
router.post('/', authorize(['MEDIC', 'ADMIN']), createSession);

/**
 * @route PUT /api/sessions/:id
 * @desc Update a session
 * @access Private
 */
router.put('/:id', updateSession);

/**
 * @route DELETE /api/sessions/:id
 * @desc Delete a session
 * @access Private (Admin only)
 */
router.delete('/:id', authorize(['ADMIN']), deleteSession);

/**
 * @route PUT /api/sessions/:id/complete
 * @desc Mark a session as completed
 * @access Private
 */
router.put('/:id/complete', completeSession);

/**
 * @route PUT /api/sessions/:id/assign
 * @desc Assign a session to a doctor
 * @access Private (Doctor or Admin)
 */
router.put('/:id/assign', authorize(['DOCTOR', 'ADMIN']), assignSession);

/**
 * @route POST /api/sessions/:id/vitals
 * @desc Add vital signs to a session
 * @access Private
 */
router.post('/:id/vitals', addVitalSign);

/**
 * @route POST /api/sessions/:id/notes
 * @desc Add notes to a session
 * @access Private
 */
router.post('/:id/notes', addNote);

/**
 * @route POST /api/sessions/:sessionId/treatment-template
 * @desc Assign a treatment template to a session
 * @access Private (Doctor or Admin)
 */
router.post('/:sessionId/treatment-template', authorize(['DOCTOR', 'ADMIN']), assignTreatmentTemplate);

/**
 * @route GET /api/sessions/:sessionId/treatment-template
 * @desc Get the treatment template assigned to a session
 * @access Private
 */
router.get('/:sessionId/treatment-template', getSessionTreatmentTemplate);

/**
 * @route PUT /api/sessions/:sessionId/treatment-template
 * @desc Update the status or current step of a session's treatment template
 * @access Private
 */
router.put('/:sessionId/treatment-template', updateSessionTreatmentTemplate);

/**
 * @route DELETE /api/sessions/:sessionId/treatment-template
 * @desc Remove a treatment template from a session
 * @access Private (Doctor or Admin)
 */
router.delete('/:sessionId/treatment-template', authorize(['DOCTOR', 'ADMIN']), removeSessionTreatmentTemplate);

/**
 * @route POST /api/sessions/:sessionId/treatment-evaluation
 * @desc Submit an evaluation for a completed treatment
 * @access Private (Medic)
 */
router.post('/:sessionId/treatment-evaluation', authorize(['MEDIC']), evaluateTreatment);

module.exports = router; 