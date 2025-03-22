// User controller
const { UserModel, AuditLogModel } = require('../models');

/**
 * Get all users with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find users with filters
    const users = await UserModel.findAll({
      role: role ? role.toUpperCase() : undefined,
      status: status ? status.toUpperCase() : undefined,
      skip,
      take: parseInt(limit)
    });
    
    // Return users without passwords
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json({
      users: usersWithoutPasswords,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Get a single user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by ID
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Benutzer nicht gefunden'
      });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Create a new user (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ 
        message: 'Alle Felder sind erforderlich: E-Mail, Passwort, Vorname, Nachname, Rolle'
      });
    }
    
    // Check if email is already in use
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'E-Mail wird bereits verwendet'
      });
    }
    
    // Create user
    const newUser = await UserModel.create({
      email,
      password,
      firstName,
      lastName,
      role: role.toUpperCase(),
      status: 'ACTIVE'
    });
    
    // Log user creation
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'CREATE',
      'USER',
      newUser.id,
      `Benutzer erstellt: ${newUser.firstName} ${newUser.lastName} (${newUser.email})`,
      ipAddress
    );
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'Benutzer erfolgreich erstellt',
      user: userWithoutPassword
    });
    
    // TODO: Send welcome email with initial password
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Update a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, status, password, email } = req.body;
    
    // Find user by ID
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Benutzer nicht gefunden'
      });
    }
    
    // Check if admin is trying to modify another admin
    if (user.role === 'ADMIN' && req.user.id !== id && req.user.role === 'ADMIN') {
      return res.status(403).json({ 
        message: 'Administratoren können nur von sich selbst bearbeitet werden'
      });
    }
    
    // Build update data
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) updateData.password = password;
    if (email) updateData.email = email;
    
    // Handle profile image if uploaded
    if (req.file) {
      // Get the path to the uploaded file
      const profileImageUrl = `/uploads/profile-images/${req.file.filename}`;
      updateData.profileImageUrl = profileImageUrl;
    }
    
    // Only admins can change roles and status
    if (req.user.role === 'ADMIN') {
      if (role) updateData.role = role.toUpperCase();
      if (status) updateData.status = status.toUpperCase();
    }
    
    // Update user
    const updatedUser = await UserModel.update(id, updateData);
    
    // Log user update
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'UPDATE',
      'USER',
      id,
      `Benutzer aktualisiert: ${updatedUser.firstName} ${updatedUser.lastName}`,
      ipAddress
    );
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      message: 'Benutzer erfolgreich aktualisiert',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Change user role (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!role || !['ADMIN', 'DOCTOR', 'MEDIC'].includes(role.toUpperCase())) {
      return res.status(400).json({ 
        message: 'Gültige Rolle erforderlich (ADMIN, DOCTOR, MEDIC)'
      });
    }
    
    // Find user by ID
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Benutzer nicht gefunden'
      });
    }
    
    // Prevent changing role of an admin user unless you are that admin
    if (user.role === 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ 
        message: 'Administratorrechte können nur vom Benutzer selbst geändert werden'
      });
    }
    
    // Update user role
    const updatedUser = await UserModel.update(id, {
      role: role.toUpperCase()
    });
    
    // Log role change
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'UPDATE',
      'USER',
      id,
      `Benutzerrolle geändert: ${user.role} → ${role.toUpperCase()}`,
      ipAddress
    );
    
    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      message: 'Benutzerrolle erfolgreich geändert',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Delete a user (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by ID
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Benutzer nicht gefunden'
      });
    }
    
    // Check if trying to delete an admin
    if (user.role === 'ADMIN') {
      return res.status(403).json({ 
        message: 'Administratoren können nicht gelöscht werden'
      });
    }
    
    // Delete user
    await UserModel.delete(id);
    
    // Log user deletion
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'DELETE',
      'USER',
      id,
      `Benutzer gelöscht: ${user.firstName} ${user.lastName} (${user.email})`,
      ipAddress
    );
    
    res.status(200).json({
      message: 'Benutzer erfolgreich gelöscht'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Update user notification settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailNotificationsEnabled, telegramNotificationsEnabled, email, telegramUsername } = req.body;
    
    // Find user by ID
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Benutzer nicht gefunden'
      });
    }
    
    // Only allow users to update their own notification settings or admins
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Sie können nur Ihre eigenen Benachrichtigungseinstellungen aktualisieren'
      });
    }
    
    // Build update data
    const updateData = {
      emailNotificationsEnabled,
      telegramNotificationsEnabled,
    };
    
    // Only update email if it's provided
    if (email) {
      updateData.notificationEmail = email;
    }
    
    // Only update telegram username if it's provided
    if (telegramUsername) {
      updateData.telegramUsername = telegramUsername;
    }
    
    // Update user notification settings
    const updatedUser = await UserModel.update(id, updateData);
    
    // Log notification settings update
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logDataEvent(
      req.user.id,
      'UPDATE',
      'USER',
      id,
      `Benachrichtigungseinstellungen aktualisiert für: ${updatedUser.firstName} ${updatedUser.lastName}`,
      ipAddress
    );
    
    // Return success with updated user data
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      message: 'Benachrichtigungseinstellungen erfolgreich aktualisiert',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user notification settings error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserRole,
  deleteUser,
  updateUserNotifications
}; 