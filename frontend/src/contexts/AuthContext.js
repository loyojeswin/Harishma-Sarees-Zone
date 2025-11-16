import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = false;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    console.log('AuthContext - useEffect triggered (component mounted)');
    
    // Clean up any corrupted tokens first
    const token = localStorage.getItem('token');
    console.log('AuthContext - Initial token check:', token);
    
    if (token === 'undefined' || token === 'null' || token === '') {
      console.log('AuthContext - Cleaning up corrupted token:', token);
      sessionStorage.removeItem('token');
      localStorage.removeItem('token'); // Clean both storages
    }
    
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    if (isCheckingAuth) {
      console.log('AuthContext - Auth check already in progress, skipping');
      return;
    }
    
    try {
      setIsCheckingAuth(true);
      const token = localStorage.getItem('token');
      console.log('AuthContext - Token from localStorage:', token);
      console.log('AuthContext - Token type:', typeof token);
      console.log('AuthContext - Token length:', token?.length);
      
      // Check if token exists and is not null/undefined
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        console.log('AuthContext - Token periods count:', token.split('.').length - 1);
        
        // Validate JWT format (should have exactly 2 periods)
        const periodCount = (token.match(/\./g) || []).length;
        if (periodCount !== 2) {
          console.error('AuthContext - Invalid JWT format, clearing token');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setLoading(false);
          return;
        }
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('AuthContext - Set default header:', axios.defaults.headers.common['Authorization']);
        
        // Verify token with backend
        console.log('AuthContext - Making request to /api/auth/me');
        console.log('AuthContext - Request headers:', axios.defaults.headers.common);
        
        const response = await axios.get('/api/auth/me');
        console.log('AuthContext - /api/auth/me response:', response.data);
        const { id, name, email, roles } = response.data;
        
        // Set user data
        const userData = {
          id,
          name,
          email,
          role: roles[0]?.replace('ROLE_', '') || 'USER'
        };
        setUser(userData);
        console.log('AuthContext - User loaded successfully:', userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // Only clear token if it's actually invalid (401/403), not network errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('AuthContext - Invalid token, clearing');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } else {
        console.log('AuthContext - Network/server error, keeping token for retry');
        // Don't clear token for network errors, just set user to null temporarily
        setUser(null);
      }
    } finally {
      setIsCheckingAuth(false);
      setLoading(false);
      console.log('AuthContext - Loading complete');
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/signin', {
        email,
        password
      });

      console.log('Login - Full response:', response.data);
      
      // Try to get token from different possible field names
      const token = response.data.token || response.data.accessToken;
      const { id, name, email: userEmail, roles } = response.data;
      
      console.log('Login - Received token:', token);
      console.log('Login - Token type:', typeof token);
      console.log('Login - Token length:', token?.length);
      
      if (!token) {
        console.error('Login - No token received in response');
        return { 
          success: false, 
          message: 'No authentication token received from server' 
        };
      }
      
      // Store token in localStorage for persistent login
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Login - Set default header:', axios.defaults.headers.common['Authorization']);
      
      // Set user data
      const userData = {
        id,
        name,
        email: userEmail,
        role: roles[0]?.replace('ROLE_', '') || 'USER'
      };
      setUser(userData);
      console.log('Login - User set:', userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      await axios.post('/api/auth/signup', userData);
      
      // Backend only returns success message, need to login after signup
      return { success: true, needsLogin: true };
    } catch (error) {
      console.error('Signup failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    console.log('Logout - Authentication data cleared');
  };

  const clearAuth = () => {
    console.log('Clearing all authentication data');
    sessionStorage.removeItem('token');
    localStorage.removeItem('token'); // Clear both for cleanup
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    checkAuthStatus,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
