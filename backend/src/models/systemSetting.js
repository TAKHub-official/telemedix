// SystemSetting model for database operations
const prisma = require('../config/prisma');

/**
 * SystemSetting model class for database operations
 */
class SystemSettingModel {
  /**
   * Get a system setting by key
   * @param {string} key - The setting key
   * @returns {Promise<Object>} The setting if found
   */
  static async get(key) {
    return prisma.systemSetting.findUnique({
      where: { key }
    });
  }

  /**
   * Get multiple system settings by keys
   * @param {Array<string>} keys - Array of setting keys
   * @returns {Promise<Array>} List of settings found
   */
  static async getMultiple(keys) {
    return prisma.systemSetting.findMany({
      where: {
        key: {
          in: keys
        }
      }
    });
  }

  /**
   * Get all system settings
   * @returns {Promise<Array>} List of all settings
   */
  static async getAll() {
    return prisma.systemSetting.findMany({
      orderBy: {
        key: 'asc'
      }
    });
  }

  /**
   * Set a system setting (create or update)
   * @param {string} key - The setting key
   * @param {string} value - The setting value
   * @param {string} description - Optional description
   * @returns {Promise<Object>} The created or updated setting
   */
  static async set(key, value, description = null) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        description: description !== null ? description : undefined
      },
      create: {
        key,
        value,
        description
      }
    });
  }

  /**
   * Delete a system setting
   * @param {string} key - The setting key
   * @returns {Promise<Object>} The deleted setting
   */
  static async delete(key) {
    return prisma.systemSetting.delete({
      where: { key }
    });
  }

  /**
   * Get a value with a default fallback if not found
   * @param {string} key - The setting key
   * @param {string} defaultValue - Default value to return if setting not found
   * @returns {Promise<string>} The setting value or default
   */
  static async getValue(key, defaultValue = '') {
    const setting = await this.get(key);
    return setting ? setting.value : defaultValue;
  }

  /**
   * Set multiple system settings at once
   * @param {Object} settings - Object with key-value pairs
   * @returns {Promise<Array>} The updated settings
   */
  static async setMultiple(settings) {
    const operations = Object.entries(settings).map(([key, value]) => {
      return this.set(key, value);
    });
    
    return Promise.all(operations);
  }
}

module.exports = SystemSettingModel; 