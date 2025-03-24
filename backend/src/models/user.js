// User model for database operations
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

/**
 * User model class for database operations
 */
class UserModel {
  /**
   * Create a new user
   * @param {Object} userData - The user data
   * @returns {Promise<Object>} The created user
   */
  static async create(userData) {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log(`Hashing password for new user ${userData.email}`);
    
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
  }

  /**
   * Find a user by ID
   * @param {string} id - The user ID
   * @returns {Promise<Object>} The user if found
   */
  static async findById(id) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * Find a user by email
   * @param {string} email - The user email
   * @returns {Promise<Object>} The user if found
   */
  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Update a user
   * @param {string} id - The user ID
   * @param {Object} userData - The user data to update
   * @returns {Promise<Object>} The updated user
   */
  static async update(id, userData) {
    // If password is being updated, hash it
    if (userData.password) {
      console.log(`Hashing updated password for user ID: ${id}`);
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    return prisma.user.update({
      where: { id },
      data: userData
    });
  }

  /**
   * Update last login time for a user
   * @param {string} id - The user ID
   * @returns {Promise<Object>} The updated user
   */
  static async updateLastLogin(id) {
    return prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date()
      }
    });
  }

  /**
   * Delete a user
   * @param {string} id - The user ID
   * @returns {Promise<Object>} The deleted user
   */
  static async delete(id) {
    return prisma.user.delete({
      where: { id }
    });
  }

  /**
   * Find all users with optional filtering and pagination
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Array>} List of users
   */
  static async findAll({ role, status, skip = 0, take = 50 } = {}) {
    const where = {};
    
    if (role) where.role = role;
    if (status) where.status = status;
    
    return prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Check if the provided password matches the user's password
   * @param {string} providedPassword - The password to check
   * @param {string} storedPassword - The stored hashed password
   * @returns {Promise<boolean>} True if passwords match
   */
  static async comparePassword(providedPassword, storedPassword) {
    try {
      const result = await bcrypt.compare(providedPassword, storedPassword);
      return result;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }
}

module.exports = UserModel; 