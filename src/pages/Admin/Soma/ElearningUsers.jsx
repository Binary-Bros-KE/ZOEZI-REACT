import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaEye, FaSearch, FaFilter, FaSort, FaUserGraduate, FaBook, FaCalendarCheck, FaPercentage, FaCertificate, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import AdminLayout from '../AdminLayout/AdminLayout';
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const ITEMS_PER_PAGE = 20;

export default function ElearningUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'name', 'progress'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter]);

  // Filter and sort users when filters change
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      result = result.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery) ||
        user.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'progress':
          return (b.stats?.averageProgress || 0) - (a.stats?.averageProgress || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, sortBy, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : ''
      });

      const response = await fetch(`${API_BASE_URL}/users/admin/list?${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.data.users);
      setFilteredUsers(data.data.users);
      setTotalPages(data.data.pagination.pages);
      
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user details');
      }

      setSelectedUser(data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Fetch details error:', error);
      toast.error(error.message || 'Failed to load user details');
    } finally {
      setModalLoading(false);
    }
  };

  const openUserModal = (user) => {
    fetchUserDetails(user._id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriptionStatus = (user) => {
    if (!user.subscription) return 'No subscription';
    return user.subscription.active ? 'Active' : 'Inactive';
  };

  const getSubscriptionColor = (user) => {
    if (!user.subscription) return 'gray';
    return user.subscription.active ? 'green' : 'red';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className='flex gap-2 mb-4 flex-wrap'>
            <Link
              className='bg-primary-gold text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-yellow transition-colors'
              to="/admin/students">
              Students
            </Link>
            <Link
              className='bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors'
              to="/admin/applications">
              Applications
            </Link>
            <Link
              className='bg-green-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors'
              to="/admin/admissions">
              Admissions
            </Link>
            <Link
              className='bg-red-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-500 transition-colors'
              to="/admin/update-fee">
              Update Fee
            </Link>
            <Link
              className='bg-purple-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-500 transition-colors'
              to="/admin/details">
              Details
            </Link>
            <Link
              className='bg-indigo-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-500 transition-colors border-2 border-indigo-600'
              to="/admin/elearning-users">
              E-Learning Users
            </Link>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2b2520' }}>
            🎓 E-Learning Users Management
          </h2>
          <p className="text-sm text-gray-600">Manage and monitor all e-learning platform users</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <FaUserGraduate className="text-3xl text-primary-gold" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.subscription?.active).length}
                </p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold">
                  {users.reduce((sum, user) => sum + (user.stats?.totalCourses || 0), 0)}
                </p>
              </div>
              <FaBook className="text-3xl text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Progress</p>
                <p className="text-2xl font-bold">
                  {users.length > 0 
                    ? Math.round(users.reduce((sum, user) => sum + (user.stats?.averageProgress || 0), 0) / users.length)
                    : 0}%
                </p>
              </div>
              <FaPercentage className="text-3xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex gap-3">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === 'all' ? 'bg-primary-gold text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All Users
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === 'active' ? 'bg-primary-gold text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Active Subscriptions
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === 'inactive' ? 'bg-primary-gold text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Inactive
              </button>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none bg-white"
                  style={{ borderColor: '#d4a644' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="progress">Progress (High to Low)</option>
                </select>
              </div>
              
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors"
              style={{ borderColor: '#d4a644' }}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Courses & Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profilePicture?.url || 'https://via.placeholder.com/100'}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined: {formatDate(user.createdAt)}
                            </div>
                            {user.admissionNumber && (
                              <div className="text-xs text-gray-400">
                                ID: {user.admissionNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getSubscriptionColor(user) === 'green' 
                            ? 'bg-green-100 text-green-800'
                            : getSubscriptionColor(user) === 'red'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getSubscriptionStatus(user)}
                        </div>
                        {user.subscription?.expiryDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {formatDate(user.subscription.expiryDate)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Courses: {user.stats?.totalCourses || 0}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              Active: {user.stats?.activeCourses || 0}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              Certified: {user.stats?.certifiedCourses || 0}
                            </span>
                          </div>
                          {user.stats?.averageProgress !== undefined && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className={`font-medium ${getProgressColor(user.stats.averageProgress)}`}>
                                  Avg. Progress: {user.stats.averageProgress}%
                                </span>
                                <span>{user.stats.averageProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressBgColor(user.stats.averageProgress)}`}
                                  style={{ width: `${Math.min(user.stats.averageProgress, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openUserModal(user)}
                          className="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                          <FaEye /> View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum 
                            ? 'bg-primary-gold text-white' 
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-999">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b" style={{ backgroundColor: '#f5f5f3' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUser?.profilePicture?.url || 'https://via.placeholder.com/100'}
                    alt={`${selectedUser?.firstName} ${selectedUser?.lastName}`}
                    className="w-16 h-16 rounded-lg object-cover border-2"
                    style={{ borderColor: '#d4a644' }}
                  />
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#2b2520' }}>
                      {selectedUser?.firstName} {selectedUser?.lastName}
                    </h3>
                    <p className="text-gray-600">User Details</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <h4 className="md:col-span-2 text-lg font-semibold text-gray-800 mb-2">Personal Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-gray-900">{selectedUser?.dob ? formatDate(selectedUser.dob) : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedUser?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedUser?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">ID Number</label>
                      <p className="text-gray-900">{selectedUser?.idNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Admission Number</label>
                      <p className="text-gray-900">{selectedUser?.admissionNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{selectedUser?.currentLocation || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Joined Date</label>
                      <p className="text-gray-900">{formatDate(selectedUser?.createdAt)}</p>
                    </div>
                  </div>

                  {/* Next of Kin */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <p className="text-gray-900">{selectedUser?.nextOfKinName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Relationship</label>
                        <p className="text-gray-900">{selectedUser?.nextOfKinRelationship || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900">{selectedUser?.nextOfKinPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Information */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Subscription Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser?.subscription?.active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getSubscriptionStatus(selectedUser)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Years Subscribed</label>
                        <p className="text-gray-900">{selectedUser?.subscription?.yearsSubscribed || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Expiry Date</label>
                        <p className="text-gray-900">{formatDate(selectedUser?.subscription?.expiryDate) || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Auto Renew</label>
                        <p className="text-gray-900">
                          {selectedUser?.subscription?.autoRenew ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Courses */}
                  {selectedUser?.courses && selectedUser.courses.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Enrolled Courses</h4>
                      {selectedUser.courses.map((course, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h5 className="font-semibold text-gray-900">{course.name}</h5>
                              <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                <span>Enrolled: {formatDate(course.enrolledAt)}</span>
                                <span>Status: 
                                  <span className={`ml-1 ${
                                    course.certificationStatus === 'CERTIFIED' || course.certificationStatus === 'GRADUATED'
                                      ? 'text-green-600'
                                      : course.assignmentStatus === 'ASSIGNED'
                                      ? 'text-blue-600'
                                      : 'text-yellow-600'
                                  }`}>
                                    {course.certificationStatus || course.assignmentStatus}
                                  </span>
                                </span>
                                {course.certificationDate && (
                                  <span className="text-green-600">
                                    Certified: {formatDate(course.certificationDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getProgressColor(course.progress?.percentage || 0)}`}>
                                {course.progress?.percentage || 0}%
                              </div>
                              <div className="text-sm text-gray-500">
                                {course.progress?.completed || 0}/{course.progress?.total || 0} items
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div 
                              className={`h-2 rounded-full ${getProgressBgColor(course.progress?.percentage || 0)}`}
                              style={{ width: `${Math.min(course.progress?.percentage || 0, 100)}%` }}
                            ></div>
                          </div>
                          
                          {/* Course Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="font-medium text-gray-700">Tutor:</label>
                              <p className="text-gray-900">
                                {course.tutor?.name || 'Not assigned'}
                                {course.tutor?.email && ` (${course.tutor.email})`}
                              </p>
                            </div>
                            <div>
                              <label className="font-medium text-gray-700">Group:</label>
                              <p className="text-gray-900">
                                {course.assignedGroup?.groupName || 'Not assigned'}
                              </p>
                            </div>
                            {course.exams && course.exams.length > 0 && (
                              <div className="md:col-span-2">
                                <label className="font-medium text-gray-700">Exams:</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {course.exams.map((exam, idx) => (
                                    <span 
                                      key={idx}
                                      className={`px-2 py-1 rounded text-xs ${
                                        exam.grade === 'Distinction' ? 'bg-purple-100 text-purple-800' :
                                        exam.grade === 'Merit' ? 'bg-blue-100 text-blue-800' :
                                        exam.grade === 'Credit' ? 'bg-green-100 text-green-800' :
                                        exam.grade === 'Pass' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {exam.examName}: {exam.grade}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {course.gpa > 0 && (
                              <div>
                                <label className="font-medium text-gray-700">GPA:</label>
                                <p className="text-gray-900">{course.gpa.toFixed(2)}</p>
                              </div>
                            )}
                            {course.finalGrade && (
                              <div>
                                <label className="font-medium text-gray-700">Final Grade:</label>
                                <p className="text-gray-900">{course.finalGrade}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CPD Records */}
                  {selectedUser?.cpdRecords && selectedUser.cpdRecords.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">CPD Records</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left">Year</th>
                              <th className="px-3 py-2 text-left">Date Taken</th>
                              <th className="px-3 py-2 text-left">Result</th>
                              <th className="px-3 py-2 text-left">Score</th>
                              <th className="px-3 py-2 text-left">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUser.cpdRecords.map((record, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-3 py-2">{record.year}</td>
                                <td className="px-3 py-2">{formatDate(record.dateTaken)}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    record.result === 'pass' 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {record.result.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-3 py-2">{record.score || 'N/A'}</td>
                                <td className="px-3 py-2">{record.remarks || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg font-semibold border-2"
                  style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}