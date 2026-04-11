import { FaLock, FaUser, FaMapMarkerAlt, FaPhone, FaUpload, FaEye, FaEyeSlash, FaTimes, FaUserFriends, FaHeart, FaSync } from 'react-icons/fa'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useState, useRef, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function SettingsTab({ userData, onUserUpdate }) {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const fileInputRef = useRef(null)

  // State for fresh user data
  const [freshUserData, setFreshUserData] = useState(userData)

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  })

  // Profile state - initialize with fresh data
  const [profileForm, setProfileForm] = useState({
    location: '',
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinPhone: '',
    isActive: true,
    isPublicProfileEnabled: true,
  })

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState({
    file: null,
    preview: null,
    uploading: false
  })

  // Fetch fresh user data on component mount and when userData changes
  useEffect(() => {
    fetchFreshUserData();
  }, [userData?._id, userData?.userType]);

  // Update profile form when freshUserData changes
  useEffect(() => {
    if (freshUserData) {
      setProfileForm({
        location: freshUserData?.currentLocation || '',
        nextOfKinName: freshUserData?.nextOfKinName || '',
        nextOfKinRelationship: freshUserData?.nextOfKinRelationship || '',
        nextOfKinPhone: freshUserData?.nextOfKinPhone || '',
        isActive: freshUserData?.isActive !== false,
        isPublicProfileEnabled: freshUserData?.isPublicProfileEnabled !== false,
      });

      setProfilePicture(prev => ({
        ...prev,
        preview: freshUserData?.profilePicture?.url || null
      }));
    }
  }, [freshUserData]);

  // Function to fetch fresh user data
  const fetchFreshUserData = async () => {
    if (!userData?._id || !userData?.userType) return;

    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: userData._id,
          userType: userData.userType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user data');
      }

      const newUserData = data.data.user;
      setFreshUserData(newUserData);

      // Update localStorage with fresh data
      updateLocalStorageUserData(newUserData);

      // Notify parent component about the update
      if (onUserUpdate) {
        onUserUpdate(newUserData);
      }

    } catch (error) {
      console.error('Fetch user data error:', error);
      // If fresh data fetch fails, fall back to original userData
      setFreshUserData(userData);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to update user data in localStorage
  const updateLocalStorageUserData = (newUserData) => {
    try {
      // Get current token
      const token = localStorage.getItem('token');
      if (token) {
        // Create updated user object
        const updatedUser = {
          ...newUserData,
          userType: userData.userType // Preserve userType
        };

        // If you store user data in a more global way, update that too
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  // Refresh user data manually
  const handleRefreshData = () => {
    fetchFreshUserData();
    toast.success('Data refreshed!');
  };

  // Password functions
  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          userType: userData.userType,
          userId: userData._id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      })
      toast.success('Password changed successfully!')

      // Refresh user data after password change
      fetchFreshUserData();

    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  // Profile functions
  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userData._id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentLocation: profileForm.location,
          nextOfKinName: profileForm.nextOfKinName,
          nextOfKinRelationship: profileForm.nextOfKinRelationship,
          nextOfKinPhone: profileForm.nextOfKinPhone,
          isActive: profileForm.isActive,
          isPublicProfileEnabled: profileForm.isPublicProfileEnabled,
          userType: userData.userType
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      toast.success('Profile updated successfully!')

      // Refresh user data after profile update
      fetchFreshUserData();

    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Profile picture functions
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      setProfilePicture(prev => ({
        ...prev,
        file,
        preview: URL.createObjectURL(file)
      }))
    }
  }

  const handleProfilePictureUpload = async () => {
    if (!profilePicture.file) {
      toast.error('Please select an image first')
      return
    }

    setProfilePicture(prev => ({ ...prev, uploading: true }))

    try {
      const formData = new FormData()
      formData.append('profilePicture', profilePicture.file)
      formData.append('userType', userData.userType)
      formData.append('userId', userData._id)

      const response = await fetch(`${API_BASE_URL}/users/${userData._id}/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile picture')
      }

      toast.success('Profile picture updated successfully!')

      // Update preview with the new URL from server and reset file
      setProfilePicture(prev => ({
        file: null,
        preview: data.data.profilePicture.url,
        uploading: false
      }))

      // Refresh user data to get the updated profile picture
      fetchFreshUserData();

    } catch (error) {
      console.error('Profile picture upload error:', error)
      toast.error(error.message || 'Failed to upload profile picture')
      setProfilePicture(prev => ({ ...prev, uploading: false }))
    }
  }

  const removeProfilePicture = () => {
    setProfilePicture({
      file: null,
      preview: null,
      uploading: false
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
          ⚙️ Account Settings
        </h2>
        <button
          onClick={handleRefreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-yellow disabled:opacity-50 transition cursor-pointer"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Profile Photo Widget */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-brand-gold text-white">
            <FaUser size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              Profile Photo
            </h3>
            <p className="text-sm text-gray-600">Update your profile picture</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Photo Preview */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-brand-gold overflow-hidden bg-gray-100">
                {profilePicture.preview ? (
                  <img
                    src={profilePicture.preview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaUser size={48} />
                  </div>
                )}
              </div>
              {profilePicture.preview && (
                <button
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <FaTimes size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
                id="profilePicture"
              />
              <label
                htmlFor="profilePicture"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-yellow transition cursor-pointer cursor-pointer"
              >
                <FaUpload /> Choose Image
              </label>
              <p className="text-sm text-gray-600 mt-2">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>

            {profilePicture.file && (
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  Selected: {profilePicture.file.name}
                </p>
                <button
                  onClick={handleProfilePictureUpload}
                  disabled={profilePicture.uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition cursor-pointer"
                >
                  <FaUpload />
                  {profilePicture.uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information Widget */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-blue-500 text-white">
            <FaMapMarkerAlt size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              Profile Information
            </h3>
            <p className="text-sm text-gray-600">Update your location and emergency contact details</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Location Section */}
          <div>
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary-dark)' }}>
              <FaMapMarkerAlt /> Location Information
            </h4>
            <div className="max-w-md">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                Current Location
              </label>
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) => handleProfileChange('location', e.target.value)}
                placeholder="Enter your current location"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition"
                style={{
                  borderColor: 'var(--color-text-light)',
                  color: 'var(--color-primary-dark)'
                }}
              />
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div>
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary-dark)' }}>
              <FaHeart /> Emergency Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                  Next of Kin Name
                </label>
                <input
                  type="text"
                  value={profileForm.nextOfKinName}
                  onChange={(e) => handleProfileChange('nextOfKinName', e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition"
                  style={{
                    borderColor: 'var(--color-text-light)',
                    color: 'var(--color-primary-dark)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                  Relationship
                </label>
                <select
                  value={profileForm.nextOfKinRelationship}
                  onChange={(e) => handleProfileChange('nextOfKinRelationship', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition cursor-pointer"
                  style={{
                    borderColor: 'var(--color-text-light)',
                    color: 'var(--color-primary-dark)'
                  }}
                >
                  <option value="">Select relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Relative">Relative</option>
                  <option value="Friend">Friend</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-primary-dark)' }}>
                  <FaPhone /> Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.nextOfKinPhone}
                  onChange={(e) => handleProfileChange('nextOfKinPhone', e.target.value)}
                  placeholder="Emergency contact phone number"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition"
                  style={{
                    borderColor: 'var(--color-text-light)',
                    color: 'var(--color-primary-dark)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div>
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary-dark)' }}>
              <FaUserFriends /> Account Settings
            </h4>
            <div className="space-y-3 max-w-md">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileForm.isActive}
                  onChange={(e) => handleProfileChange('isActive', e.target.checked)}
                  className="rounded border-brand-gold text-brand-gold focus:ring-brand-gold"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-primary-dark)' }}>
                  Account Active
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileForm.isPublicProfileEnabled}
                  onChange={(e) => handleProfileChange('isPublicProfileEnabled', e.target.checked)}
                  className="rounded border-brand-gold text-brand-gold focus:ring-brand-gold"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-primary-dark)' }}>
                  Public Profile Visible
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium w-full max-w-md mt-4 cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary-gold)', color: 'var(--color-primary-dark)' }}
          >
            <FaUser /> {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Password Change Widget */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-green-500 text-white">
            <FaLock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              Change Password
            </h3>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <PasswordInputField
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
            showPassword={passwordForm.showCurrentPassword}
            onToggle={() => togglePasswordVisibility('showCurrentPassword')}
            placeholder="Enter current password"
          />

          <PasswordInputField
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
            showPassword={passwordForm.showNewPassword}
            onToggle={() => togglePasswordVisibility('showNewPassword')}
            placeholder="Enter new password"
          />

          <PasswordInputField
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
            showPassword={passwordForm.showConfirmPassword}
            onToggle={() => togglePasswordVisibility('showConfirmPassword')}
            placeholder="Confirm new password"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium w-full mt-6"
            style={{ backgroundColor: 'var(--color-primary-gold)', color: 'var(--color-primary-dark)' }}
          >
            <FaLock /> {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Account Help Widget */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-500 text-white">
            <FaPhone size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-800">Need Help?</h3>
            <p className="text-sm text-blue-700 mt-1">
              If you want to delete your account or need other assistance, please contact the administrator with your details.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Password Input Component (unchanged)
function PasswordInputField({ label, value, onChange, showPassword, onToggle, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-12 border rounded-lg outline-none focus:ring-2 transition"
          style={{
            borderColor: 'var(--color-text-light)',
            color: 'var(--color-primary-dark)'
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition cursor-pointer"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  )
}