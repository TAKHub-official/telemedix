/**
 * Re-exports all constants from the constants directory
 * This allows importing multiple constants with a single import statement
 * Example: import { SESSION_CATEGORIES, PRIORITY_OPTIONS } from '../constants';
 */

// Medical emergency categories
export { SESSION_CATEGORIES } from './medicalCategories';

// General form options
export { PRIORITY_OPTIONS } from './formOptions';

// Medical form options and vital signs
export { 
  GENDER_OPTIONS, 
  CONSCIOUSNESS_OPTIONS,
  HEART_RATE_OPTIONS,
  SYSTOLIC_BP_OPTIONS,
  DIASTOLIC_BP_OPTIONS,
  OXYGEN_SATURATION_OPTIONS,
  RESPIRATORY_RATE_OPTIONS,
  TEMPERATURE_OPTIONS,
  BLOOD_GLUCOSE_OPTIONS,
  AGE_OPTIONS
} from './medicalOptions';

// Session completion reasons
export { SESSION_COMPLETION_REASONS } from './sessionOptions'; 