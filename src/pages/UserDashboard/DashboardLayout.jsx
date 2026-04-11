// Update DashboardLayout.js - FIXED VERSION
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardSidebar from './DashboardSidebar'
import TopNav from './components/TopNav'
import { useAuth } from '../../hooks/useAuth'
import { IoMdHelpCircle } from 'react-icons/io'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function DashboardLayout({ userType, children }) {
  const navigate = useNavigate()
  const { user, logout, checkSessionExpiry } = useAuth()
  const [userData, setUserData] = useState(null)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    refreshUserData();
  }, [])

  // Check session on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser) {
      toast.error('Please login first')
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      const storedUserType = localStorage.getItem('userType')

      if (storedUserType !== userType) {
        toast.error('Access denied: wrong user type')
        navigate('/login')
        return
      }

      setUserData(parsedUser)
      setIsLoadingPage(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      localStorage.clear()
      navigate('/login')
    }
  }, [userType, navigate])

  // In DashboardLayout.js, update the refreshUserData function:
  const refreshUserData = async () => {

    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        throw new Error('No token or user found');
      }

      const parsedUser = JSON.parse(storedUser);
      const response = await fetch(`${API_BASE_URL}/auth/user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parsedUser._id,
          userType: localStorage.getItem('userType')
        })
      });


      if (response.ok) {
        const data = await response.json();
        const newUserData = data.data.user;
        setUserData(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
        return newUserData;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Failed to refresh user data');
      return null;
    }
  };

  // Check session expiry periodically
  useEffect(() => {
    const checkSession = () => {
      if (checkSessionExpiry()) {
        logout()
      }
    }

    const interval = setInterval(checkSession, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [checkSessionExpiry, logout])

  const handleLogout = () => {
    logout()
  }

  const openHelp = () => setHelpOpen(true)
  const closeHelp = () => setHelpOpen(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && helpOpen) closeHelp()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [helpOpen])

  if (isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-primary">
        <div className="w-10 h-10 border-4 rounded-full animate-spin border-light-gray border-t-brand-gold"></div>
        <p className="font-medium text-primary-dark">Loading dashboard...</p>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-primary">
      {/* Sidebar */}
      <DashboardSidebar
        userData={userData}
        onLogout={handleLogout}
        userType={userType}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-72">
        {/* Top Navigation */}
        <TopNav />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children({
              userData,
              setUserData,
              handleLogout,
              refreshUserData
            })}
          </div>
        </main>
      </div>

      {/* Help Button (visible only to students) */}
      {userType === 'student' && (
        <>
          <button
            onClick={openHelp}
            aria-label="Open help"
            className="fixed flex items-center gap-2 -right-7 top-1/2 z-40 transform -rotate-90 -translate-y-1/2 bg-brand-gold text-primary-dark font-semibold px-4 py-1 shadow-lg hover:opacity-95 cursor-pointer"
          >
            Help <IoMdHelpCircle />
          </button>

          {/* Help Modal */}
          {helpOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={closeHelp}
                aria-hidden
              />

              <div
                role="dialog"
                aria-modal="true"
                className="relative z-50 w-full max-w-3xl sm:max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 bg-brand-gold/10 border-b border-gray-300">
                  <div>
                    <h3 className="text-xl font-semibold text-brand-gold uppercase bold">How to enroll — Quick Help</h3>
                    <p className="text-sm text-primary-dark/80">Step-by-step guide to enroll and access your course</p>
                  </div>
                  <button onClick={closeHelp} aria-label="Close" className="text-gray-600 hover:text-gray-900 p-2 rounded-md cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 text-sm text-gray-800 space-y-6">
                  <div className="space-y-2">
                    <p className="font-medium">1. To enroll in a course, please visit the <strong>COURSES</strong> tab on the sidebar menu.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">2. From the available courses:</p>

                    <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Click "Enroll now"</li>
                        <li>Enter the phone number you will use to pay for the course</li>
                        <li>An STK prompt will be sent to your phone</li>
                        <li>Enter your PIN to complete</li>
                        <li>Click "Check payment" status if necessary</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">3. On successful enrollment, stay put:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Admin will assign you to a tutor (usually within 24 hours) — you will be notified</li>
                      <li>You will get access to course materials (check the "My courses" tab)</li>
                      <li>A new tab with the course name will appear — access course content there</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}