// Authentication middleware
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models');

/**
 * Middleware to verify JWT token and authenticate requests
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header, query, or cookies
    const token = 
      req.headers.authorization?.split(' ')[1] || // Bearer TOKEN
      req.query.token ||
      req.cookies?.token;
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required. No token provided.'
      });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.'
      });
    }
    
    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: 'User account is inactive or suspended.'
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired.'
      });
    }
    return res.status(500).json({ 
      message: 'Authentication error. Please try again.'
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    // Check if roles is provided as a string and convert to array
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    // Check if user exists in request (should be set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.'
      });
    }
    
    // Check if user has required role
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions to access this resource.'
      });
    }
    
    // User has required role, continue
    next();
  };
};

module.exports = {
  authenticate,
  authorize
}; 