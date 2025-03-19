import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { initSocket, disconnectSocket } from '../../services/socket';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('Attempting to log in with:', { email });
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      // Store token in localStorage for persistent login
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Initialize socket connection
      try {
        initSocket(response.data.token, response.data.user.id);
      } catch (socketError) {
        console.error('Socket initialization error:', socketError);
        // Continue even if socket fails
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      return rejectWithValue(
        error.response?.data?.message || 
        'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Try to call logout API (might fail if token is invalid)
      try {
        await authAPI.logout();
      } catch (e) {
        console.warn('Logout API call failed:', e);
      }
      
      // Always clean up local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Disconnect socket
      disconnectSocket();
      
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Fehler beim Abmelden.'
      );
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Fehler beim Laden des Benutzerprofils.'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Fehler beim Ändern des Passworts.'
      );
    }
  }
);

// Check if user is already logged in from localStorage
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // Clear validation - must have both token and valid user object
    if (!token || !userStr) {
      console.log('No valid auth session found in localStorage');
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        passwordChanged: false
      };
    }
    
    try {
      // Verify user data can be parsed
      const userData = JSON.parse(userStr);
      
      // Basic validation checks
      if (!userData || !userData.id || !userData.email || !userData.role) {
        console.error('Invalid user data in localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return {
          user: null,
          token: null,
          isAuthenticated: false, 
          loading: false,
          error: null,
          passwordChanged: false
        };
      }
      
      // Valid session, initialize socket
      try {
        initSocket(token, userData.id);
      } catch (socketError) {
        console.error('Socket initialization error:', socketError);
        // Continue even if socket fails
      }
      
      // Return authenticated state
      return {
        user: userData,
        token: token,
        isAuthenticated: true,
        loading: false,
        error: null,
        passwordChanged: false
      };
      
    } catch (parseError) {
      console.error('Error parsing user data from localStorage:', parseError);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        passwordChanged: false
      };
    }
  } catch (error) {
    console.error('Error in getInitialState:', error);
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      passwordChanged: false
    };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordChanged: (state) => {
      state.passwordChanged = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Anmeldung fehlgeschlagen.';
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Get me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fehler beim Laden des Benutzerprofils.';
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordChanged = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordChanged = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fehler beim Ändern des Passworts.';
      });
  }
});

export const { clearError, clearPasswordChanged } = authSlice.actions;
export default authSlice.reducer; 