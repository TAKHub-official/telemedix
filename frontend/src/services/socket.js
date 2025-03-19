import { io } from 'socket.io-client';

// Reference to the socket instance
let socket;

/**
 * Initialize the Socket.IO connection
 * @param {string} token - JWT token for authentication
 * @param {string} userId - User ID for joining personal room
 */
export const initSocket = (token, userId) => {
  try {
    // Initialize the socket connection
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000', {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Add a timeout to prevent long-hanging connections
      timeout: 10000
    });

    // Socket connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      
      // Join user's personal room for notifications
      if (userId) {
        socket.emit('join', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    // Return a dummy socket object to prevent null references
    return {
      on: () => {},
      emit: () => {},
      disconnect: () => {}
    };
  }
};

/**
 * Get the current socket instance
 * @returns {Object} Socket.IO instance
 */
export const getSocket = () => {
  if (!socket) {
    console.warn('Socket.IO not initialized. Some real-time features may not work.');
    // Return a dummy socket object that won't throw errors
    return {
      on: () => () => {}, // Return a no-op cleanup function
      emit: () => {},
      disconnect: () => {}
    };
  }
  return socket;
};

/**
 * Join a session room for real-time updates
 * @param {string} sessionId - ID of the session to join
 */
export const joinSessionRoom = (sessionId) => {
  if (!socket) {
    console.warn('Socket.IO not initialized. Unable to join session room.');
    return;
  }
  
  socket.emit('joinSession', sessionId);
};

/**
 * Leave a session room
 * @param {string} sessionId - ID of the session to leave
 */
export const leaveSessionRoom = (sessionId) => {
  if (!socket) {
    console.warn('Socket.IO not initialized. Unable to leave session room.');
    return;
  }
  
  socket.emit('leaveSession', sessionId);
};

/**
 * Add a listener for session updates
 * @param {Function} callback - Function to call when a session update is received
 */
export const onSessionUpdate = (callback) => {
  if (!socket) {
    console.warn('Socket.IO not initialized. Session updates will not be received.');
    return () => {}; // Return a no-op cleanup function
  }
  
  socket.on('sessionUpdate', callback);
  
  // Return cleanup function
  return () => {
    socket.off('sessionUpdate', callback);
  };
};

/**
 * Add a listener for notifications
 * @param {Function} callback - Function to call when a notification is received
 */
export const onNotification = (callback) => {
  if (!socket) {
    console.warn('Socket.IO not initialized. Notifications will not be received.');
    return () => {}; // Return a no-op cleanup function
  }
  
  socket.on('notification', callback);
  
  // Return cleanup function
  return () => {
    socket.off('notification', callback);
  };
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 