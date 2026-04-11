// hooks/useAuth.js - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if session is expired - memoized
  const checkSessionExpiry = useCallback(() => {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) return true; // No expiry set, treat as expired
    
    const now = new Date();
    const expiryTime = new Date(expiresAt);
    return now >= expiryTime;
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('authenticatedAt');
    localStorage.removeItem('expiresAt');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged Out Successfully');
    navigate('/login');
  }, [navigate]);

  // Initialize auth state - SIMPLIFIED
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Check expiry every minute
        const interval = setInterval(() => {
          if (checkSessionExpiry()) {
            logout();
          }
        }, 60000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
      }
    }
  }, [checkSessionExpiry, logout]);

  // Login function - SIMPLIFIED
  const login = useCallback((userData, token, userType) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    localStorage.setItem('userType', userType);
    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('authenticatedAt', now.toISOString());
    localStorage.setItem('expiresAt', expiresAt.toISOString());
    
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkSessionExpiry
  };
};