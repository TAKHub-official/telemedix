// Authentication controller
const jwt = require('jsonwebtoken');
const { UserModel, AuditLogModel } = require('../models');

/**
 * Login user and return JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'E-Mail und Passwort sind erforderlich'
      });
    }
    
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        message: 'Ungültige Anmeldedaten'
      });
    }
    
    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: 'Benutzerkonto ist inaktiv oder gesperrt'
      });
    }
    
    // Check password
    const isPasswordValid = await UserModel.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Ungültige Anmeldedaten'
      });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '1d' }
    );
    
    // Update last login timestamp
    await UserModel.updateLastLogin(user.id);
    
    // Log login
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logAuthEvent(user.id, 'login', ipAddress);
    
    // Return user data without sensitive information
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Anmeldung erfolgreich',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Get current authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMe = async (req, res) => {
  try {
    // User should be available from auth middleware
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentifizierung erforderlich'
      });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user;
    
    res.status(200).json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Aktuelles und neues Passwort sind erforderlich'
      });
    }
    
    // User should be available from auth middleware
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentifizierung erforderlich'
      });
    }
    
    // Get full user with password
    const user = await UserModel.findById(req.user.id);
    
    // Check current password
    const isPasswordValid = await UserModel.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Aktuelles Passwort ist falsch'
      });
    }
    
    // Update password
    await UserModel.update(user.id, { password: newPassword });
    
    // Log password change
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logAuthEvent(user.id, 'password_change', ipAddress);
    
    res.status(200).json({
      message: 'Passwort erfolgreich geändert'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // User should be available from auth middleware
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentifizierung erforderlich'
      });
    }
    
    // Log logout
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await AuditLogModel.logAuthEvent(req.user.id, 'logout', ipAddress);
    
    // In JWT, you can't invalidate tokens on the server side
    // The client should remove the token from its storage
    
    res.status(200).json({
      message: 'Erfolgreich abgemeldet'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
  logout
}; 