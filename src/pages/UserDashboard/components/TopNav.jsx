// components/TopNav.js - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { IoMdLogOut } from "react-icons/io";

const TopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState('');

  // Calculate remaining time
  useEffect(() => {
    const calculateRemainingTime = () => {
      const expiresAt = localStorage.getItem('expiresAt');
      if (!expiresAt) {
        setTimeRemaining('N/A');
        return;
      }
      
      const now = new Date();
      const expiryTime = new Date(expiresAt);
      const diffMs = expiryTime - now;
      
      if (diffMs <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
    };

    // Update every second
    calculateRemainingTime();
    const interval = setInterval(calculateRemainingTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Home Link */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/favicon.png" 
                alt="NZI Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-brand-dark">
                NZI
              </span>
            </Link>
            <Link 
              to="/" 
              className="text-brand-gold hover:text-brand-dark transition-colors font-bold underline"
            >
              Home
            </Link>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col text-right max-md:hidden">
                    <span className="text-sm font-semibold text-gray-700">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-green-600">
                      ✅ AUTHENTICATED
                    </span>
                  </div>
                  <img 
                    src={user.profilePicture?.url || user.profilePicture || '/placeholder-profile.jpg'}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border-2 border-brand-gold"
                  />
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
                >
               <IoMdLogOut />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-dark transition-colors font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;