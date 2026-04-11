import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import DashboardSidebar from '../DashboardSidebar'
import ProfileTab from '../components/ProfileTab'
import SettingsTab from '../components/SettingsTab'
import SubscriptionTab from '../components/SubscriptionTab'
import CPDHistoryTab from '../components/CPDHistoryTab'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function UserDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [userData, setUserData] = useState(null)
  const [editData, setEditData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPage, setIsLoadingPage] = useState(true)

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      toast.error('Please login first')
      navigate('/login')
      return
    }

    try {
      const user = JSON.parse(storedUser)
      setUserData(user)
      setEditData(user)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
      navigate('/login')
    } finally {
      setIsLoadingPage(false)
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    toast.success('Logged out successfully!')
    navigate('/')
  }

  if (isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ backgroundColor: 'var(--color-background-light, #fafaf8)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-text-light)', borderTopColor: 'var(--color-primary-gold)' }}></div>
        <p className="font-medium" style={{ color: 'var(--color-primary-brown)' }}>Loading dashboard...</p>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-background-light, #fafaf8)' }}>
      {/* Sidebar - Fixed on desktop, mobile menu on tablet/mobile */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userData={userData}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">

          {/* Payment Status Banner */}
          {(() => {
            const currentYear = new Date().getFullYear();
            const currentYearPayment = userData.subscriptionPayments?.find(
              payment =>
                (payment.year === currentYear || payment.year === currentYear.toString()) &&
                payment.status === 'paid'
            );

            if (!currentYearPayment) {
              return (
                <div className="mb-6 p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Your profile is not visible in searches.</span> Please complete your {currentYear} subscription payment to make your profile visible.
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="mb-6 p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Your profile is visible in searches.</span> Your {currentYear} subscription is active.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab
              userData={userData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              editData={editData}
              setEditData={setEditData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && <SubscriptionTab user={userData} />}

          {/* CPD Records Tab */}
          {activeTab === 'cpd' && userData.verified && <CPDHistoryTab user={userData} />}

          {/* Settings Tab */}
          {activeTab === 'settings' && <SettingsTab userData={userData} />}
        </div>
      </main>
    </div>
  )
}
