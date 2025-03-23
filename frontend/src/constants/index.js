/**
 * Re-exports all constants from the constants directory
 * This allows importing multiple constants with a single import statement
 * Example: import { SESSION_CATEGORIES, PRIORITY_OPTIONS } from '../constants';
 */

// Export various constants from different modules
export * from './sessionOptions';
export * from './medicalOptions';
export * from './formOptions';
export * from './medicalCategories';
export * from './config';

// Constants that don't warrant their own file can go here

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  MEDIC: 'MEDIC'
};

// Session status options
export const SESSION_STATUS = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// Color mappings for priority levels
export const PRIORITY_COLORS = {
  LOW: 'success',
  NORMAL: 'info',
  HIGH: 'warning',
  URGENT: 'error'
}; 