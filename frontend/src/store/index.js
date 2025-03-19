import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// We'll create these slices later
// import sessionReducer from './slices/sessionSlice';
// import userReducer from './slices/userSlice';
// import treatmentReducer from './slices/treatmentSlice';

// Create a safe wrapper for store initialization
function createSafeStore() {
  try {
    return configureStore({
      reducer: {
        auth: authReducer,
        // Uncomment these as we create the slices
        // sessions: sessionReducer,
        // users: userReducer,
        // treatments: treatmentReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });
  } catch (error) {
    console.error('Failed to initialize Redux store:', error);
    
    // Return a minimal working store
    return configureStore({
      reducer: {
        auth: (state = { isAuthenticated: false, loading: false, error: null }, action) => state,
      }
    });
  }
}

export const store = createSafeStore(); 