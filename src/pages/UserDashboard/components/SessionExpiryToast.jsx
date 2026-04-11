// components/SessionExpiryToast.js
import { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const SessionExpiryToast = () => {
  const { checkSessionExpiry, logout } = useAuth();

  useEffect(() => {
    const checkExpiry = () => {
      if (checkSessionExpiry()) {
        toast.error(
          <div>
            <p className="font-bold">Session Expired</p>
            <p>Your session has expired. Please login again.</p>
          </div>,
          {
            duration: 10000,
            icon: '⏰',
          }
        );
        setTimeout(() => {
          logout();
        }, 5000);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkExpiry, 30000);
    
    // Initial check
    checkExpiry();

    return () => clearInterval(interval);
  }, [checkSessionExpiry, logout]);

  return null; // This component doesn't render anything
};

export default SessionExpiryToast;