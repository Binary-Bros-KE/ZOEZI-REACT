import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function ForgotPassword() {
  const navigate = useNavigate()
  
  // States for step tracking
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // UI States
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [codeExpiry, setCodeExpiry] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [attemptsRemaining, setAttemptsRemaining] = useState(5)

  // Timer for code expiry
  useEffect(() => {
    if (codeExpiry && step === 2) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(codeExpiry).getTime()
        const remaining = Math.ceil((expiry - now) / 1000)
        
        if (remaining <= 0) {
          setTimeRemaining(0)
          clearInterval(timer)
          setStep(1)
          setResetCode('')
          toast.error('Reset code expired. Please request a new one.')
        } else {
          setTimeRemaining(remaining)
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [codeExpiry, step])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Step 1: Request reset code
  const handleRequestResetCode = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/alumni/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code')
      }

      setCodeExpiry(new Date(Date.now() + 15 * 60 * 1000))
      setTimeRemaining(15 * 60)
      setAttemptsRemaining(5)
      setStep(2)
      toast.success('Reset code sent to your email!')
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error(error.message || 'Failed to send reset code')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify reset code
  const handleVerifyCode = async (e) => {
    e.preventDefault()

    if (!resetCode.trim()) {
      toast.error('Please enter the reset code')
      return
    }

    if (resetCode.length !== 4 || !/^\d+$/.test(resetCode)) {
      toast.error('Reset code must be 4 digits')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/alumni/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          resetCode: resetCode
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining)
        }
        throw new Error(data.message || 'Invalid reset code')
      }

      setStep(3)
      toast.success('Code verified! Now set your new password.')
    } catch (error) {
      console.error('Verify code error:', error)
      toast.error(error.message || 'Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error('Please enter both password fields')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/alumni/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          resetCode: resetCode,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      setStep(4)
      toast.success('Password reset successfully!')
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  const handleResendCode = () => {
    setStep(1)
    setResetCode('')
    setEmail('')
    setNewPassword('')
    setConfirmPassword('')
    setCodeExpiry(null)
    setTimeRemaining(0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Card Container */}
        <div className="rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          {/* Header */}
          <div className="px-8 py-8 text-center" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
            <h1 className="text-2xl font-bold text-white mb-2">Nairobi Zoezi</h1>
            <p className="text-gray-300">Reset Your Password</p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      i <= step
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                    style={{
                      backgroundColor: i <= step ? 'var(--color-primary-gold)' : '#e5e7eb'
                    }}
                  >
                    {i}
                  </div>
                  {i < 4 && (
                    <div
                      className={`h-1 w-8 mx-2 ${
                        i < step ? '' : 'bg-gray-300'
                      }`}
                      style={{
                        backgroundColor: i < step ? 'var(--color-primary-gold)' : '#d1d5db'
                      }}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <motion.form
                onSubmit={handleRequestResetCode}
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                  Enter Your Email
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  We'll send a 4-digit code to your email to verify your identity.
                </p>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    ✉️ Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary-gold)' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </motion.form>
            )}

            {/* Step 2: Verify Code */}
            {step === 2 && (
              <motion.form
                onSubmit={handleVerifyCode}
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                  Verify Reset Code
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Enter the 4-digit code sent to <strong>{email}</strong>
                </p>

                {timeRemaining > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm font-semibold text-yellow-800">
                      ⚠️ Code expires in {formatTime(timeRemaining)}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="resetCode" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    Reset Code
                  </label>
                  <input
                    type="text"
                    id="resetCode"
                    placeholder="0000"
                    maxLength="4"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition text-center text-2xl tracking-widest"
                    disabled={isLoading}
                  />
                  {attemptsRemaining > 0 && attemptsRemaining < 5 && (
                    <p className="text-xs text-red-600 mt-2">
                      {attemptsRemaining} attempt{attemptsRemaining > 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mb-3"
                  style={{ backgroundColor: 'var(--color-primary-gold)' }}
                  disabled={isLoading || resetCode.length !== 4}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  type="button"
                  className="w-full py-3 rounded-lg font-semibold border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-primary-gold)', color: 'var(--color-primary-gold)' }}
                  onClick={handleResendCode}
                  disabled={isLoading}
                >
                  Didn't receive code? Resend
                </button>
              </motion.form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <motion.form
                onSubmit={handleResetPassword}
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                  Create New Password
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Enter a strong password for your account.
                </p>

                <div className="mb-6">
                  <label htmlFor="newPassword" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    🔒 New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl hover:opacity-70 transition"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    🔒 Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl hover:opacity-70 transition"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary-gold)' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </motion.form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-6"
              >
                <div className="mb-6 flex justify-center">
                  <div className="text-6xl" style={{ color: 'var(--color-primary-gold)' }}>
                    ✓
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-primary-dark)' }}>
                  Password Reset Successful!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your password has been reset successfully. You can now login with your new password.
                </p>
                <button
                  onClick={handleBackToLogin}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary-gold)' }}
                >
                  Back to Login
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {step !== 4 && (
            <div className="px-8 py-4 text-center border-t border-gray-200">
              <button
                type="button"
                className="text-sm font-semibold hover:underline transition"
                style={{ color: 'var(--color-primary-gold)' }}
                onClick={handleBackToLogin}
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
