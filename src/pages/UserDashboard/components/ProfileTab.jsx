import React, { useState } from 'react'
import { FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function ProfileTab({ userData }) {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = React.useRef(null)
  const [editData, setEditData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('section', 'profile')

      const response = await fetch(`${API_BASE_URL}/alumni/${userData._id}/update`, {
        method: 'PUT',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image')
      }

      const updatedUser = {
        ...userData,
        profilePicture: data.data.profilePicture,
        profilePicPublicId: data.data.profilePicPublicId,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.location.reload()
      toast.success('Profile picture updated successfully!')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleEditStart = () => {
    setEditData({ ...userData })
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditData({ ...userData })
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/alumni/${userData._id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'public',
          data: {
            firstName: editData.firstName,
            lastName: editData.lastName,
            email: editData.email,
            phone: editData.phone,
            currentLocation: editData.currentLocation,
            bio: editData.bio,
            nextOfKinName: editData.nextOfKinName,
            nextOfKinRelationship: editData.nextOfKinRelationship,
            nextOfKinPhone: editData.nextOfKinPhone,
            practiceStatus: editData.practiceStatus,
            isPublicProfileEnabled: editData.isPublicProfileEnabled,
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      const updatedUser = { ...userData, ...editData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.location.reload()
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>📋 Edit Profile</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
          {/* Profile Picture Section */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-primary-dark)' }}>Profile Picture</label>
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <img
                src={editData.profilePicture?.url || editData?.profilePicture || '/placeholder-profile.jpg'}
                alt="Profile"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-2"
                style={{ borderColor: 'var(--color-primary-gold)' }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
                style={{ backgroundColor: 'var(--color-primary-gold)', color: 'var(--color-primary-dark)' }}
              >
                <FaCamera /> {isUploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <FormInput
              label="First Name"
              value={editData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
            <FormInput
              label="Last Name"
              value={editData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
            <FormInput
              label="Email"
              type="email"
              value={editData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <FormInput
              label="Phone"
              type="tel"
              value={editData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            <div className="sm:col-span-2">
              <FormInput
                label="Current Location"
                value={editData.currentLocation || ''}
                onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* // Add this after the two-column grid and before the emergency contact section */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>Bio</label>
            <textarea
              value={editData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself, your experience, and interests..."
              className="w-full px-3 sm:px-4 py-2 border rounded-lg outline-none focus:ring-2 transition text-sm sm:text-base min-h-[120px] resize-none"
              style={{
                borderColor: 'var(--color-text-light)',
                color: 'var(--color-primary-dark)'
              }}
              maxLength={500}
            />
            <div className="text-right text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>
              {editData.bio?.length || 0}/500 characters
            </div>
          </div>


          {/* Emergency Contact Section */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--color-text-light)' }}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: 'var(--color-primary-dark)' }}>🚨 Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <FormInput
                  label="Name"
                  value={editData.nextOfKinName || ''}
                  onChange={(e) => handleInputChange('nextOfKinName', e.target.value)}
                />
              </div>
              <FormInput
                label="Relationship"
                value={editData.nextOfKinRelationship || ''}
                onChange={(e) => handleInputChange('nextOfKinRelationship', e.target.value)}
              />
              <FormInput
                label="Phone"
                type="tel"
                value={editData.nextOfKinPhone || ''}
                onChange={(e) => handleInputChange('nextOfKinPhone', e.target.value)}
              />
            </div>
          </div>

          {/* Practice Status & Visibility */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--color-text-light)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormSelect
                label="Practice Status"
                value={editData.practiceStatus || 'active'}
                onChange={(e) => handleInputChange('practiceStatus', e.target.value)}
                options={[
                  { value: 'active', label: '🟢 Active' },
                  { value: 'inactive', label: '⚫ Inactive' },
                  { value: 'on_leave', label: '🟡 On Leave' },
                  { value: 'retired', label: '⭕ Retired' }
                ]}
              />
              <FormSelect
                label="Public Visibility"
                value={editData.isPublicProfileEnabled ? 'visible' : 'hidden'}
                onChange={(e) => handleInputChange('isPublicProfileEnabled', e.target.value === 'visible')}
                options={[
                  { value: 'visible', label: '✅ Visible' },
                  { value: 'hidden', label: '❌ Hidden' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium text-sm sm:text-base"
            style={{ backgroundColor: 'var(--color-primary-gold)', color: 'var(--color-primary-dark)' }}
          >
            <FaSave /> {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleEditCancel}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg hover:opacity-80 disabled:opacity-50 transition font-medium text-sm sm:text-base"
            style={{ backgroundColor: 'var(--color-text-light)', color: 'var(--color-text-white)' }}
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>📋 Profile Information</h2>

        {/* ADD THIS BUTTON */}
        <button
          onClick={handleEditStart}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg hover:opacity-90 transition font-medium text-sm sm:text-base"
          style={{ backgroundColor: 'var(--color-primary-gold)', color: 'var(--color-primary-dark)' }}
        >
          <FaEdit /> Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-4 sm:pb-6 border-b" style={{ borderColor: 'var(--color-text-light)' }}>
          <img
            src={userData.profilePicture?.url || editData?.profilePicture || '/placeholder-profile.jpg'}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-3 max-md:mx-auto"
            style={{ borderColor: 'var(--color-primary-gold)' }}
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="capitalize text-base sm:text-lg mt-1" style={{ color: 'var(--color-primary-brown)' }}>
              {userData.practiceStatus?.replace('_', ' ')}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>
              {userData.verified ? '✅ Verified Professional' : 'Verification Pending'}
            </p>
          </div>
        </div>

        {/* Info Grid */}
         <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: 'var(--color-primary-dark)' }}>📝 Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <InfoItem label="Email" value={userData.email} />
          <InfoItem label="Phone" value={userData.phone} />
          <InfoItem label="Location" value={userData.currentLocation} />
          <InfoItem label="Admission #" value={userData.admissionNumber} />
          <InfoItem label="Course" value={userData.course} />
        </div>

        {/* Bio Section - Add this if bio exists */}
        {userData.bio && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--color-text-light)' }}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: 'var(--color-primary-dark)' }}>📝 About Me</h3>
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-primary-dark)' }}>
              {userData.bio}
            </p>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--color-text-light)' }}>
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: 'var(--color-primary-dark)' }}>🚨 Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Name" value={userData.nextOfKinName} />
            <InfoItem label="Relationship" value={userData.nextOfKinRelationship} />
            <div className="sm:col-span-2">
              <InfoItem label="Phone" value={userData.nextOfKinPhone} />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--color-text-light)' }}>
          <h3 className="text-base sm:text-lg font-bold mb-3" style={{ color: 'var(--color-primary-dark)' }}>⚙️ Settings</h3>
          <InfoItem
            label="Public Profile"
            value={userData.isPublicProfileEnabled ? '✅ Visible to public' : '❌ Hidden from public'}
          />
        </div>
      </div>
    </motion.div>
  )
}

function FormInput({ label, type = 'text', value, onChange, placeholder = '' }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 sm:px-4 py-2 border rounded-lg outline-none focus:ring-2 transition text-sm sm:text-base"
        style={{
          borderColor: 'var(--color-text-light)',
          color: 'var(--color-primary-dark)'
        }}
      />
    </div>
  )
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 sm:px-4 py-2 border rounded-lg outline-none focus:ring-2 transition text-sm sm:text-base"
        style={{
          borderColor: 'var(--color-text-light)',
          color: 'var(--color-primary-dark)'
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-light)' }}>{label}</p>
      <p className="font-medium" style={{ color: 'var(--color-primary-dark)' }}>{value || '—'}</p>
    </div>
  )
}
