import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import MpesaPayment from '../../../components/MpesaPayment'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

// Year options with discounts for bulk payment
const YEAR_OPTIONS = [
  { years: 1, amount: 1000, label: '1 Year', description: 'Basic subscription' },
  { years: 2, amount: 1900, label: '2 Years', description: 'Save Ksh 100', discount: '5% OFF' },
  { years: 3, amount: 2700, label: '3 Years', description: 'Save Ksh 300', discount: '10% OFF' },
  { years: 5, amount: 4000, label: '5 Years', description: 'Save Ksh 1000', discount: '20% OFF' },
  { years: 10, amount: 7000, label: '10 Years', description: 'Save Ksh 3000', discount: '30% OFF' }
]

// Benefits for being a subscribed alumni
const SUBSCRIPTION_BENEFITS = [
  {
    title: '🎯 Public Profile Visibility',
    description: 'Appear on NZI Alumni Portal where employers can find certified professionals'
  },
  {
    title: '✅ Easy Verification',
    description: 'Employers can instantly verify your certification with a simple online check'
  },
  {
    title: '🚀 Personal Portfolio Page',
    description: 'Get a professional landing page (yourname.nzialumni.co.ke) to showcase your expertise'
  },
  {
    title: '🔍 Search Engine Optimized',
    description: 'Appear on Google and Bing when employers search for fitness experts in Kenya'
  },
  {
    title: '📱 Digital Marketing',
    description: 'We promote subscribed alumni through our social media and digital channels'
  },
  {
    title: '💼 Career Opportunities',
    description: 'Get access to exclusive job postings and career development resources'
  }
]

export default function SubscriptionTab({ userData }) {
  const [subscriptionHistory, setSubscriptionHistory] = useState([])
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  const userType = localStorage.getItem('userType') // 'student' or 'alumni'

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/subscription/${userData._id}?userType=${userType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = await response.json()

      if (response.ok) {
        // Check if data structure is different based on server response
        const subscriptionData = data.data || data

        // If server returns subscription directly
        if (subscriptionData.subscription) {
          setSubscriptionHistory(subscriptionData.subscriptionPayments || [])
          setActiveSubscription(subscriptionData.subscription)
        }
        // If server returns nested structure
        else if (subscriptionData.history) {
          setSubscriptionHistory(subscriptionData.history || [])
          setActiveSubscription(subscriptionData.active || null)
        }
        // Fallback to direct assignment
        else {
          setSubscriptionHistory([])
          setActiveSubscription(null)
        }
      } else {
        toast.error(data.message || 'Failed to load subscription data')
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (paymentData) => {
    setProcessingPayment(true)
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: userData._id,
          userType: userType,
          years: selectedPackage.years,
          amount: selectedPackage.amount,
          paymentData: paymentData
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(`Successfully subscribed for ${selectedPackage.years} year${selectedPackage.years > 1 ? 's' : ''}!`)
        await fetchSubscriptionData()
        setShowPaymentModal(false)
        setSelectedPackage(null)
      } else {
        toast.error(data.message || 'Subscription failed')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to process subscription')
    } finally {
      setProcessingPayment(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateExpiry = (startDate, years) => {
    const date = new Date(startDate)
    date.setFullYear(date.getFullYear() + years)
    return date
  }

  // Check if subscription is active
  const isSubscriptionActive = () => {
    // Check if subscription.active is true AND expiryDate is in future
    if (activeSubscription && activeSubscription.active) {
      const expiryDate = new Date(activeSubscription.expiryDate)
      return expiryDate > new Date()
    }
    return false
  }

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!activeSubscription) return 0
    const expiryDate = new Date(activeSubscription.expiryDate)
    const today = new Date()
    const diffTime = expiryDate - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-brand-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    )
  }

  const daysRemaining = getDaysRemaining()
  const isActive = isSubscriptionActive()

  return (
    <div className="space-y-8">
      {/* Header with active status */}
      <div className="bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 rounded-xl p-6 border-2 border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">
              Annual Subscription
            </h1>
            <p className="text-gray-600">
              Ksh 1,000 per year • Renew your professional profile visibility
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isActive ? (
              <div className="text-right">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Active • {daysRemaining} days remaining
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  Expires: {activeSubscription?.expiryDate ? formatDate(activeSubscription.expiryDate) : 'N/A'}
                </p>
              </div>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {activeSubscription?.expiryDate ? 'Subscription Expired' : 'No Active Subscription'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {YEAR_OPTIONS.map((pkg, index) => (
          <motion.div
            key={pkg.years}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer ${selectedPackage?.years === pkg.years
                ? 'border-brand-gold bg-brand-gold/5'
                : 'border-gray-200 bg-white hover:border-brand-gold/50'
              }`}
            onClick={() => handlePackageSelect(pkg)}
          >
            {pkg.discount && (
              <div className="absolute -top-3 right-4 bg-brand-gold text-white text-xs font-bold px-3 py-1 rounded-full">
                {pkg.discount}
              </div>
            )}

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-brand-dark mb-2">{pkg.label}</h3>
              <div className="text-3xl font-bold text-brand-gold mb-1">
                Ksh {pkg.amount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">{pkg.description}</p>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                {pkg.years === 1 ? 'Per year' : `${pkg.years} years`}
              </div>
              <button className="w-full py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 transition font-medium">
                Select Plan
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Benefits of NZI Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBSCRIPTION_BENEFITS.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-gray-100 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition group"
            >
              <h3 className="font-bold text-brand-dark mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subscription History */}
      {subscriptionHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Subscription History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Years</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Expiry Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionHistory.map((subscription, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{formatDate(subscription.paymentDate)}</td>
                    <td className="py-3 px-4 font-medium">{subscription.years} year{subscription.years > 1 ? 's' : ''}</td>
                    <td className="py-3 px-4 font-medium">Ksh {subscription.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {formatDate(subscription.expiryDate)}
                      {new Date(subscription.expiryDate) > new Date() && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${subscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {subscription.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alternative Payment Methods */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Alternative Payment Methods</h3>
        <p className="text-blue-700 mb-4">
          Need to pay via bank transfer, cash, or cheque? Contact our team to complete your payment.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-600 mb-1">Phone</p>
            <p className="font-semibold text-blue-800">+254 746 139 413</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-600 mb-1">Email</p>
            <p className="font-semibold text-blue-800">info@zoezi.co.ke</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-600 mb-1">Address</p>
            <p className="font-semibold text-blue-800">11th Floor, Development House</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-brand-dark mb-2">
                  Confirm Subscription
                </h3>
                <p className="text-gray-600">
                  You're subscribing for <span className="font-bold">{selectedPackage.years} year{selectedPackage.years > 1 ? 's' : ''}</span>
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700">Subscription Plan</span>
                  <span className="font-semibold">{selectedPackage.label}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700">Duration</span>
                  <span className="font-semibold">{selectedPackage.years} year{selectedPackage.years > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-lg font-bold text-brand-dark">Total Amount</span>
                  <span className="text-2xl font-bold text-brand-gold">
                    Ksh {selectedPackage.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedPackage(null)
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={processingPayment}
                >
                  Cancel
                </button>

                <MpesaPayment
                  amount={selectedPackage.amount}
                  onSuccess={handlePaymentSuccess}
                  onClose={() => {
                    setShowPaymentModal(false)
                    setSelectedPackage(null)
                  }}
                >
                  <button
                    className="flex-1 px-4 py-3 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 transition font-medium disabled:opacity-50"
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'Processing...' : 'Pay with M-Pesa'}
                  </button>
                </MpesaPayment>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}