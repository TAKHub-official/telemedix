const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  favoriteTemplate,
  unfavoriteTemplate
} = require('../controllers/treatmentTemplate');

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/treatment-templates
 * @desc Get all treatment templates (all public templates + user's private templates)
 * @access Private (Doctor)
 */
router.get('/', authorize(['DOCTOR']), getAllTemplates);

/**
 * @route GET /api/treatment-templates/:id
 * @desc Get a treatment template by ID
 * @access Private (Doctor)
 */
router.get('/:id', authorize(['DOCTOR']), getTemplateById);

/**
 * @route POST /api/treatment-templates
 * @desc Create a new treatment template
 * @access Private (Doctor)
 */
router.post('/', authorize(['DOCTOR']), createTemplate);

/**
 * @route PUT /api/treatment-templates/:id
 * @desc Update a treatment template (only creator can update)
 * @access Private (Doctor)
 */
router.put('/:id', authorize(['DOCTOR']), updateTemplate);

/**
 * @route DELETE /api/treatment-templates/:id
 * @desc Delete a treatment template (only creator can delete)
 * @access Private (Doctor)
 */
router.delete('/:id', authorize(['DOCTOR']), deleteTemplate);

/**
 * @route POST /api/treatment-templates/:id/favorite
 * @desc Mark a treatment template as favorite
 * @access Private (Doctor)
 */
router.post('/:id/favorite', authorize(['DOCTOR']), favoriteTemplate);

/**
 * @route DELETE /api/treatment-templates/:id/favorite
 * @desc Remove a treatment template from favorites
 * @access Private (Doctor)
 */
router.delete('/:id/favorite', authorize(['DOCTOR']), unfavoriteTemplate);

module.exports = router; 