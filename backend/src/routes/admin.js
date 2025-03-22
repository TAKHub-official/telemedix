const express = require('express');
const router = express.Router();
const { getStats, getDetailedStats, getAuditLogs, resetUserPassword } = require('../controllers/admin');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Stats routes
router.get('/stats', getStats);
router.get('/stats/detailed', getDetailedStats);

// Audit logs route
router.get('/logs', getAuditLogs);

// Password reset route
router.post('/users/:id/reset-password', resetUserPassword);

module.exports = router; 