import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthDebug = () => {
  const { user, loading, clearAuth } = useAuth();
  const [promoting, setPromoting] = useState(false);

  const promoteToAdmin = async () => {
    try {
      setPromoting(true);
      const response = await axios.post('/api/auth/promote-to-admin');
      toast.success('Successfully promoted to admin! Please refresh the page.');
      console.log('Promotion response:', response.data);
    } catch (error) {
      console.error('Promotion error:', error);
      toast.error('Failed to promote to admin: ' + (error.response?.data?.message || error.message));
    } finally {
      setPromoting(false);
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    console.log('Token length:', token?.length);
    console.log('Token parts (should be 3):', token?.split('.').length);
    console.log('Token periods count:', (token?.match(/\./g) || []).length);
    console.log('Is valid JWT format:', (token?.match(/\./g) || []).length === 2);
    console.log('Axios default headers:', axios.defaults.headers.common);
  };

  const handleClearAuth = () => {
    clearAuth();
    toast.info('Authentication data cleared. Please login again.');
  };

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await axios.get('/api/products/featured');
      console.log('Backend connection test successful:', response.status);
      toast.success('Backend connection successful!');
    } catch (error) {
      console.error('Backend connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error('Backend connection failed: ' + error.message);
    }
  };

  const testAuthEndpoint = async () => {
    try {
      console.log('Testing /api/auth/me endpoint...');
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No token found. Please login first.');
        return;
      }
      
      const response = await axios.get('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('/api/auth/me test successful:', response.data);
      toast.success('Auth endpoint test successful!');
    } catch (error) {
      console.error('/api/auth/me test failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      toast.error('Auth endpoint test failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">Loading State:</h2>
            <p className="text-sm text-gray-600">Loading: {loading ? 'true' : 'false'}</p>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">User State:</h2>
            <pre className="text-sm text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">Token Info:</h2>
            <div className="space-x-2 mb-4">
              <button 
                onClick={checkToken}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Check Token in Console
              </button>
              <button 
                onClick={handleClearAuth}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Auth Data
              </button>
            </div>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">Backend Tests:</h2>
            <div className="space-x-2">
              <button 
                onClick={testBackendConnection}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Backend Connection
              </button>
              <button 
                onClick={testAuthEndpoint}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Test Auth Endpoint
              </button>
            </div>
          </div>

          {user && user.role !== 'ADMIN' && (
            <div className="border p-4 rounded bg-yellow-50">
              <h2 className="font-semibold mb-2 text-yellow-800">User Role Issue:</h2>
              <p className="text-sm text-yellow-700 mb-3">
                Your current role is '{user.role}' but you need 'ADMIN' role to access admin features.
              </p>
              <button 
                onClick={promoteToAdmin}
                disabled={promoting}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {promoting ? 'Promoting...' : 'Promote to Admin'}
              </button>
            </div>
          )}

          {user && user.role === 'ADMIN' && (
            <div className="border p-4 rounded bg-green-50">
              <h2 className="font-semibold mb-2 text-green-800">Admin Access:</h2>
              <p className="text-sm text-green-700">
                ✅ You have admin role! You should be able to access admin features.
              </p>
            </div>
          )}

          {!user && !loading && (
            <div className="border p-4 rounded bg-red-50">
              <h2 className="font-semibold mb-2 text-red-800">Not Authenticated:</h2>
              <p className="text-sm text-red-700">
                No user found. Please login first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
