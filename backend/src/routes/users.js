const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, changeUserRole, updateUserNotifications } = require('../controllers/user');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure storage for profile images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/profile-images/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.params.id}-${uniqueSuffix}${ext}`);
  }
});

// Filter function to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(authenticate);

// Get all users - Admin only
router.get('/', authorize(['ADMIN']), getUsers);

// Get user by ID - Admin or self
router.get('/:id', getUserById);

// Update user notification settings - allow users to update their own
router.put('/:id/notifications', updateUserNotifications);

// Change user role - Admin only
router.put('/:id/role', authorize(['ADMIN']), changeUserRole);

// Update user - Admin or self
router.put('/:id', upload.single('profileImage'), (req, res, next) => {
  // Allow users to update their own profile
  if (req.user.id === req.params.id || req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Sie können nur Ihr eigenes Profil bearbeiten' });
}, updateUser);

// Delete user - Admin only
router.delete('/:id', authorize(['ADMIN']), deleteUser);

// Create user - Admin only
router.post('/', authorize(['ADMIN']), createUser);

module.exports = router; 