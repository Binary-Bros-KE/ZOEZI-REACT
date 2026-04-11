// CPDHistoryTab.jsx - Updated version
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalendar, FaCheckCircle, FaTimesCircle, FaAward, FaBook, FaCertificate, FaChartLine, FaUsers, FaLightbulb, FaUniversity } from 'react-icons/fa'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

const CPD_IMPORTANCE_POINTS = [
  {
    icon: <FaCertificate />,
    title: "Maintain Professional Certification",
    description: "Stay certified and compliant with professional body requirements through annual CPD points."
  },
  {
    icon: <FaChartLine />,
    title: "Career Advancement",
    description: "Enhance your skills and knowledge to unlock better job opportunities and career growth."
  },
  {
    icon: <FaLightbulb />,
    title: "Stay Current with Industry Trends",
    description: "Keep up-to-date with latest fitness research, techniques, and industry best practices."
  },
  {
    icon: <FaUsers />,
    title: "Networking Opportunities",
    description: "Connect with other professionals through workshops, seminars, and CPD events."
  },
  {
    icon: <FaBook />,
    title: "Continuous Learning",
    description: "Develop new competencies and refine existing skills through structured learning activities."
  },
  {
    icon: <FaUniversity />,
    title: "Professional Credibility",
    description: "Demonstrate commitment to excellence and maintain trust with clients and employers."
  }
]

const CPD_ACTIVITIES = [
  { activity: "Annual CPD Exam", points: "10-20 points" },
  { activity: "Professional Workshops", points: "5-15 points" },
  { activity: "Industry Seminars", points: "5-10 points" },
  { activity: "Online Courses", points: "3-8 points" },
  { activity: "Conference Attendance", points: "10-25 points" },
  { activity: "Peer Review Sessions", points: "3-7 points" }
]

export default function CPDHistoryTab({ userData }) {
  const [cpdRecords, setCpdRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const userType = localStorage.getItem('userType') || 'student'

  useEffect(() => {
    if (userData?._id) {
      fetchCpdHistory()
    } else {
      // If no user ID, stop loading after timeout
      const timer = setTimeout(() => {
        setLoading(false)
        toast.error('User information not available')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [userData])

  const fetchCpdHistory = async () => {
    try {
      setLoading(true)
      
      // Use the new CPD route with userType parameter
      const response = await fetch(`${API_BASE_URL}/cpd/${userData._id}?userType=${userType}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch CPD history (${response.status})`)
      }

      const data = await response.json()
      setCpdRecords(data.data || [])
    } catch (error) {
      console.error('Error fetching CPD history:', error)
      toast.error(error.message || 'Failed to load CPD history')
      setCpdRecords([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold" />
        <p className="text-gray-600">Loading CPD records...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 rounded-xl p-6 border-2 border-gray-200"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 mb-2">
            <FaAward size={24} className="text-brand-gold" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">
                Continuing Professional Development (CPD)
              </h2>
              <p className="text-gray-600">Track your professional growth and certification maintenance</p>
            </div>
          </div>
          
          <div className="bg-white px-4 py-2 rounded-lg border border-brand-gold/30">
            <p className="text-sm text-gray-600">Required Annual Points</p>
            <p className="text-xl font-bold text-brand-gold">4.0 points</p>
          </div>
        </div>
      </motion.div>

            {/* CPD Records */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-brand-dark">Your CPD History</h3>
          <button
            onClick={fetchCpdHistory}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            Refresh
          </button>
        </div>

        {cpdRecords.length > 0 ? (
          <div className="space-y-3">
            {cpdRecords.map((record, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition"
                style={{ 
                  borderColor: record.result === 'pass' ? '#10B981' : '#EF4444',
                  background: record.result === 'pass' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.02) 0%, rgba(255,255,255,1) 50%)' : 'white'
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-xl font-bold text-brand-dark">
                        {record.year} CPD Assessment
                      </h4>
                      {record.result === 'pass' ? (
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 flex items-center gap-1">
                          <FaCheckCircle size={14} /> PASS
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 flex items-center gap-1">
                          <FaTimesCircle size={14} /> FAIL
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaCalendar size={16} className="text-brand-gold" />
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Date Taken</p>
                          <p className="font-semibold">
                            {record.dateTaken ? new Date(record.dateTaken).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {record.score && (
                        <div className="flex items-center gap-2">
                          <FaAward size={16} className="text-brand-gold" />
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">CPD Points Earned</p>
                            <p className="font-semibold">{record.score} points</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">Year</p>
                        <p className="font-semibold">{record.year}</p>
                      </div>
                    </div>

                    {record.remarks && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-2 border-brand-gold">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Remarks</p>
                        <p className="text-gray-700">{record.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center border-2 border-dashed border-gray-300"
          >
            <FaAward size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-700 text-lg font-semibold mb-2">No CPD Records Found</p>
            <p className="text-gray-500 mb-4">Your CPD exam history will appear here once recorded</p>
            <button
              onClick={fetchCpdHistory}
              className="px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 transition"
            >
              Refresh Records
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Importance of CPD Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
          <FaCertificate className="text-brand-gold" />
          Why CPD Matters
        </h3>
        <p className="text-gray-700 mb-6">
          Continuing Professional Development (CPD) is lifelong learning for professionals to stay current, 
          improve skills, and enhance their professional duties. It includes various activities like training, 
          courses, seminars, workshops, and e-learning, tracked using points to meet annual requirements set 
          by professional bodies.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {CPD_IMPORTANCE_POINTS.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-gray-100 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-brand-gold text-lg">
                  {point.icon}
                </div>
                <h4 className="font-bold text-brand-dark">{point.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{point.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <FaChartLine />
            Common CPD Activities & Points
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CPD_ACTIVITIES.map((activity, index) => (
              <div key={index} className="bg-white p-3 rounded border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">{activity.activity}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>



      {/* Summary Stats */}
      {cpdRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 text-center border-t-4 border-brand-gold">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total CPD Records</p>
            <p className="text-3xl font-bold text-brand-dark">
              {cpdRecords.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center border-t-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Passed</p>
            <p className="text-3xl font-bold text-green-600">
              {cpdRecords.filter(r => r.result === 'pass').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center border-t-4 border-red-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Failed</p>
            <p className="text-3xl font-bold text-red-600">
              {cpdRecords.filter(r => r.result === 'fail').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center border-t-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Points</p>
            <p className="text-3xl font-bold text-blue-600">
              {cpdRecords.reduce((total, record) => total + (record.score || 0), 0)} pts
            </p>
          </div>
        </motion.div>
      )}

      {/* Footer Note */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          <strong>Note:</strong> CPD records are updated by administrators. If you believe there's an error in your records, 
          please contact the administration office at <span className="font-semibold">info@zoezi.co.ke</span>
        </p>
      </div>
    </div>
  )
}