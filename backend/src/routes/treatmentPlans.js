const express = require('express');
const router = express.Router();
const {
  createTreatmentPlan,
  getTreatmentPlanBySessionId,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  addStep,
  updateStep,
  deleteStep,
  searchTreatmentPlans,
  getTreatmentPlansByDoctor
} = require('../controllers/treatmentPlan');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Search treatment plans (doctors only)
router.get('/search', authorize(['DOCTOR', 'ADMIN']), searchTreatmentPlans);

// Get all treatment plans for a doctor
router.get('/doctor', authorize(['DOCTOR', 'ADMIN']), getTreatmentPlansByDoctor);

// Create a treatment plan for a session (doctors only)
router.post('/sessions/:sessionId', authorize(['DOCTOR', 'ADMIN']), createTreatmentPlan);

// Get a treatment plan by session ID
router.get('/sessions/:sessionId', getTreatmentPlanBySessionId);

// Update a treatment plan
router.put('/:planId', authorize(['DOCTOR', 'ADMIN']), updateTreatmentPlan);

// Delete a treatment plan (doctors and admins only)
router.delete('/:planId', authorize(['DOCTOR', 'ADMIN']), deleteTreatmentPlan);

// Add a step to a treatment plan (doctors only)
router.post('/:planId/steps', authorize(['DOCTOR', 'ADMIN']), addStep);

// Update a step - both doctors and medics, but with different permissions
router.put('/steps/:stepId', updateStep);

// Delete a step from a treatment plan (doctors only)
router.delete('/steps/:stepId', authorize(['DOCTOR', 'ADMIN']), deleteStep);

module.exports = router; 