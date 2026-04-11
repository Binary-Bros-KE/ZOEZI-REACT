import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendar, FaUserGraduate } from 'react-icons/fa'
import { LiaCertificateSolid } from 'react-icons/lia'
import toast from 'react-hot-toast'
import { PiStudent } from 'react-icons/pi'

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300?text=No+Image'

export default function ProfileDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = location.state || {}

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>Profile Not Found</h2>
          <button
            onClick={() => navigate('/search-members')}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary-gold)' }}
          >
            ← Back to Search
          </button>
        </motion.div>
      </div>
    )
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Get subscription status for a given year
  const getSubscriptionStatus = (year) => {
    const cpd = profile.cpdRecords?.find(c => c.year === year)
    return cpd ? 'active' : 'inactive'
  }

  // Get CPD score for a given year
  const getCpdScore = (year) => {
    const cpd = profile.cpdRecords?.find(c => c.year === year)
    return cpd?.score ? cpd.score : '--'
  }

  // Get all years from oldest to current year (fill in gaps)
  const getAllYears = () => {
    if (!profile.cpdRecords || profile.cpdRecords.length === 0) return []
    
    // Get oldest and newest years from CPD records
    const years = profile.cpdRecords.map(c => c.year)
    const oldestYear = Math.min(...years)
    const currentYear = new Date().getFullYear()
    
    // Create array from oldest to current year
    const allYears = []
    for (let year = oldestYear; year <= currentYear; year++) {
      allYears.push(year)
    }
    
    return allYears.sort((a, b) => b - a) // Sort descending (newest first)
  }

  const years = getAllYears()
  console.log(years);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      {/* Back Button */}
      <motion.div
        className="max-w-7xl mx-auto mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={() => navigate('/search-members')}
          className="flex items-center gap-2 hover:opacity-70 transition font-semibold"
          style={{ color: 'var(--color-primary-gold)' }}
        >
          <FaArrowLeft /> Back to Search
        </button>
      </motion.div>

      {/* Main Layout - Sticky Card + Tables */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE - STICKY PROFILE CARD */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="sticky top-8">
              <div
                className="rounded-lg shadow-lg p-6 text-center"
                style={{ backgroundColor: '#f5f5f5', borderTop: '4px solid var(--color-primary-gold)' }}
              >
                {/* Profile Image */}
                <img
                  src={profile.profilePicture || PLACEHOLDER_IMAGE}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 rounded-lg border-4 object-cover mx-auto mb-4"
                  style={{ borderColor: 'var(--color-primary-gold)' }}
                  onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
                />

                {/* Name */}
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary-dark)' }}>
                  {profile.firstName} {profile.lastName}
                </h1>

                {/* Course */}
                <p className="text-gray-600 font-medium mb-4">{profile.course || 'N/A'}</p>

                {/* Certified Badge */}
                {profile.verified && (
                  <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-100 mb-4">
                    <LiaCertificateSolid size={18} className='text-green-600 font-bold' />
                    <span className='text-green-600 font-bold text-sm'>CERTIFIED</span>
                  </div>
                )}
                  
                  {/* Bio  */}
                {profile.bio && (
                  <div className="font-semibold bg-[#d4a644]/10 text-[#2b2520] border border-[#2b2520]/50 rounded  py-2 px-4">
                    {profile.bio}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => navigate('/search-members')}
                  className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 mt-4"
                  style={{ backgroundColor: 'var(--color-primary-gold)' }}
                >
                  Back to Search
                </button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE - TABLES */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* TABLE 1 - PROFILE INFO */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                Profile Information
              </h2>
              <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: '#d4a644' }}>
                <div className="bg-white">
                  {/* Row 1 */}
                  <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#e5e5e5' }}>
                    <span className="font-medium text-gray-700">Identification Number</span>
                    <span className="font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                      {profile.admissionNumber || 'N/A'}
                    </span>
                  </div>
                  {/* Row 2 */}
                  <div className="flex justify-between items-center px-6 py-4">
                    <span className="font-medium text-gray-700">Certified In</span>
                    <span className="font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                      {profile.course || 'N/A'}
                    </span>
                  </div>
                  {/* Row 3 */}
                  {profile.verified && (
                    <div className="flex justify-between items-center px-6 py-4 border-t" style={{ borderColor: '#e5e5e5' }}>
                      <span className="font-medium text-gray-700">Practicing Status</span>
                      <span className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: profile.practiceStatus === 'active' ? '#2b8a3e' : '#d32f2f',
                          color: 'white'
                        }}>
                        {profile.practiceStatus === 'active' ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TABLE 2 - CONTACT INFO */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                Contact Information
              </h2>
              <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: '#d4a644' }}>
                <div className="bg-white">
                  {/* Phone */}
                  {profile.phone && (
                    <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#e5e5e5' }}>
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <FaPhone size={16} style={{ color: 'var(--color-primary-gold)' }} />
                        Phone Number
                      </span>
                      <a href={`tel:${profile.phone}`} className="font-semibold hover:opacity-70 transition" style={{ color: 'var(--color-primary-dark)' }}>
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  {/* Email */}
                  {profile.email && (
                    <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#e5e5e5' }}>
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <FaEnvelope size={16} style={{ color: 'var(--color-primary-gold)' }} />
                        Email
                      </span>
                      <a href={`mailto:${profile.email}`} className="font-semibold hover:opacity-70 transition truncate" style={{ color: 'var(--color-primary-dark)' }}>
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {/* Location */}
                  {profile.currentLocation && (
                    <div className="flex justify-between items-center px-6 py-4">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <FaMapMarkerAlt size={16} style={{ color: 'var(--color-primary-gold)' }} />
                        Current Location
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                        {profile.currentLocation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TABLE 3 - CPD RECORDS */}
            {profile.verified && years.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                  CPD Records
                </h2>
                <div className="border-2 rounded-lg overflow-x-auto" style={{ borderColor: '#d4a644' }}>
                  <table className="w-full">
                    {/* Header */}
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-primary-gold)' }}>
                        <th className="px-6 py-3 text-left font-bold text-white">Year</th>
                        <th className="px-6 py-3 text-left font-bold text-white">Practicing Status</th>
                        <th className="px-6 py-3 text-left font-bold text-white">CPD Points</th>
                      </tr>
                    </thead>
                    {/* Body */}
                    <tbody>
                      {years.map((year, idx) => {
                        const practicingStatus = getSubscriptionStatus(year)
                        const cpdScore = getCpdScore(year)
                        const isActive = practicingStatus === 'active'

                        return (
                          <tr
                            key={year}
                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            style={{
                              borderBottom: idx !== years.length - 1 ? '1px solid #e5e5e5' : 'none'
                            }}
                          >
                            {/* Year */}
                            <td className="px-6 py-4 font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                              {year}
                            </td>
                            {/* Status */}
                            <td className="px-6 py-4">
                              <span
                                className="px-3 py-1 rounded-full text-sm font-bold inline-block"
                                style={{
                                  backgroundColor: isActive ? '#2b8a3e' : '#d32f2f',
                                  color: 'white'
                                }}
                              >
                                {isActive ? '🟢 Active' : '🔴 Inactive'}
                              </span>
                            </td>
                            {/* CPD Points */}
                            <td className="px-6 py-4 font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                              {cpdScore}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
