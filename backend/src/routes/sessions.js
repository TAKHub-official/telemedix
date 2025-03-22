const express = require('express');
const router = express.Router();
const {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  assignSession,
  addVitalSign,
  addNote
} = require('../controllers/session');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all sessions - accessible to all authenticated users
// but filtered based on role in the controller
router.get('/', getSessions);

// Get single session by ID - accessible to admins, creator, and assigned doctor
router.get('/:id', getSessionById);

// Create session - medics and admins only
router.post('/', authorize(['MEDIC', 'ADMIN']), createSession);

// Update session - accessible to creator, assigned doctor, and admins
router.put('/:id', updateSession);

// Assign session to doctor - admins and doctors can do this
router.put('/:id/assign', authorize(['ADMIN', 'DOCTOR']), assignSession);

// Add vital sign - accessible to creator, assigned doctor, and admins
router.post('/:id/vitals', addVitalSign);

// Add note - accessible to creator, assigned doctor, and admins
router.post('/:id/notes', addNote);

module.exports = router; 