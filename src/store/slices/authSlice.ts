import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService, { AuthResponse } from '../../services/authService';
import { LoginFormData, RegisterFormData } from '../../types/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

// Helper function to extract user data from different response formats
const extractUserData = (response: AuthResponse): User => {
  // Try to get user data from nested user object first
  if (response.user) {
    const { user } = response;
    return {
      id: user.id || user.userId || '1',
      email: user.email || user.username || 'user@example.com',
      firstName: user.firstName || user.name?.split(' ')[0] || 'User',
      lastName: user.lastName || user.name?.split(' ')[1] || 'Name'
    };
  }
  
  // Try to get user data from root level
  return {
    id: response.id || response.userId || '1',
    email: response.email || response.username || 'user@example.com',
    firstName: response.firstName || response.name?.split(' ')[0] || 'User',
    lastName: response.lastName || response.name?.split(' ')[1] || 'Name'
  };
};

// Helper function to extract token from different response formats
const extractToken = (response: AuthResponse): string | null => {
  return response.token || response.accessToken || response.access_token || null;
};

// Helper function to get initial auth state from localStorage
const getInitialAuthState = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
        loading: 'succeeded' as const,
        error: null
      };
    }
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
    // Clear invalid data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: 'idle' as const,
    error: null
  };
};

const initialState: AuthState = getInitialAuthState();

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterFormData, { rejectWithValue }) => {
    try {
      await authService.register(userData);
    } catch (error: any) {
      console.error('Register error in thunk:', error);
      const message = error.response?.data?.title || error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk<AuthResponse, LoginFormData>(
    'auth/login',
    async (userData, { rejectWithValue }) => {
      try {
        const data = await authService.login(userData);
        console.log('Login thunk received:', data);
        
        // Extract and store token
        const token = extractToken(data);
        if (token) {
          localStorage.setItem('token', token);
        }
        
        return data;
      } catch (error: any) {
        console.error('Login error in thunk:', error);
        const message = error.response?.data?.title || error.response?.data?.message || error.message;
        return rejectWithValue(message);
      }
    }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        console.log('Login fulfilled with payload:', action.payload);
        state.loading = 'succeeded';
        state.isAuthenticated = true;
        
        // Extract token using helper function
        const token = extractToken(action.payload);
        state.token = token;
        
        // Extract user data using helper function
        const userData = extractUserData(action.payload);
        state.user = userData;
        
        // Store user data in localStorage for persistence across refreshes
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 