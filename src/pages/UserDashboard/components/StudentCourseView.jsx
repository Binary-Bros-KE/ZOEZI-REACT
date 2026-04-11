import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { IoClose } from 'react-icons/io5'
import { FaUsers, FaChalkboardTeacher, FaBook, FaCalendarAlt, FaClipboardCheck, FaGraduationCap, FaPaperclip, FaSync } from 'react-icons/fa'
import AttachmentPreview from './AttachmentPreview' // Import the reusable component

const API_BASE = import.meta.env.VITE_SERVER_URL

const ATTACHMENT_TYPES = [
  { value: 'none', label: 'No Attachment', icon: FaBook },
  { value: 'youtube', label: 'YouTube Link', icon: FaBook },
  { value: 'vimeo', label: 'Vimeo Link', icon: FaBook },
  { value: 'mp4', label: 'MP4 Video', icon: FaBook },
  { value: 'pdf', label: 'PDF Document', icon: FaBook },
  { value: 'article', label: 'Article', icon: FaBook },
  { value: 'document', label: 'Document', icon: FaBook }
]

const ITEM_TYPES = {
  lesson: {
    label: 'Lesson',
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    icon: FaBook
  },
  event: {
    label: 'Event',
    color: 'bg-green-500',
    lightBg: 'bg-green-50',
    icon: FaCalendarAlt
  },
  cat: {
    label: 'CAT',
    color: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    icon: FaClipboardCheck
  },
  exam: {
    label: 'Exam',
    color: 'bg-red-500',
    lightBg: 'bg-red-50',
    icon: FaGraduationCap
  }
}

