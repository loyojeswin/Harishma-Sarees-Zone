import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthTest = () => {
  const [results, setResults] = useState({});

  const createTestUser = async () => {
    try {
      console.log('Creating test user...');
      const response = await axios.post('/api/auth/create-test-user');
      console.log('Test user creation response:', response.data);
      setResults(prev => ({
        ...prev,
        createUser: { success: true, message: response.data.message }
      }));
      toast.success('Test user created!');
    } catch (error) {
      console.error('Test user creation failed:', error);
      setResults(prev => ({
        ...prev,
        createUser: { success: false, error: error.message }
      }));
      toast.error('Test user creation failed: ' + error.message);
    }
  };

  const testLogin = async () => {
    try {
      console.log('Testing login...');
      const response = await axios.post('/api/auth/signin', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      console.log('Login response:', response.data);
      const token = response.data.token || response.data.accessToken;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setResults(prev => ({
        ...prev,
        login: { success: true, token: token?.substring(0, 20) + '...' }
      }));
      
      toast.success('Login test successful!');
    } catch (error) {
      console.error('Login test failed:', error);
      setResults(prev => ({
        ...prev,
        login: { success: false, error: error.message }
      }));
      toast.error('Login test failed: ' + error.message);
    }
  };

  const testAuthMe = async () => {
    try {
      console.log('Testing /api/auth/me...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found. Please test login first.');
      }

      const response = await axios.get('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('/api/auth/me response:', response.data);
      setResults(prev => ({
        ...prev,
        authMe: { success: true, user: response.data }
      }));
      
      toast.success('Auth me test successful!');
    } catch (error) {
      console.error('/api/auth/me test failed:', error);
      setResults(prev => ({
        ...prev,
        authMe: { success: false, error: error.message, status: error.response?.status }
      }));
      toast.error('Auth me test failed: ' + error.message);
    }
  };

  const testBackend = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await axios.get('/api/products/featured');
      console.log('Backend test successful:', response.status);
      setResults(prev => ({
        ...prev,
        backend: { success: true, status: response.status }
      }));
      toast.success('Backend connection successful!');
    } catch (error) {
      console.error('Backend test failed:', error);
      setResults(prev => ({
        ...prev,
        backend: { success: false, error: error.message }
      }));
      toast.error('Backend test failed: ' + error.message);
    }
  };

  const clearResults = () => {
    setResults({});
    localStorage.removeItem('token');
    sessionStorage.removeItem('token'); // Clean both for safety
    delete axios.defaults.headers.common['Authorization'];
    toast.info('All storage cleared');
  };

  const clearAllStorage = () => {
    // Clear all possible corrupted data
    sessionStorage.clear();
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    setResults({});
    toast.info('All browser storage cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Suite</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tests</h2>
            
            <button 
              onClick={testBackend}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Backend Connection
            </button>
            
            <button 
              onClick={createTestUser}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Create Test User
            </button>
            
            <button 
              onClick={testLogin}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Login
            </button>
            
            <button 
              onClick={testAuthMe}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test /api/auth/me
            </button>
            
            <button 
              onClick={clearResults}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Results
            </button>
            
            <button 
              onClick={clearAllStorage}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear All Storage
            </button>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Results</h2>
            
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold text-yellow-800">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2">
            <li>First test backend connection</li>
            <li>Create test user (email: test@example.com, password: password123)</li>
            <li>Then test login (creates a user session)</li>
            <li>Finally test /api/auth/me (verifies token)</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
