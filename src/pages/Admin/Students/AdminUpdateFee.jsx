import React, { useState, useEffect } from 'react';
import { FaUsers, FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { EnhancedUpdateFeeModal } from '../components/EnhancedUpdateFeeModal';
import AdminLayout from "../AdminLayout/AdminLayout"
import { Link } from "react-router-dom"

const AdminUpdateFee = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, skip: 0 });

  // Fetch students on component mount or pagination change
  useEffect(() => {
    fetchStudents();
  }, [pagination.skip]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        limit: pagination.limit,
        skip: pagination.skip,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/students?${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      setStudents(data.data.students);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Fetch students error:', error);
      toast.error(error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, skip: 0 });
    fetchStudents();
  };

  // Calculate statistics
  const stats = {
    totalStudents: pagination.total,
    expectedFee: students.reduce((sum, student) => sum + (student.courseFee || 0), 0),
    collectedFee: students.reduce((sum, student) => sum + (student.upfrontFee || 0), 0),
    pendingFee: students.reduce((sum, student) => {
      const balance = Math.max(0, (student.courseFee || 0) - (student.upfrontFee || 0));
      return sum + balance;
    }, 0)
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);
  };

  const handleUpdateFee = (student) => {
    setSelectedStudent(student);
    setFeeModalOpen(true);
  };

  const handleFeeUpdateSuccess = () => {
    fetchStudents();
  };

  const getBalanceColor = (student) => {
    const balance = Math.max(0, (student.courseFee || 0) - (student.upfrontFee || 0));
    if (balance === 0) return 'text-green-600';
    if (balance > 50000) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2b2520' }}>
            💰 Fee Management
          </h2>
          <p className="text-sm text-gray-600 mb-4">Manage student upfront payments and track balances</p>
          <div className='flex gap-2'>
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Students */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4" style={{ borderColor: '#d4a644' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Students</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#2b2520' }}>
                  {stats.totalStudents}
                </p>
              </div>
              <FaUsers size={40} style={{ color: '#d4a644', opacity: 0.2 }} />
            </div>
          </div>

          {/* Expected Fee */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4" style={{ borderColor: '#c9952f' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Expected Fee</p>
                <p className="text-2xl font-bold mt-2 text-green-600">
                  100 %
                </p>
                <p className="text-md text-gray-500 mt-1 font-bold">
                  KES {(stats.expectedFee).toLocaleString()}
                </p>
              </div>
              <FaMoneyBillWave size={40} style={{ color: '#c9952f', opacity: 0.2 }} />
            </div>
          </div>

          {/* Collected Fee */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Collected Fee</p>
                <p className="text-2xl font-bold mt-2 text-green-600">
                  {((stats.collectedFee / stats.expectedFee) * 100).toFixed(2)} %
                </p>
                <p className="text-md text-gray-500 mt-1 font-bold">
                  KES {(stats.collectedFee).toLocaleString()}
                </p>
              </div>
              <FaCheckCircle size={40} style={{ color: '#2b8a3e', opacity: 0.2 }} />
            </div>
          </div>

          {/* Pending Fee */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending Fee</p>
                <p className="text-2xl font-bold mt-2 text-red-600">
                  {((stats.pendingFee / stats.expectedFee) * 100).toFixed(2)} %
                </p>
                <p className="text-md text-gray-500 mt-1 font-bold">
                  KES {(stats.pendingFee).toLocaleString()}
                </p>
              </div>
              <FaClock size={40} style={{ color: '#d32f2f', opacity: 0.2 }} />
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
              style={{
                borderColor: '#d4a644'
              }}
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: '#d4a644' }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No students found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#2b2520' }}>
                      <th className="px-6 py-4 text-left text-white font-semibold">Student</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Course</th>
                      <th className="px-6 py-4 text-right text-white font-semibold">Course Fee</th>
                      <th className="px-6 py-4 text-right text-white font-semibold">Upfront Paid</th>
                      <th className="px-6 py-4 text-right text-white font-semibold">Balance Due</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => {
                      const balance = Math.max(0, (student.courseFee || 0) - (student.upfrontFee || 0));
                      return (
                        <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {student.profilePicture && (
                                <img
                                  src={student.profilePicture}
                                  alt={student.firstName}
                                  className="w-10 h-10 rounded-full object-cover border"
                                  style={{ borderColor: '#d4a644' }}
                                />
                              )}
                              <div>
                                <p className="font-semibold" style={{ color: '#2b2520' }}>
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-gray-500">Adm: {student.admissionNumber}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{student.course || 'N/A'}</td>
                          <td className="px-6 py-4 text-right font-semibold" style={{ color: '#d4a644' }}>
                            KES {(student.courseFee || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-green-600">
                            KES {(student.upfrontFee || 0).toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${getBalanceColor(student)}`}>
                            KES {balance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2 justify-center">
                              <button
                                onClick={() => handleViewDetails(student)}
                                className="px-3 py-1 border border-primary-gold text-primary-gold rounded-lg text-sm font-semibold transition-colors cursor-pointer hover:bg-primary-gold hover:text-white transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleUpdateFee(student)}
                                className="px-3 py-1 bg-blue-600 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer"
                              >
                                Update
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t" style={{ borderColor: '#d4a644' }}>
                <p className="text-sm text-gray-600">
                  Showing {Math.min(pagination.skip + 1, pagination.total)} to{' '}
                  {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} students
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, skip: Math.max(0, pagination.skip - pagination.limit) })}
                    disabled={pagination.skip === 0}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: pagination.skip === 0 ? '#ccc' : '#d4a644',
                      color: 'white'
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, skip: pagination.skip + pagination.limit })}
                    disabled={pagination.skip + pagination.limit >= pagination.total}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: pagination.skip + pagination.limit >= pagination.total ? '#ccc' : '#d4a644',
                      color: 'white'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modals */}
        <StudentDetailModal
          student={selectedStudent}
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
        />
        <EnhancedUpdateFeeModal
          student={selectedStudent}
          isOpen={feeModalOpen}
          onClose={() => setFeeModalOpen(false)}
          onSuccess={handleFeeUpdateSuccess}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUpdateFee;
