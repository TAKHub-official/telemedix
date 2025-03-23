/**
 * Configuration constants for the application
 */

// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Session refresh interval (in milliseconds)
export const SESSION_REFRESH_INTERVAL = 30000; // 30 seconds

// Notification refresh interval (in milliseconds)
export const NOTIFICATION_REFRESH_INTERVAL = 60000; // 1 minute 