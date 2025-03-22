const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, changeUserRole, updateUserNotifications } = require('../controllers/user');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Routes only accessible to admins
router.get('/', authorize(['ADMIN']), getUsers);
router.post('/', authorize(['ADMIN']), createUser);
router.delete('/:id', authorize(['ADMIN']), deleteUser);
router.put('/:id/role', authorize(['ADMIN']), changeUserRole);

// Update user notification settings - allow doctors to update their own
router.put('/:id/notifications', updateUserNotifications);

// Routes accessible to the user themselves or admins
router.get('/:id', authorize(['ADMIN']), getUserById);
router.put('/:id', authorize(['ADMIN']), updateUser);

module.exports = router; 