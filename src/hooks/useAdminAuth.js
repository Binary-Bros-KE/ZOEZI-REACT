import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status
  const checkAuth = useCallback(() => {
    try {
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return false;
      }

      const authData = JSON.parse(adminAuth);
      const now = new Date();
      const expiry = new Date(authData.expiresAt);

      if (now > expiry) {
        // Token expired
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setIsChecking(false);
        toast.error('Admin session expired. Please login again.');
        return false;
      }

      setIsAuthenticated(true);
      setIsChecking(false);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('adminAuth');
      setIsAuthenticated(false);
      setIsChecking(false);
      return false;
    }
  }, []);

// Login function
const login = async (username, password) => {
  try {
    setIsChecking(true);
    const response = await fetch(`${API_BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      const authData = {
        authenticated: true,
        username: data.data.username,
        expiresAt: data.data.expiresAt,
        authenticatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('adminAuth', JSON.stringify(authData));
      setIsAuthenticated(true);
      toast.success(`Welcome ${username}!`);
      return true;
    } else {
      toast.error(data.message || 'Authentication failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Network error. Please try again.');
    return false;
  } finally {
    setIsChecking(false);
  }
};

  // Logout function
  const logout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Effect to check auth on mount and route changes
  useEffect(() => {
    checkAuth();
  }, [checkAuth, location.pathname]);

  return {
    isAuthenticated,
    isChecking,
    login,
    logout,
    checkAuth
  };
};