const StudentCourseView = ({ userData, courseId }) => {
  // log course id
  console.log("Course ID:", courseId);
  const [curriculum, setCurriculum] = useState(null)
  const [courseEnroll, setCourseEnroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedItemId, setExpandedItemId] = useState(null)
  const [activeTab, setActiveTab] = useState('materials') // 'materials' or 'discussions'
  const [discussions, setDiscussions] = useState([])
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false)
  const [newDiscussionForm, setNewDiscussionForm] = useState({
    title: '',
    curriculumItemId: null
  })
  const [submitting, setSubmitting] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [attachments, setAttachments] = useState([{ type: 'none', url: '', title: '' }])
  const [refreshing, setRefreshing] = useState(false)

  // Get userType from localStorage
  const userType = localStorage.getItem('userType')

  // Fetch curriculum on mount - Auto-fetch from curriculum reference
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        if (!userData || !courseId) return

        // Find the course enrollment in user's courses array
        const courseEnrollment = userData.courses?.find(c => String(c.courseId) === String(courseId) || String(c._id) === String(courseId))
        if (!courseEnrollment) {
          toast.error('Course enrollment not found')
          setLoading(false)
          return
        }

        setCourseEnroll(courseEnrollment)

        // Fetch curriculum by courseId (curriculums are unique by course)
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/curriculums`)
        const json = await res.json()

        if (json.status === 'success') {
          // Find curriculum that matches this courseId
          const curriculum = json.data.curriculums?.find(c => String(c.courseId) === String(courseId))
          if (curriculum) {
            setCurriculum(curriculum)
          } else {
            toast.error('Curriculum not yet assigned to this course')
          }
        } else {
          toast.error(json.message || 'Failed to fetch curriculum')
        }
      } catch (err) {
        console.error('Fetch curriculum error:', err)
        toast.error('Failed to fetch curriculum')
      } finally {
        setLoading(false)
      }
    }

    fetchCurriculum()
  }, [courseId, userData])


 // Handle payment notification close - UPDATED to include userType
  const handleHidePaymentNotification = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/student-curriculum/hide-payment-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          courseId,
          userType // Add userType to body
        })
      })

      const json = await res.json()
      if (json.status === 'success') {
        setCourseEnroll(prev => ({ ...prev, paymentNotificationHidden: true }))
        toast.success('Notification closed')
      } else {
        toast.error(json.message || 'Failed to hide notification')
      }
    } catch (err) {
      console.error('Hide notification error:', err)
      toast.error('Failed to hide notification')
    }
  }

  // Load discussions from userData
  useEffect(() => {
    if (userData?.discussions) {
      // Filter discussions for this course
      const courseDiscussions = userData.discussions.filter(d => 
        String(d.curriculumId) === curriculum?._id
      )
      setDiscussions(courseDiscussions)
    }
  }, [userData, curriculum])

  // Handle refreshing discussion messages
  const handleRefreshDiscussion = async (discussionId) => {
    setRefreshing(true)
    try {
      const userType = localStorage.getItem('userType')
      const token = localStorage.getItem('token')
      
      if (!userData?._id || !userType || !token) {
        throw new Error('Missing user information')
      }

      const res = await fetch(`${API_BASE}/users/${userData._id}?userType=${userType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to refresh messages')
      }

      const data = await res.json()
      const freshData = data.data || data

      // Update discussions from the fresh userData
      if (freshData?.discussions && Array.isArray(freshData.discussions)) {
        const courseDiscussions = freshData.discussions.filter(
          d => String(d.curriculumId) === String(curriculum?._id)
        )
        setDiscussions(courseDiscussions)
        
        // Update selected discussion if it exists
        if (selectedDiscussion) {
          const updatedDiscussion = courseDiscussions.find(d => String(d._id) === String(selectedDiscussion._id))
          if (updatedDiscussion) {
            setSelectedDiscussion(updatedDiscussion)
            toast.success('Messages refreshed!')
          } else {
            toast.info('Discussion not found')
          }
        }
      } else {
        throw new Error('No discussions data in response')
      }
    } catch (err) {
      console.error('Failed to refresh messages:', err)
      toast.error(err.message || 'Failed to refresh messages')
    } finally {
      setRefreshing(false)
    }
  }

  // Add attachment field
  const addAttachmentField = () => {
    setAttachments([...attachments, { type: 'none', url: '', title: '' }])
  }

  // Remove attachment field
  const removeAttachmentField = (index) => {
    if (attachments.length > 1) {
      const newAttachments = attachments.filter((_, i) => i !== index)
      setAttachments(newAttachments)
    }
  }

  // Update attachment field
  const updateAttachment = (index, field, value) => {
    const newAttachments = [...attachments]
    newAttachments[index] = { ...newAttachments[index], [field]: value }
    setAttachments(newAttachments)
  }

  // Handle submitting response/assignment - creates a discussion
  const handleSubmitResponse = async (itemId, itemName) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    // Validate attachments
    const validAttachments = attachments.filter(att =>
      att.type !== 'none' && att.url.trim() && att.title.trim()
    )

    if (validAttachments.length === 0 && attachments.some(att => att.type !== 'none')) {
      toast.error('Please provide complete attachment details (type, URL, and title)')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      
      // First create a discussion for this item
      const discussionRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Assignment/Question: ${itemName}`,
          curriculumId: curriculum._id,
          itemId: itemId,
          userType,
          initialMessage: responseText,
          attachments: validAttachments
        })
      })

      const discussionJson = await discussionRes.json()
      
      if (discussionJson.status === 'success') {
        toast.success('Response submitted! A discussion has been created.')
        setResponseText('')
        setAttachments([{ type: 'none', url: '', title: '' }])
        // Update discussions list
        setDiscussions([...discussions, discussionJson.data.discussion])
        // Switch to discussions tab to show the new discussion
        setActiveTab('discussions')
        setSelectedDiscussion(discussionJson.data.discussion)
      } else {
        toast.error(discussionJson.message || 'Failed to submit response')
      }
    } catch (err) {
      console.error('Submit response error:', err)
      toast.error('Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle sending a message in a discussion
  const handleSendMessage = async (discussionId) => {
    if (!newMessage.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/discussions/${discussionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newMessage,
          userType
        })
      })

      const json = await res.json()
      if (json.status === 'success') {
        toast.success('New text posted in Discussion')
        setNewMessage('')
        // Update discussions
        const updatedDiscussions = discussions.map(d => 
          d._id === discussionId ? json.data.discussion : d
        )
        setDiscussions(updatedDiscussions)
        setSelectedDiscussion(json.data.discussion)
      } else {
        toast.error(json.message || 'Failed to send message')
      }
    } catch (err) {
      console.error('Send message error:', err)
      toast.error('Failed to send message')
    }
  }

  // Handle creating a new discussion
  const handleCreateDiscussion = async () => {
    if (!newDiscussionForm.title.trim()) {
      toast.error('Discussion title is required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newDiscussionForm.title,
          curriculumId: curriculum._id,
          itemId: newDiscussionForm.curriculumItemId,
          userType
        })
      })

      const json = await res.json()
      if (json.status === 'success') {
        toast.success('Discussion created')
        setShowNewDiscussionModal(false)
        setNewDiscussionForm({ title: '', curriculumItemId: null })
        setDiscussions([...discussions, json.data.discussion])
        setSelectedDiscussion(json.data.discussion)
      } else {
        toast.error(json.message || 'Failed to create discussion')
      }
    } catch (err) {
      console.error('Create discussion error:', err)
      toast.error('Failed to create discussion')
    }
  }

  // Calculate progress
  const calculateProgress = () => {
    if (!curriculum || !curriculum.items || curriculum.items.length === 0) return 0
    const completed = curriculum.items.filter(item => item.isCompleted).length
    return Math.round((completed / curriculum.items.length) * 100)
  }

  // Check if item is released
  const isItemReleased = (item) => {
    if (!item.releaseDate) return true
    try {
      const releaseDateTime = new Date(`${item.releaseDate}T${item.releaseTime || '00:00'}`)
      return new Date() >= releaseDateTime
    } catch (err) {
      return true
    }
  }

  // Check if item is due
  const isItemDue = (item) => {
    if (!item.dueDate) return false
    try {
      const dueDateTime = new Date(`${item.dueDate}T${item.dueTime || '23:59'}`)
      return new Date() >= dueDateTime
    } catch (err) {
      return false
    }
  }

  // Format date/time for display
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      const dateOnly = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      const time = timeString || '00:00'
      return `${dateOnly} at ${time}`
    } catch (err) {
      return 'Invalid Date'
    }
  }

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    const colors = {
      'PAID': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading curriculum...</p>
        </div>
      </div>
    )
  }

  if (!curriculum) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h2 className='text-2xl font-bold text-gray-400 mb-4'>
          Curriculum Not Available
        </h2>
        <p className='text-lg text-gray-600 mb-4'>The curriculum for this course is currently being prepared</p>
      </div>
    )
  }

  const progress = calculateProgress()
  const showPaymentWidget =
    courseEnroll &&
    !courseEnroll.paymentNotificationHidden &&
    courseEnroll.payment &&
    courseEnroll.payment.status

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'materials'
              ? 'border-b-2 border-brand-gold text-brand-gold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Course Materials
        </button>
        <button
          onClick={() => setActiveTab('discussions')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'discussions'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Discussions ({discussions.length})
        </button>
      </div>

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <>
          {/* Course Info Widget */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-brand-gold">
            <h3 className="text-lg font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <FaBook /> Course Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Curriculum Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Course Name</p>
                    <p className="font-medium text-brand-dark">{curriculum.courseName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Curriculum Items</p>
                    <p className="font-medium text-brand-dark">{curriculum.items?.length || 0} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-green-600">✓ Active</p>
                  </div>
                </div>
              </div>

              {courseEnroll?.tutor && courseEnroll.tutor.id && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaChalkboardTeacher /> Your Tutor
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-brand-dark">{courseEnroll.tutor.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-brand-gold">{courseEnroll.tutor.email}</p>
                    </div>
                    {courseEnroll.tutor.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-brand-dark">{courseEnroll.tutor.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-brand-dark">Course Progress</h3>
              <span className="text-2xl font-bold text-brand-gold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-gold to-accent-orange h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {curriculum.items?.filter(i => i.isCompleted).length || 0} of {curriculum.items?.length || 0} items completed
            </p>
          </div>

          {/* Payment Notification Widget */}
          {showPaymentWidget && (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-brand-gold">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-brand-dark mb-2">Payment Status</h4>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(courseEnroll.payment.status)}`}>
                      {courseEnroll.payment.status}
                    </span>
                    {courseEnroll.payment.paidDate && (
                      <span className="text-sm text-gray-600">
                        Paid on {new Date(courseEnroll.payment.paidDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleHidePaymentNotification}
                  className="text-gray-400 hover:text-gray-600 transition"
                  title="Close notification"
                >
                  <IoClose size={24} />
                </button>
              </div>
            </div>
          )}

          {/* Curriculum Items */}
          <div className="bg-white rounded-lg shadow-md p-6 max-md:p-2">
            <h4 className="font-semibold text-brand-dark mb-6 text-xl">Course Materials</h4>

            {(!curriculum.items || curriculum.items.length === 0) ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No curriculum items yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {curriculum.items.map((item, idx) => {
                  const released = isItemReleased(item)
                  const due = isItemDue(item)
                  const isExpanded = expandedItemId === item._id
                  const type = ITEM_TYPES[item.type] || ITEM_TYPES.lesson
                  const TypeIcon = type.icon
                  const hasAttachments = item.attachments?.length > 0

                  return (
                    <div key={item._id} className={`border rounded-lg overflow-hidden transition-all ${released ? 'border-gray-300 hover:shadow-md' : 'border-gray-200 opacity-60'}`}>
                      {/* Item Header */}
                      <div
                        onClick={() => {
                          if (released) setExpandedItemId(isExpanded ? null : item._id)
                        }}
                        className={`p-5 ${released ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-700">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${type.color} text-white flex items-center gap-1`}>
                                  <TypeIcon size={10} /> {type.label}
                                </span>
                                {item.isCompleted && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    COMPLETED
                                  </span>
                                )}
                                {!released && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                    UPCOMING
                                  </span>
                                )}
                                {due && released && !item.isCompleted && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                    OVERDUE
                                  </span>
                                )}
                              </div>
                              <h5 className="font-semibold text-brand-dark text-lg">{item.name}</h5>

                              {item.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                              )}

                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                {hasAttachments && (
                                  <span className="flex items-center gap-1">
                                    <FaBook size={10} /> {item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>

                              {/* Release/Due dates */}
                              <div className="flex gap-6 text-xs text-gray-600 mt-3">
                                {item.releaseDate && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Available:</span> {formatDateTime(item.releaseDate, item.releaseTime)}
                                  </div>
                                )}
                                {item.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Due:</span> {formatDateTime(item.dueDate, item.dueTime)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {released && (
                            <button className="text-brand-gold hover:text-brand-brown transition text-lg">
                              {isExpanded ? '▼' : '▶'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Item Details - Expandable */}
                      {isExpanded && released && (
                        <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-6">
                          {/* Description */}
                          {item.description && (
                            <div>
                              <h6 className="font-semibold text-brand-dark mb-2">Description</h6>
                              <p className="text-gray-700">{item.description}</p>
                            </div>
                          )}

                          {/* Attachments using reusable component */}
                          {hasAttachments && (
                            <div className="mt-4">
                              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FaPaperclip /> Attachments ({item.attachments.length})
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {item.attachments.map((attachment, idx) => (
                                  <AttachmentPreview
                                    key={idx}
                                    type={attachment.type}
                                    url={attachment.url}
                                    title={attachment.title}
                                    className="h-full"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quick Discussion Button */}
                          <div className="pt-6 border-t border-gray-200">
                            <h6 className="font-semibold text-brand-dark mb-4">Submit Assignment / Ask Question</h6>
                            <div className="space-y-4">
                              <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Type your answer, submission, or question here..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 resize-none"
                                rows="4"
                                disabled={submitting}
                              />

                              {/* Multiple Attachments */}
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <label className="block text-sm font-semibold text-brand-dark">
                                    Attachments (Optional)
                                  </label>
                                  <button
                                    type="button"
                                    onClick={addAttachmentField}
                                    className="text-sm text-purple-500 hover:text-purple-700 flex items-center gap-1"
                                    disabled={submitting}
                                  >
                                    <FaBook size={12} /> Add Attachment
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  {attachments.map((attachment, index) => (
                                    <div key={index} className="p-3 border border-gray-200 rounded-lg bg-white">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Attachment {index + 1}</span>
                                        {attachments.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeAttachmentField(index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                            disabled={submitting}
                                          >
                                            Remove
                                          </button>
                                        )}
                                      </div>

                                      {/* Attachment Type */}
                                      <div className="mb-2">
                                        <select
                                          value={attachment.type}
                                          onChange={(e) => updateAttachment(index, 'type', e.target.value)}
                                          disabled={submitting}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                                        >
                                          {ATTACHMENT_TYPES.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Title */}
                                      <div className="mb-2">
                                        <input
                                          type="text"
                                          value={attachment.title}
                                          onChange={(e) => updateAttachment(index, 'title', e.target.value)}
                                          placeholder="Attachment title"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                                          disabled={submitting}
                                        />
                                      </div>

                                      {/* URL */}
                                      {attachment.type !== 'none' && (
                                        <div>
                                          <input
                                            type="url"
                                            value={attachment.url}
                                            onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                                            placeholder="https://example.com/file"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                                            disabled={submitting}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={() => handleSubmitResponse(item._id, item.name)}
                                disabled={submitting}
                                className="w-full px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submitting ? 'Submitting...' : 'Submit Response'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Create New Discussion Button */}
          <button
            onClick={() => setShowNewDiscussionModal(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition"
          >
            + New Discussion
          </button>

          {/* New Discussion Modal */}
          {showNewDiscussionModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-purple-600 mb-4">Start New Discussion</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discussion Title</label>
                    <input
                      type="text"
                      value={newDiscussionForm.title}
                      onChange={(e) => setNewDiscussionForm({...newDiscussionForm, title: e.target.value})}
                      placeholder="e.g., Question about Lesson 1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Related To (Optional)</label>
                    <select
                      value={newDiscussionForm.curriculumItemId || ''}
                      onChange={(e) => setNewDiscussionForm({...newDiscussionForm, curriculumItemId: e.target.value || null})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select an item...</option>
                      {curriculum?.items?.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateDiscussion}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold rounded-lg hover:shadow-md transition"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewDiscussionModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Discussions List - Expandable Accordion */}
          {discussions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No discussions yet</p>
              <button
                onClick={() => setShowNewDiscussionModal(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                Start One Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {discussions.map((discussion) => (
                <div
                  key={discussion._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Discussion Header - Clickable */}
                  <button
                    onClick={() => setSelectedDiscussion(
                      selectedDiscussion?._id === discussion._id ? null : discussion
                    )}
                    className="w-full text-left p-4 hover:bg-purple-50 transition flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{discussion.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{discussion.messages?.length || 0} messages</span>
                        <span>{new Date(discussion.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-purple-500 text-xl">
                      {selectedDiscussion?._id === discussion._id ? '▼' : '▶'}
                    </div>
                  </button>

                  {/* Expanded Discussion - Messages */}
                  {selectedDiscussion?._id === discussion._id && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {/* Refresh Button */}
                      <div className="p-3 border-b border-gray-200 flex justify-end">
                        <button
                          onClick={() => handleRefreshDiscussion(discussion._id)}
                          disabled={refreshing}
                          title="Refresh messages"
                          className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                          {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                      </div>
                      {/* Discussion Messages */}
                      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                        {discussion.messages?.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>
                        ) : (
                          discussion.messages?.map(msg => (
                            <div
                              key={msg._id}
                              className={`flex ${msg.senderType === 'student' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs px-4 py-3 rounded-lg ${
                                  msg.senderType === 'student'
                                    ? 'bg-purple-100 text-purple-900 rounded-br-none'
                                    : 'bg-brand-gold/20 text-brand-dark rounded-bl-none'
                                }`}
                              >
                                <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-xs mt-1 ${
                                  msg.senderType === 'student'
                                    ? 'text-purple-700'
                                    : 'text-brand-gold'
                                }`}>
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Message Input */}
                      <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSendMessage(discussion._id)
                            }}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                          />
                          <button
                            onClick={() => handleSendMessage(discussion._id)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold rounded-lg hover:shadow-md transition"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StudentCourseView