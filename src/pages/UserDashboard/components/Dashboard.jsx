import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  FaUserGraduate, FaBook, FaCalendarAlt, FaUsers, 
  FaChartLine, FaCertificate, FaClock, FaCheckCircle,
  FaExclamationTriangle, FaArrowRight, FaDownload,
  FaStar, FaFileAlt, FaCommentDots, FaMoneyBillWave,
  FaUserCheck, FaUserTimes, FaBrain, FaCalendarCheck,
  FaGraduationCap, FaUserFriends, FaChalkboardTeacher,
  FaTasks, FaCalendarDay, FaHistory, FaAward
} from 'react-icons/fa'

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('overview')
  
  const API = import.meta.env.VITE_SERVER_URL
  const userType = localStorage.getItem('userType')

  useEffect(() => {
    fetchDashboardMetrics()
  }, [])

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API}/users/dashboard/metrics?userType=${userType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      if (data.status === 'success') {
        setMetrics(data.data)
      } else {
        toast.error(data.message || 'Failed to load dashboard')
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Student Dashboard Components
  const StudentDashboard = () => {
    if (!metrics) return null

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {metrics.profile.name}!
              </h1>
              <p className="opacity-90">
                {metrics.summary.daysSinceJoin > 0 
                  ? `You've been learning with us for ${metrics.summary.daysSinceJoin} days`
                  : 'Welcome to your learning journey!'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                Student ID: {metrics.profile.admissionNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                <p className="text-3xl font-bold text-blue-600">
                  {metrics.summary.activeCourses}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaBook className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Progress</p>
                <p className="text-3xl font-bold text-green-600">
                  {metrics.summary.averageCompletion}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaChartLine className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Exams</p>
                <p className="text-3xl font-bold text-orange-600">
                  {metrics.summary.totalExams}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaCertificate className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average GPA</p>
                <p className="text-3xl font-bold text-purple-600">
                  {metrics.summary.averageScore}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaStar className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Progress */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaBook /> My Courses Progress
            </h2>
            <span className="text-sm text-gray-600">
              {metrics.courses.length} total courses
            </span>
          </div>

          <div className="space-y-4">
            {metrics.courses.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{course.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        course.certificationStatus === 'CERTIFIED' || course.certificationStatus === 'GRADUATED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {course.certificationStatus === 'CERTIFIED' || course.certificationStatus === 'GRADUATED'
                          ? '✅ Certified'
                          : '📚 In Progress'}
                      </span>
                      <span className="text-xs text-gray-600">
                        {course.totalAssignments} assignments • {course.pendingAssignments} pending
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{course.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      {course.nextLesson ? (
                        <div className="text-xs">
                          <p className="text-gray-600">Next: {course.nextLesson.name}</p>
                          <p className="text-gray-500">
                            {course.nextLesson.releaseDate 
                              ? new Date(course.nextLesson.releaseDate).toLocaleDateString()
                              : 'Soon'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No upcoming lessons</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {metrics.upcomingDeadlines.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaCalendarAlt /> Upcoming Deadlines
            </h2>
            <div className="space-y-3">
              {metrics.upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaClock className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{deadline.lesson.name}</p>
                      <p className="text-sm text-gray-600">{deadline.courseName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {deadline.daysLeft > 0 
                        ? `in ${deadline.daysLeft} day${deadline.daysLeft > 1 ? 's' : ''}`
                        : 'Today'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {deadline.lesson.releaseDate && deadline.lesson.releaseTime
                        ? new Date(`${deadline.lesson.releaseDate}T${deadline.lesson.releaseTime}`).toLocaleString()
                        : 'Release date not set'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Tutor Dashboard Components
  const TutorDashboard = () => {
    if (!metrics) return null

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome, Tutor {metrics.profile.name}!
              </h1>
              <p className="opacity-90">
                {metrics.summary.daysSinceJoin > 0 
                  ? `You've been teaching with us for ${metrics.summary.daysSinceJoin} days`
                  : 'Welcome to our teaching team!'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                {metrics.profile.role}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {metrics.summary.totalStudents}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <FaUsers className="text-indigo-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Groups</p>
                <p className="text-3xl font-bold text-green-600">
                  {metrics.summary.totalGroups}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaUserFriends className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Responses</p>
                <p className="text-3xl font-bold text-orange-600">
                  {metrics.summary.pendingResponses}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaCommentDots className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Completion</p>
                <p className="text-3xl font-bold text-purple-600">
                  {metrics.summary.averageCompletion}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Groups Overview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaChalkboardTeacher /> My Teaching Groups
            </h2>
            <span className="text-sm text-gray-600">
              {metrics.groups.length} total groups
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.groups.map((group, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 truncate">{group.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {group.studentCount} students
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{group.courseName}</p>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Course Progress</span>
                      <span className="font-semibold">{group.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${group.completionRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{group.completedItems}/{group.totalItems} items</span>
                    <span>{group.recentActivity} recent activities</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {metrics.recentActivity.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaHistory /> Recent Group Activity
            </h2>
            <div className="space-y-3">
              {metrics.recentActivity.map((group, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCommentDots className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{group.name}</p>
                      <p className="text-sm text-gray-600">{group.courseName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {group.recentActivity} new {group.recentActivity === 1 ? 'activity' : 'activities'}
                    </p>
                    <p className="text-xs text-gray-500">Last 7 days</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaAward /> Certification Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Certified Students</span>
                <span className="font-bold text-indigo-600">{metrics.certifiedStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Active Students</span>
                <span className="font-bold text-green-600">{metrics.summary.activeStudents}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaTasks /> Action Required
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Pending Responses</span>
                <span className={`font-bold ${metrics.summary.pendingResponses > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {metrics.summary.pendingResponses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Groups Created</span>
                <span className="font-bold text-blue-600">{metrics.summary.totalGroups}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Alumni Dashboard Components
  const AlumniDashboard = () => {
    if (!metrics) return null

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {metrics.profile.name}!
              </h1>
              <p className="opacity-90">
                {metrics.summary.graduationYear 
                  ? `Zoezi Alumni since ${metrics.summary.graduationYear}`
                  : 'Zoezi School Alumni'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                {metrics.profile.qualification}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Practice Status</p>
                <p className="text-xl font-bold text-emerald-600 capitalize">
                  {metrics.profile.practiceStatus?.replace('_', ' ') || 'Not set'}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <FaUserGraduate className="text-emerald-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Subscription Status</p>
                <p className={`text-xl font-bold ${
                  metrics.subscription.profileActive ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {metrics.subscription.profileActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaMoneyBillWave className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">CPD Status</p>
                <p className={`text-xl font-bold ${
                  metrics.cpd.status === 'pass' ? 'text-green-600' : 
                  metrics.cpd.status === 'fail' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metrics.cpd.status === 'pass' ? 'Passed' : 
                   metrics.cpd.status === 'fail' ? 'Failed' : 'Not Taken'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaBrain className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Practice Duration</p>
                <p className="text-xl font-bold text-indigo-600">
                  {metrics.summary.practiceDuration || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <FaCalendarCheck className="text-indigo-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaUserGraduate /> Professional Profile
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Course Completed</p>
                  <p className="font-medium text-gray-800">{metrics.profile.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Location</p>
                  <p className="font-medium text-gray-800">{metrics.profile.currentLocation || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Practicing Since</p>
                  <p className="font-medium text-gray-800">
                    {metrics.profile.practicingSince 
                      ? new Date(metrics.profile.practicingSince).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Graduation Year</p>
                  <p className="font-medium text-gray-800">{metrics.summary.graduationYear || 'N/A'}</p>
                </div>
              </div>
              
              {metrics.profile.bio && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Professional Bio</p>
                  <p className="text-gray-700">{metrics.profile.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-gradient-to-b from-emerald-50 to-teal-50 rounded-xl shadow-md p-6 border border-emerald-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaCheckCircle /> Status Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    metrics.subscription.profileActive ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <FaMoneyBillWave className={
                      metrics.subscription.profileActive ? 'text-green-600' : 'text-orange-600'
                    } />
                  </div>
                  <div>
                    <p className="font-medium">Annual Subscription</p>
                    <p className="text-sm text-gray-600">{metrics.subscription.currentYear}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  metrics.subscription.profileActive 
                    ? 'bg-green-100 text-green-800'
                    : metrics.subscription.needsRenewal
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {metrics.subscription.profileActive ? 'Active' : 
                   metrics.subscription.needsRenewal ? 'Expired' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    metrics.cpd.status === 'pass' ? 'bg-green-100' : 
                    metrics.cpd.status === 'fail' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <FaBrain className={
                      metrics.cpd.status === 'pass' ? 'text-green-600' : 
                      metrics.cpd.status === 'fail' ? 'text-red-600' : 'text-gray-600'
                    } />
                  </div>
                  <div>
                    <p className="font-medium">CPD Record</p>
                    <p className="text-sm text-gray-600">{metrics.cpd.currentYear}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  metrics.cpd.status === 'pass' 
                    ? 'bg-green-100 text-green-800'
                    : metrics.cpd.status === 'fail'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {metrics.cpd.status === 'pass' ? 'Passed' : 
                   metrics.cpd.status === 'fail' ? 'Failed' : 'Not Taken'}
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total CPD Records</p>
                  <p className="text-2xl font-bold text-emerald-600">{metrics.summary.totalCpdRecords}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CPD History */}
        {metrics.cpdHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaHistory /> CPD History
            </h2>
            <div className="space-y-3">
              {metrics.cpdHistory.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      record.result === 'pass' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {record.result === 'pass' 
                        ? <FaCheckCircle className="text-green-600" />
                        : <FaExclamationTriangle className="text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">CPD Exam {record.year}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(record.dateTaken).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      record.result === 'pass' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.result === 'pass' ? 'PASSED' : 'FAILED'}
                    </p>
                    {record.score && (
                      <p className="text-xs text-gray-500">Score: {record.score}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-gold border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // No Data State
  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Dashboard Data</h2>
          <p className="text-gray-600 mb-6">Unable to load your dashboard metrics.</p>
          <button
            onClick={fetchDashboardMetrics}
            className="px-6 py-3 bg-primary-gold text-white rounded-lg hover:opacity-90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Main Dashboard Render
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {userType === 'student' ? '📚 Student Dashboard' :
               userType === 'tutor' ? '👨‍🏫 Tutor Dashboard' :
               '🎓 Alumni Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
              {userType === 'student' ? 'Track your learning progress and achievements' :
               userType === 'tutor' ? 'Monitor your classes and student performance' :
               'Manage your professional profile and CPD records'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardMetrics}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <FaHistory size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {userType === 'student' && <StudentDashboard />}
        {userType === 'tutor' && <TutorDashboard />}
        {userType === 'alumni' && <AlumniDashboard />}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Data last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

export default Dashboard