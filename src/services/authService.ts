import api from './api';
import { LoginFormData, RegisterFormData } from '../types/auth';

export interface AuthResponse {
  // Common token field names
  token?: string;
  accessToken?: string;
  access_token?: string;
  
  // User information that might be returned
  user?: {
    id?: string;
    userId?: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
  };
  
  // Sometimes user info is at root level
  id?: string;
  userId?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  
  // Allow for any additional fields the API might return
  [key: string]: any;
}

const login = async (userData: LoginFormData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/api/v1/Auth/login', userData);
    
    // Handle different possible response structures
    if (!response.data) {
      throw new Error('No data returned from login API');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

const register = async (userData: RegisterFormData) => {
  try {
    const response = await api.post('/api/v1/Auth/register', userData);
    return response.data;
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

const authService = {
  login,
  register,
};

export default authService; 