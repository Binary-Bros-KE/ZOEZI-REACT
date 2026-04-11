
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

const USER_TYPES = [
  { value: 'student', label: 'Student' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'tutor', label: 'Tutor' },
]

const FloatingInputField = ({ label, type = 'text', value, onChange, disabled, placeholder, accentColor }) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value && value.trim().length > 0

  return (
    <div className="group relative w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-0 py-2 bg-transparent border-b-2 text-gray-900 placeholder-transparent transition-all duration-300 focus:outline-none ${
          accentColor === 'purple'
            ? 'border-purple-200 focus:border-purple-400 focus:shadow-[0_4px_0_-2px_rgba(167,139,250,0.4)]'
            : 'border-yellow-100 focus:border-yellow-400 focus:shadow-[0_4px_0_-2px_rgba(251,191,36,0.4)]'
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      />
      <label
        className={`absolute left-0 transition-all duration-300 pointer-events-none ${
          isFocused || hasValue
            ? 'text-xs font-semibold -top-6'
            : 'text-base text-gray-400 top-2'
        } ${accentColor === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`}
      >
        {label}
      </label>
    </div>
  )
}

const HelpModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-999999 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-extrabold tracking-wide">ZOEZI SOMA ASSIST</h2>
              <button
                onClick={onClose}
                className="bg-none border-none text-white text-2xl cursor-pointer transition-all duration-300 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="p-4 border-b-4 border-purple-300 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-300 hover:translate-x-1">
                <h3 className="text-lg font-bold text-purple-700 mb-2">New Student?</h3>
                <p className="text-gray-700">Create a free account and use details to login</p>
              </div>

              <div className="p-4 border-b-4 border-purple-300 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-300 hover:translate-x-1">
                <h3 className="text-lg font-bold text-purple-700 mb-2">Zoezi Alumni?</h3>
                <p className="text-gray-700">Use your existing zoezi account to access zoezi soma courses. Login and check menu: find the "My Courses" tab and explore the courses offered</p>
              </div>

              <div className="p-4 border-b-4 border-purple-300 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-300 hover:translate-x-1">
                <h3 className="text-lg font-bold text-purple-700 mb-2">Tutor Access</h3>
                <p className="text-gray-700">The tutor tab is strictly for Zoezi Soma Administrators only</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('student')
  const [showRegister, setShowRegister] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const formRef = React.useRef(null)

  const { login } = useAuth()

  // Check if mobile device
  const isMobile = () => {
    return typeof window !== 'undefined' && window.innerWidth < 1024
  }

  // Scroll to form on mobile
  const scrollToForm = () => {
    if (isMobile() && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  // Login form
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register form
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    dob: '',
    password: '',
  })
  const [regLoading, setRegLoading] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginId.trim() || !loginPassword.trim()) {
      toast.error('Please enter all fields')
      return
    }
    setLoginLoading(true)
    try {
      const endpoint = '/auth/login'
      const body = { userType, email: loginId, password: loginPassword }
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Login failed')

      login(data.data.user, data.data.token, data.data.user.userType || userType)

      toast.success('Login successful!')
      if (data.data.user.userType === 'student') navigate('/student/dashboard?tab=dashboard')
      else if (data.data.user.userType === 'tutor') navigate('/tutor/dashboard?tab=dashboard')
      else if (data.data.user.userType === 'alumni') navigate('/alumni/dashboard?tab=dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault()
    for (const key in regForm) {
      if (!regForm[key].trim()) {
        toast.error('Please fill all fields')
        return
      }
    }
    setRegLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Registration failed')
      toast.success('Account created! You can now login.')
      setShowRegister(false)
      setRegForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        idNumber: '',
        dob: '',
        password: '',
      })
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setRegLoading(false)
    }
  }

  const accentColor = userType === 'student' ? 'purple' : 'gold'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-100 to-white relative overflow-hidden">
      {/* Help Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 z-999999 border-none cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHelpModal(true)}
      >
       Help ?
      </motion.button>

      {/* Help Modal */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Left Side - Background with Overlay */}
      <motion.div
        className="w-full lg:w-1/2 min-h-96 lg:min-h-screen relative flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700">
          <img src="/hero.jpg" alt="Login Background" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 md:px-8 py-6 sm:py-8 text-white text-left max-w-md flex flex-col gap-8 w-full">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-2 bg-gradient-to-b from-purple-300 to-purple-100 bg-clip-text text-transparent">
              Enroll Zoezi Soma?
            </h1>
            <p className="text-base text-gray-100 leading-relaxed">
              Create a free account to access all courses offered by the Nairobi Zoezi Institute
            </p>
          </motion.div>

          {/* New Student Info */}
          <motion.div
            className="p-6 border-b-4 border-purple-400 bg-white/10 backdrop-blur rounded-xl hover:bg-white/15 transition-all duration-300 hover:translate-x-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-2">New Student?</h3>
            <p className="text-gray-100 mb-4 text-sm">Create a free Zoezi Soma Account to Access the dashboard.</p>
            <button
              type="button"
              className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 border-none"
              onClick={() => {
                setShowRegister(true)
                scrollToForm()
              }}
            >
              Create a new account
            </button>
          </motion.div>

          {/* Alumni Info */}
          <motion.div
            className="p-6 border-b-4 border-yellow-400 bg-white/10 backdrop-blur rounded-xl hover:bg-white/15 transition-all duration-300 hover:translate-x-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-2">Zoezi Alumni?</h3>
            <p className="text-gray-100 text-sm">
              If you are an alumni you can use your alumni dashboard to access zoezi soma, no need to create new account. Please Login.
            </p>
            
          {/* Mobile Only - Login Button */}
          <motion.button
            type="button"
            className="mt-4 lg:hidden bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-12 py-2 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 border-none uppercase tracking-wide"
            onClick={() => {
              setShowRegister(false)
              setUserType('alumni')
              scrollToForm()
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🔑 Login
          </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        ref={formRef}
        className="w-full lg:w-1/2 min-h-screen max-md:min-h-auto flex items-center justify-center px-4 sm:px-6 py-8 lg:py-0 lg:px-8 bg-white"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md border-2 border-gray-200 py-10 px-5 rounded">
          {/* User Type Selection */}
          {!showRegister && (
            <motion.div
              className="flex gap-2 mb-6 justify-center flex-wrap"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {USER_TYPES.map((type) => (
                <motion.button
                  key={type.value}
                  className={`flex-1 min-w-[90px] px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 border-2 cursor-pointer ${
                    userType === type.value
                      ? type.value === 'student'
                        ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white border-purple-600 shadow-lg shadow-purple-400/30'
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-600 shadow-lg shadow-yellow-400/30'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setUserType(type.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {type.label}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Login Form */}
          {!showRegister && (
            <motion.form
              onSubmit={handleLogin}
              className="flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className={`text-2xl font-bold text-center mb-2 ${
                accentColor === 'purple'
                  ? 'bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'
              }`}>
                Login to Zoezi
              </h2>

              <FloatingInputField
                label="Email Address"
                type="email"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                disabled={loginLoading}
                placeholder="Enter your email"
                accentColor={accentColor}
              />

              <div className="relative w-full">
                <FloatingInputField
                  label="Password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loginLoading}
                  placeholder={
                    userType === 'tutor' || userType === 'alumni'
                      ? 'If first time, use phone number'
                      : 'Enter your password'
                  }
                  accentColor={accentColor}
                />
                <button
                  type="button"
                  className="absolute right-0 top-2 text-xl cursor-pointer transition-all duration-300 hover:scale-110 bg-none border-none"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>

              <motion.button
                type="submit"
                className={`py-3 px-6 rounded-lg font-bold text-white uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border-none cursor-pointer ${
                  accentColor === 'purple'
                    ? 'bg-gradient-to-r from-purple-400 to-purple-600 hover:shadow-lg hover:shadow-purple-400/30 disabled:opacity-60'
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:shadow-lg hover:shadow-yellow-400/30 disabled:opacity-60'
                }`}
                disabled={loginLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loginLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </motion.button>

              <div className="flex justify-between flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  className="text-purple-500 font-semibold cursor-pointer hover:text-purple-700 transition-colors duration-300 underline text-sm bg-none border-none"
                  onClick={() => {
                    setShowRegister(true)
                    scrollToForm()
                  }}
                >
                  Create Student Account
                </button>
                <button
                  type="button"
                  className="text-red-500 font-semibold cursor-pointer hover:text-red-700 transition-colors duration-300 underline text-sm bg-none border-none"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </button>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded text-xs text-purple-900 mt-2">
                <span className="font-bold text-purple-700">Note:</span> If first time login as Tutor or Alumni, use your phone number as password.
              </div>
            </motion.form>
          )}

          {/* Register Form */}
          {showRegister && (
            <motion.form
              onSubmit={handleRegister}
              className="flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Create Student Account
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInputField
                  label="First Name"
                  type="text"
                  value={regForm.firstName}
                  onChange={(e) => setRegForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="First name"
                  accentColor="purple"
                />
                <FloatingInputField
                  label="Last Name"
                  type="text"
                  value={regForm.lastName}
                  onChange={(e) => setRegForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Last name"
                  accentColor="purple"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInputField
                  label="Email"
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email address"
                  accentColor="purple"
                />
                <FloatingInputField
                  label="Phone"
                  type="text"
                  value={regForm.phone}
                  onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone number"
                  accentColor="purple"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInputField
                  label="ID Number"
                  type="text"
                  value={regForm.idNumber}
                  onChange={(e) => setRegForm((f) => ({ ...f, idNumber: e.target.value }))}
                  placeholder="ID number"
                  accentColor="purple"
                />
                <FloatingInputField
                  label="Date of Birth"
                  type="date"
                  value={regForm.dob}
                  onChange={(e) => setRegForm((f) => ({ ...f, dob: e.target.value }))}
                  placeholder="Date of birth"
                  accentColor="purple"
                />
              </div>

              <div className="relative w-full">
                <FloatingInputField
                  label="Password"
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={regForm.password}
                  onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  accentColor="purple"
                />
                <button
                  type="button"
                  className="absolute right-0 top-2 text-xl cursor-pointer transition-all duration-300 hover:scale-110 bg-none border-none"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                >
                  {showRegisterPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>

              <motion.button
                type="submit"
                className="py-3 px-6 rounded-lg font-bold text-white uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-purple-400 to-purple-600 hover:shadow-lg hover:shadow-purple-400/30 disabled:opacity-60 flex items-center justify-center gap-2 border-none cursor-pointer"
                disabled={regLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {regLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  className="text-gray-700 font-semibold cursor-pointer hover:text-purple-600 transition-colors duration-300 bg-none border-none"
                  onClick={() => {
                    setShowRegister(false)
                    scrollToForm()
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
