import React, { useEffect, useState } from 'react'
import { FaComment, FaSearch, FaTimes, FaPaperPlane, FaSpinner, FaUser, FaSync } from 'react-icons/fa'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_SERVER_URL

export default function StudentDiscussions({ userData }) {
  const [students, setStudents] = useState([])
  const [discussions, setDiscussions] = useState([]) // Flattened list of all discussions
  const [filteredDiscussions, setFilteredDiscussions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [curriculum, setCurriculum] = useState(null)
  const [curriculumLoading, setCurriculumLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showDiscussions, setShowDiscussions] = useState(true)
  const [markingComplete, setMarkingComplete] = useState(null)

  const tutorId = userData?._id
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  // Fetch all students assigned to this tutor
  useEffect(() => {
    if (tutorId) {
      fetchStudents()
    }
  }, [tutorId])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/tutors/${tutorId}/students`, {
        method: 'GET',
        headers: authHeader()
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch students')

      // Store students and load their discussions
      setStudents(data.data || [])
      await loadDiscussionsFromStudents(data.data || [])
    } catch (err) {
      console.error('Failed to load students:', err)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  // Load discussions from all students
  const loadDiscussionsFromStudents = async (studentsList) => {
    try {
      const allDiscussions = []

      // Extract discussions from students data (already loaded from backend)
      studentsList.forEach(student => {
        if (student.discussions && Array.isArray(student.discussions)) {
          student.discussions.forEach(discussion => {
            allDiscussions.push({
              ...discussion,
              studentId: student._id,
              studentName: `${student.firstName} ${student.lastName}`,
              studentEmail: student.email,
              studentPhone: student.phone,
              userType: student.userType || 'student'
            })
          })
        }
      })

      setDiscussions(allDiscussions)
      setFilteredDiscussions(allDiscussions)
    } catch (err) {
      console.error('Failed to load discussions:', err)
    }
  }

  // Filter discussions based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDiscussions(discussions)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = discussions.filter(d =>
        d.title?.toLowerCase().includes(term) ||
        d.studentName?.toLowerCase().includes(term) ||
        d.studentEmail?.toLowerCase().includes(term) ||
        d.messages?.some(m => m.message?.toLowerCase().includes(term))
      )
      setFilteredDiscussions(filtered)
    }
  }, [searchTerm, discussions])

  // Handle refreshing discussion messages
  const handleRefreshMessages = async () => {
    if (!selectedDiscussion) return

    setRefreshing(true)
    try {
      // Fetch fresh student data to get updated discussions
      const res = await fetch(`${API_BASE}/users/${selectedDiscussion.studentId}?userType=${selectedDiscussion.userType}`, {
        method: 'GET',
        headers: authHeader()
      })

      if (!res.ok) throw new Error('Failed to refresh messages')
      const data = await res.json()
      const studentData = data.data || data

      // Find the updated discussion
      if (studentData.discussions && Array.isArray(studentData.discussions)) {
        const updatedDiscussion = studentData.discussions.find(d => String(d._id) === String(selectedDiscussion._id))
        if (updatedDiscussion) {
          // Add student info back to the discussion
          const enrichedDiscussion = {
            ...updatedDiscussion,
            studentId: selectedDiscussion.studentId,
            studentName: selectedDiscussion.studentName,
            studentEmail: selectedDiscussion.studentEmail,
            studentPhone: selectedDiscussion.studentPhone,
            userType: selectedDiscussion.userType
          }
          setSelectedDiscussion(enrichedDiscussion)
          setDiscussions(prev =>
            prev.map(d =>
              String(d._id) === String(selectedDiscussion._id) ? enrichedDiscussion : d
            )
          )
          toast.success('Messages refreshed!')
        }
      }
    } catch (err) {
      console.error('Failed to refresh messages:', err)
      toast.error('Failed to refresh messages')
    } finally {
      setRefreshing(false)
    }
  }

  // Handle sending reply
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!selectedDiscussion) {
      toast.error('No discussion selected')
      return
    }

    setReplying(true)
    try {
      const res = await fetch(`${API_BASE}/users/discussions/${selectedDiscussion._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          message: replyText,
          userType: 'tutor',
          studentId: selectedDiscussion.studentId,
          studentUserType: selectedDiscussion.userType
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send reply')

      // Get the newly added message (last message in the array)
      const updatedDiscussion = data.data.discussion
      const newMessage = updatedDiscussion.messages[updatedDiscussion.messages.length - 1]

      // Update selected discussion with new message, preserving enriched fields
      const enrichedUpdatedDiscussion = {
        ...updatedDiscussion,
        studentId: selectedDiscussion.studentId,
        studentName: selectedDiscussion.studentName,
        studentEmail: selectedDiscussion.studentEmail,
        studentPhone: selectedDiscussion.studentPhone,
        userType: selectedDiscussion.userType
      }
      setSelectedDiscussion(enrichedUpdatedDiscussion)

      // Update in discussions list
      setDiscussions(prev =>
        prev.map(d =>
          String(d._id) === String(selectedDiscussion._id)
            ? enrichedUpdatedDiscussion
            : d
        )
      )

      setReplyText('')
      toast.success('Reply sent successfully!')
    } catch (err) {
      console.error('Failed to send reply:', err)
      toast.error(err.message || 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  // Fetch curriculum for selected student
  const fetchCurriculumForStudent = async (student) => {
    setCurriculumLoading(true)
    try {
      let courseData = null
      
      // Find the student's course with curriculum
      if (student.courses && Array.isArray(student.courses)) {
        courseData = student.courses.find(c => c.curriculum?.curriculumId)
      }

      if (!courseData?.curriculum?.curriculumId) {
        setCurriculum(null)
        return
      }

      // Fetch full curriculum data
      const res = await fetch(`${API_BASE}/curriculums/${courseData.curriculum.curriculumId}`, {
        method: 'GET',
        headers: authHeader()
      })

      if (!res.ok) throw new Error('Failed to fetch curriculum')
      const data = await res.json()
      
      // Map item statuses from student data
      const curriculumWithStatus = {
        ...data.data.curriculum,
        items: data.data.curriculum.items?.map(item => ({
          ...item,
          status: courseData.curriculum.itemStatus?.find(
            is => String(is.itemId) === String(item._id)
          )?.status || 'PENDING',
          completedAt: courseData.curriculum.itemStatus?.find(
            is => String(is.itemId) === String(item._id)
          )?.completedAt || null
        })) || []
      }

      setCurriculum(curriculumWithStatus)
    } catch (err) {
      console.error('Failed to load curriculum:', err)
      toast.error('Failed to load curriculum')
      setCurriculum(null)
    } finally {
      setCurriculumLoading(false)
    }
  }

  // Mark curriculum item as complete
  const handleMarkItemComplete = async (itemId) => {
    if (!selectedStudent) return

    setMarkingComplete(itemId)
    try {
      // Find the student's course
      const course = selectedStudent.courses?.find(c => c.curriculum?.curriculumId)
      if (!course) throw new Error('Course not found')

      const res = await fetch(`${API_BASE}/users/${selectedStudent._id}/curriculum/item-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          courseId: course.courseId,
          itemId: itemId,
          status: 'COMPLETED'
        })
      })

      if (!res.ok) throw new Error('Failed to mark item complete')
      
      // Update local curriculum state
      setCurriculum(prev => ({
        ...prev,
        items: prev.items.map(item =>
          String(item._id) === String(itemId)
            ? { ...item, status: 'COMPLETED', completedAt: new Date() }
            : item
        )
      }))

      toast.success('Item marked as complete!')

      // Update selected student in students list
      setSelectedStudent(prev => ({
        ...prev,
        courses: prev.courses.map(c =>
          c.courseId === course.courseId
            ? {
                ...c,
                curriculum: {
                  ...c.curriculum,
                  itemStatus: [
                    ...((c.curriculum.itemStatus || []).filter(
                      is => String(is.itemId) !== String(itemId)
                    )),
                    { itemId, status: 'COMPLETED', completedAt: new Date() }
                  ]
                }
              }
            : c
        )
      }))
    } catch (err) {
      console.error('Failed to mark item complete:', err)
      toast.error('Failed to mark item complete')
    } finally {
      setMarkingComplete(null)
    }
  }

  // Handle student selection
  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setSelectedDiscussion(null)
    fetchCurriculumForStudent(student)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FaSpinner className="text-4xl text-brand-gold animate-spin mx-auto mb-4" />
          <p className="text-secondary text-lg">Loading discussions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
          <FaComment className="text-brand-gold" /> Student Discussions
        </h2>
        <div className="text-sm text-secondary space-y-1">
          <div>
            <span className="font-semibold text-brand-gold">{discussions.length}</span> discussions
          </div>
          <div>
            from <span className="font-semibold text-brand-gold">{students.length}</span> students
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or discussion title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-secondary placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border-2 border-gray-200 h-[600px] overflow-y-auto">
            {students.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4">
                  <FaUser className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-secondary text-sm">No students assigned</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {students.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left p-4 transition-colors hover:bg-gray-50 border-l-4 ${
                      selectedStudent?._id === student._id
                        ? 'bg-indigo-50 border-l-indigo-600'
                        : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FaUser className="text-indigo-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-brand-dark truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-secondary truncate">{student.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Discussions: {student.discussions?.length || 0}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Curriculum & Discussions Detail */}
        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <div className="bg-white rounded-lg border-2 border-gray-200 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <FaUser className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-secondary text-lg">Select a student to view curriculum and discussions</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex flex-col h-[600px]">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white border-b-2 border-indigo-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <p className="text-indigo-100 text-sm mt-1">{selectedStudent.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {/* Curriculum Section */}
                <div className="border-b-2 border-gray-200">
                  <button
                    onClick={() => setShowDiscussions(!showDiscussions)}
                    className="w-full bg-gray-50 p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FaComment className="text-blue-600" />
                      <span className="font-semibold text-brand-dark">Course Curriculum</span>
                    </div>
                    <span className="text-xs text-secondary">
                      {curriculum?.items?.filter(i => i.status === 'COMPLETED').length || 0} / {curriculum?.items?.length || 0} completed
                    </span>
                  </button>

                  {!showDiscussions && (
                    <div className="p-4">
                      {curriculumLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <FaSpinner className="text-2xl text-brand-gold animate-spin" />
                        </div>
                      ) : curriculum && curriculum.items?.length > 0 ? (
                        <div className="space-y-2">
                          {curriculum.items.map((item) => (
                            <div
                              key={item._id}
                              className="border-2 border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-brand-dark">{item.name}</p>
                                  <p className="text-xs text-secondary mt-1 line-clamp-2">{item.description}</p>
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block ${
                                      item.status === 'COMPLETED'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {item.status === 'COMPLETED' ? '✓ Completed' : 'Pending'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleMarkItemComplete(item._id)}
                                  disabled={markingComplete === item._id || item.status === 'COMPLETED'}
                                  className={`px-3 py-1 rounded-lg font-semibold text-sm whitespace-nowrap transition-all disabled:opacity-50 ${
                                    item.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-700 cursor-default'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  {markingComplete === item._id ? (
                                    <FaSpinner className="inline animate-spin" />
                                  ) : item.status === 'COMPLETED' ? (
                                    'Done'
                                  ) : (
                                    'Mark Complete'
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-secondary text-sm">No curriculum assigned</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Discussions Section */}
                <div>
                  <button
                    onClick={() => setShowDiscussions(!showDiscussions)}
                    className="w-full bg-gray-50 p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FaComment className="text-purple-600" />
                      <span className="font-semibold text-brand-dark">Discussions</span>
                    </div>
                    <span className="text-xs text-secondary">{selectedStudent.discussions?.length || 0}</span>
                  </button>

                  {showDiscussions && (
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                      {selectedStudent.discussions?.length > 0 ? (
                        selectedStudent.discussions.map((discussion) => (
                          <div
                            key={discussion._id}
                            onClick={() => {
                              const enrichedDiscussion = {
                                ...discussion,
                                studentId: selectedStudent._id,
                                studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
                                studentEmail: selectedStudent.email,
                                studentPhone: selectedStudent.phone,
                                userType: selectedStudent.userType || 'student'
                              }
                              setSelectedDiscussion(enrichedDiscussion)
                            }}
                            className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                              selectedDiscussion?._id === discussion._id
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <p className="font-semibold text-sm text-brand-dark line-clamp-2">{discussion.title}</p>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold inline-block mt-2">
                              {discussion.messages?.length || 0} messages
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-secondary text-sm">No discussions yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discussion Messages Modal-like view */}
      {selectedDiscussion && (
        <div className="mt-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex flex-col max-h-96">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white border-b-2 border-purple-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{selectedDiscussion.title}</h3>
                  <p className="text-purple-100 text-sm mt-1">Thread from {selectedDiscussion.studentName}</p>
                </div>
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedDiscussion.messages && selectedDiscussion.messages.length > 0 ? (
                selectedDiscussion.messages.map((msg, idx) => (
                  <div
                    key={msg._id || idx}
                    className={`flex ${msg.senderType === 'tutor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg ${
                        msg.senderType === 'tutor'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-brand-dark'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderType === 'tutor' ? 'text-purple-200' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 text-sm">No messages yet</div>
              )}
            </div>

            {/* Reply Input */}
            <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows="2"
                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 resize-none"
                  disabled={replying}
                />
                <button
                  onClick={handleSendReply}
                  disabled={replying || !replyText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
                >
                  {replying ? (
                    <>
                      <FaSpinner className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
