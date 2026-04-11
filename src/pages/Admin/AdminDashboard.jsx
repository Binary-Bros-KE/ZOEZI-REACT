import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout/AdminLayout';
import toast from 'react-hot-toast';
import { FaUsers, FaFileAlt, FaGraduationCap, FaMoneyBillWave, FaUserTie } from 'react-icons/fa';
import { IoStatsChartSharp } from 'react-icons/io5';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/students/dashboard/stats`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stats');
      }

      setStats(data.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-4 rounded-full animate-spin" style={{ borderTopColor: '#d4a644' }}></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold" style={{ color: '#2b2520' }}>
            📊 Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's your school's overview.</p>
        </div>

        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Applications Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4" style={{ borderColor: '#d4a644' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Applications</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#2b2520' }}>
                  {stats?.applications.total || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#d4a64420' }}>
                <FaFileAlt size={28} style={{ color: '#d4a644' }} />
              </div>
            </div>
          </div>

          {/* Students Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4" style={{ borderColor: '#2b8a3e' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Active Students</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#2b2520' }}>
                  {stats?.students.total || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#2b8a3e20' }}>
                <FaUsers size={28} style={{ color: '#2b8a3e' }} />
              </div>
            </div>
          </div>

          {/* Alumni Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4" style={{ borderColor: '#1976d2' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Graduated Alumni</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#2b2520' }}>
                  {stats?.alumni.total || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#1976d220' }}>
                <FaGraduationCap size={28} style={{ color: '#1976d2' }} />
              </div>
            </div>
          </div>

          {/* Fee Collected Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4" style={{ borderColor: '#f57c00' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Fees Collected</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#2b2520' }}>
                  KES {(stats?.students.feeCollected || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f57c0020' }}>
                <FaMoneyBillWave size={28} style={{ color: '#f57c00' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Application Status & Conversion Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Application Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2b2520' }}>
              Application Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Pending</span>
                <span className="text-2xl font-bold" style={{ color: '#f57c00' }}>
                  {stats?.applications.pending || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${stats?.applications.total > 0 ? (stats.applications.pending / stats.applications.total) * 100 : 0}%`,
                    backgroundColor: '#f57c00'
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-semibold text-gray-600">Accepted</span>
                <span className="text-2xl font-bold" style={{ color: '#2b8a3e' }}>
                  {stats?.applications.accepted || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${stats?.applications.total > 0 ? (stats.applications.accepted / stats.applications.total) * 100 : 0}%`,
                    backgroundColor: '#2b8a3e'
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-semibold text-gray-600">Rejected</span>
                <span className="text-2xl font-bold" style={{ color: '#d32f2f' }}>
                  {stats?.applications.rejected || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${stats?.applications.total > 0 ? (stats.applications.rejected / stats.applications.total) * 100 : 0}%`,
                    backgroundColor: '#d32f2f'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2b2520' }}>
              Key Metrics
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#d4a64420' }}>
                <div className="flex items-center gap-3">
                  <IoStatsChartSharp size={24} style={{ color: '#d4a644' }} />
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold" style={{ color: '#2b2520' }}>
                      {stats?.conversionRate || 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: '#2b8a3e20' }}>
                <div className="flex items-center gap-3">
                  <FaMoneyBillWave size={24} style={{ color: '#2b8a3e' }} />
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Fee Completion</p>
                    <p className="text-2xl font-bold" style={{ color: '#2b2520' }}>
                      {stats?.students.feeCompletionPercent || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2b2520' }}>
              Fee Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#f5f5f3' }}>
                <span className="text-sm font-semibold text-gray-600">Total Expected</span>
                <span className="font-bold" style={{ color: '#2b2520' }}>
                  KES {
                    (stats?.students.byCourse?.reduce((sum, c) => sum + (c.totalFee || 0), 0) || 0).toLocaleString()
                  }
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#2b8a3e20' }}>
                <span className="text-sm font-semibold text-gray-600">Total Collected</span>
                <span className="font-bold" style={{ color: '#2b8a3e' }}>
                  KES {(stats?.students.feeCollected || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#d32f2f20' }}>
                <span className="text-sm font-semibold text-gray-600">Outstanding</span>
                <span className="font-bold" style={{ color: '#d32f2f' }}>
                  KES {
                    (
                      (stats?.students.byCourse?.reduce((sum, c) => sum + (c.totalFee || 0), 0) || 0) -
                      (stats?.students.feeCollected || 0)
                    ).toLocaleString()
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gender Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2b2520' }}>
              👥 Gender Distribution
            </h3>
            <div className="space-y-3">
              {stats?.students.byGender && stats.students.byGender.length > 0 ? (
                stats.students.byGender.map((gender, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-700">{gender._id || 'Unknown'}</span>
                      <span className="text-sm font-bold" style={{ color: '#d4a644' }}>
                        {gender.count} students
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${stats?.students.total > 0 ? (gender.count / stats.students.total) * 100 : 0}%`,
                          backgroundColor: '#d4a644'
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No data available</p>
              )}
            </div>
          </div>

          {/* Training Mode */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2b2520' }}>
              📚 Training Mode Distribution
            </h3>
            <div className="space-y-3">
              {stats?.students.byTrainingMode && stats.students.byTrainingMode.length > 0 ? (
                stats.students.byTrainingMode.map((mode, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-700">{mode._id || 'Unknown'}</span>
                      <span className="text-sm font-bold" style={{ color: '#2b8a3e' }}>
                        {mode.count} students
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${stats?.students.total > 0 ? (mode.count / stats.students.total) * 100 : 0}%`,
                          backgroundColor: '#2b8a3e'
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Courses Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#2b2520' }}>
            🎓 Course Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #d4a644' }}>
                  <th className="text-left py-3 px-4 font-bold" style={{ color: '#2b2520' }}>Course</th>
                  <th className="text-center py-3 px-4 font-bold" style={{ color: '#2b2520' }}>Students</th>
                  <th className="text-center py-3 px-4 font-bold" style={{ color: '#2b2520' }}>Total Fee</th>
                  <th className="text-center py-3 px-4 font-bold" style={{ color: '#2b2520' }}>Collected</th>
                  <th className="text-center py-3 px-4 font-bold" style={{ color: '#2b2520' }}>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {stats?.students.byCourse && stats.students.byCourse.length > 0 ? (
                  stats.students.byCourse.map((course, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td className="py-3 px-4 font-semibold">{course._id || 'Unknown'}</td>
                      <td className="text-center py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#d4a644' }}>
                          {course.count}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">KES {(course.totalFee || 0).toLocaleString()}</td>
                      <td className="text-center py-3 px-4" style={{ color: '#2b8a3e' }}>
                        KES {(course.totalPaid || 0).toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4" style={{ color: '#d32f2f' }}>
                        KES {(Math.max(0, (course.totalFee || 0) - (course.totalPaid || 0))).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-600">
                      No course data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
